// artlens-backend/server.js (FINAL, REFINED VERSION)

// --- Imports and setup are the same ---
require('dotenv').config();
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const vision = require('@google-cloud/vision');
const axios = require('axios');
const formidable = require('express-formidable');

const app = express();
app.use(cors());
app.use(formidable());

const visionClient = new vision.ImageAnnotatorClient({
    keyFilename: 'gcp-credentials.json'
});

// --- HELPER FUNCTION 1: Content Generation (No Changes) ---
async function getDetailsForConfidentMatch(artworkName, language = 'en') {
    console.log(`PATH A: Getting details for confident match: "${artworkName}"`);
    const languageMap = { en: 'English', es: 'Spanish', fr: 'French' };
    const targetLanguage = languageMap[language] || 'English';
    const prompt = `Provide information about the artwork "${artworkName}". 1. Confirm the official title and artist. 2. Provide a concise history (around 100 words). 3. Provide 3 trivia facts. 4. Provide a URL for a high-quality thumbnail. Format the response as a single, minified JSON object with keys: "title", "artist", "history", "trivia" (array of strings), and "thumbnailUrl". Respond in ${targetLanguage}.`;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], temperature: 0.3, }, { headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` } });
        const content = response.data.choices[0].message.content;
        return JSON.parse(content.replace(/```json\n?|```/g, ''));
    } catch (error) {
        console.error('ERROR during Text-Only OpenAI call:', error.response ? error.response.data.error : error.message);
        throw new Error('Failed to get details from OpenAI (Text).');
    }
}

// --- HELPER FUNCTION 2: PERPLEXITY VISION FALLBACK (REFINED) ---
// We remove the googleVisionHint parameter as it was causing anchoring bias.
async function getDetailsWithPerplexityVision(imageBuffer, location = null, language = 'en') {
    console.log(`PATH B: Using Perplexity Vision API with image and location only.`);
    if (location) {
        console.log(`  > With location data: ${location.latitude}, ${location.longitude}`);
    }

    const languageMap = { en: 'English', es: 'Spanish', fr: 'French' };
    const targetLanguage = languageMap[language] || 'English';
    const base64Image = imageBuffer.toString('base64');
    
    // The prompt is now cleaner and relies only on the strongest signals.
    const prompt = `
        You are an expert art docent with live web access. Your task is to identify a piece of public art from an image and provide details about it.

        **CONTEXT:**
        - The user's location is approximately: latitude ${location?.latitude || 'N/A'}, longitude ${location?.longitude || 'N/A'}.

        **INSTRUCTIONS:**
        1.  **Analyze and Search:** Use your web search capabilities. Analyze the image and the location data to find the specific title of the mural/artwork and the artist's full name.
        2.  **Generate Content:** Once identified, provide a concise history, 3 interesting trivia facts, and a public URL for a thumbnail image.
        3.  **Format Output:** Respond with ONLY a single, minified JSON object with keys: "title", "artist", "history", "trivia", and "thumbnailUrl". If you cannot confidently identify the artwork, set "title" to "Unknown Artwork".
        4.  **Language:** Provide the entire response in ${targetLanguage}.
    `;

    try {
        const response = await axios.post(
            'https://api.perplexity.ai/chat/completions',
            {
                model: 'sonar-pro',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                    ]
                }],
            },
            {
                headers: { 'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}` },
            }
        );

        const content = response.data.choices[0].message.content.trim();
        console.log('Perplexity Vision Fallback raw response:', content);
        const cleanedContent = content.replace(/```json\n?|```/g, '');
        return JSON.parse(cleanedContent);
    } catch (error) {
        console.error('ERROR during Perplexity Vision Fallback:', error.response ? error.response.data.error : error.message);
        throw new Error('Failed to process image with Perplexity Vision.');
    }
}


// --- Main API Endpoint (REFINED) ---
app.post('/api/identify', async (req, res) => {
    try {
        const { language, latitude, longitude } = req.fields;
        const imageFile = req.files.image;
        if (!imageFile || imageFile.size === 0) { /* ... */ }
        
        console.log('Image received. Starting identification process...');
        const imageBuffer = fs.readFileSync(imageFile.path);
        
        const [visionResult] = await visionClient.webDetection(imageBuffer);
        const webDetection = visionResult.webDetection;
        let bestGuess = null;
        if (webDetection && webDetection.bestGuessLabels.length > 0) {
            bestGuess = webDetection.bestGuessLabels[0].label;
            console.log(`Google Vision Best Guess: "${bestGuess}"`);
        }
        
        const genericTerms = ['art', 'mural', 'painting', 'graffiti', 'sculpture', 'illustration', 'drawing', 'artwork', 'person'];
        const isConfident = bestGuess && !genericTerms.some(term => bestGuess.toLowerCase().includes(term));
        
        let finalArtDetails;

        if (isConfident) {
            finalArtDetails = await getDetailsForConfidentMatch(bestGuess, language);
        } else {
            const locationData = latitude && longitude ? { latitude, longitude } : null;
            // We no longer pass the 'bestGuess' hint to the fallback function.
            finalArtDetails = await getDetailsWithPerplexityVision(imageBuffer, locationData, language);
        }

        if (!finalArtDetails || finalArtDetails.title === "Unknown Artwork" || !finalArtDetails.title) {
             return res.status(404).json({ success: false, error: 'This artwork could not be identified automatically.' });
        }
        
        res.json({ success: true, data: finalArtDetails });
    } catch (error) {
        console.error('An error occurred in the identify process:', error.message);
        res.status(500).json({ success: false, error: 'Failed to process the request.' });
    }
});

// --- Start Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`); });