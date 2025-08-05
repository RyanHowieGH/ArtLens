// artlens-backend/server.js (FINAL VERSION WITH LOCATION)

// --- Imports ---
require('dotenv').config();
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const vision = require('@google-cloud/vision');
const axios = require('axios');
const formidable = require('express-formidable');

// --- Express App Setup ---
const app = express();
app.use(cors());
app.use(formidable());

const visionClient = new vision.ImageAnnotatorClient({
    keyFilename: 'gcp-credentials.json'
});

// --- HELPER FUNCTION 1: Text-Only GPT (Fast & Cheap Path) ---
async function getArtDetailsFromText(artworkName, language = 'en') {
    console.log(`PATH A: Getting details for "${artworkName}" in language: ${language}`);
    const languageMap = { en: 'English', es: 'Spanish', fr: 'French' };
    const targetLanguage = languageMap[language] || 'English';
    const prompt = `An image was identified as "${artworkName}". Please provide information about this artwork. 1. Identify the official title and the artist. 2. Provide a concise history of the artwork (around 100 words). 3. Provide exactly 3 interesting and distinct trivia facts about it. Format the entire response as a single, minified JSON object with no line breaks. The JSON object must have these exact keys: "title", "artist", "history", "trivia" (which should be an array of strings). Provide the entire response in ${targetLanguage}.`;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], temperature: 0.3, }, { headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` } });
        const content = response.data.choices[0].message.content;
        console.log('OpenAI Text-Only raw response:', content);
        return JSON.parse(content);
    } catch (error) {
        console.error('ERROR during Text-Only OpenAI call:', error.response ? error.response.data.error : error.message);
        throw new Error('Failed to get details from OpenAI (Text).');
    }
}

// --- HELPER FUNCTION 2: GPT Vision (Fallback Path with Location) ---
async function getArtDetailsFromImageWithGPT(imageBuffer, language = 'en', location = null) {
    console.log(`PATH B: Sending image to GPT-4o for analysis in language: ${language}.`);
    if (location) {
      console.log(`  > With location data: ${location.latitude}, ${location.longitude}`);
    }

    const languageMap = { en: 'English', es: 'Spanish', fr: 'French' };
    const targetLanguage = languageMap[language] || 'English';
    const base64Image = imageBuffer.toString('base64');
    
    let prompt = `This is an image of a piece of art. Please identify it. It might be a famous painting or a piece of local/public art.`;
    if (location) {
      prompt += ` The user is currently at approximately latitude ${location.latitude} and longitude ${location.longitude}. Use this geographic context to improve the identification of local art or landmarks.`;
    }
    prompt += ` 1. Identify the official title and the artist (if known). 2. Provide a concise history or context for the artwork (around 100 words). 3. Provide exactly 3 interesting and distinct trivia facts about it. If no trivia is known, provide interesting visual details. Format the entire response as a single, minified JSON object with no line breaks. The JSON object must have these exact keys: "title", "artist", "history", "trivia" (which should be an array of strings). Provide the entire response in ${targetLanguage}.`;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o',
            messages: [{ role: 'user', content: [ { type: 'text', text: prompt }, { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } } ] }],
            max_tokens: 500,
        }, { headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` } });
        const content = response.data.choices[0].message.content;
        console.log('OpenAI Vision raw response:', content);
        const cleanedContent = content.replace(/```json\n?|```/g, '');
        return JSON.parse(cleanedContent);
    } catch (error) {
        console.error('ERROR during GPT Vision call:', error.response ? error.response.data.error : error.message);
        throw new Error('Failed to get details from OpenAI (Vision).');
    }
}

// --- Main API Endpoint with Fallback Logic ---
app.post('/api/identify', async (req, res) => {
    try {
        const { language, latitude, longitude } = req.fields;
        const imageFile = req.files.image;

        if (!imageFile || imageFile.size === 0) {
            return res.status(400).json({ success: false, error: 'No image file uploaded.' });
        }
        console.log('Image received. Starting identification process...');
        const imageBuffer = fs.readFileSync(imageFile.path);
        
        const [visionResult] = await visionClient.webDetection(imageBuffer);
        const webDetection = visionResult.webDetection;
        let bestGuess = null;
        if (webDetection && webDetection.bestGuessLabels.length > 0) {
            bestGuess = webDetection.bestGuessLabels[0].label;
            console.log(`Google Vision Best Guess: "${bestGuess}"`);
        }
        
        const genericTerms = ['art', 'mural', 'painting', 'graffiti', 'sculpture', 'illustration', 'drawing', 'artwork'];
        const isConfident = bestGuess && !genericTerms.some(term => bestGuess.toLowerCase().includes(term));
        let finalArtDetails;

        if (isConfident) {
            finalArtDetails = await getArtDetailsFromText(bestGuess, language);
        } else {
            const locationData = latitude && longitude ? { latitude, longitude } : null;
            finalArtDetails = await getArtDetailsFromImageWithGPT(imageBuffer, language, locationData);
        }
        
        res.json({ success: true, data: finalArtDetails });
    } catch (error) {
        console.error('An error occurred in the identify process:', error.message);
        res.status(500).json({ success: false, error: 'Failed to process the request.' });
    }
});

// --- Start the Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});