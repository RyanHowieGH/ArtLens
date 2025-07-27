// server.js

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const vision = require('@google-cloud/vision');
const axios = require('axios'); // <-- IMPORT AXIOS

// --- SETUP ---
const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });
const visionClient = new vision.ImageAnnotatorClient({
    keyFilename: 'gcp-credentials.json'
});

// --- NEW: OpenAI Function ---
async function getArtDetailsFromOpenAI(artworkName) {
    console.log(`Sending "${artworkName}" to OpenAI for details...`);

    // This is the "prompt" we send to the AI.
    const prompt = `
        An image was identified as "${artworkName}". Please provide information about this artwork.
        1. Identify the official title and the artist.
        2. Provide a concise history of the artwork (around 100 words).
        3. Provide exactly 3 interesting and distinct trivia facts about it.

        Format the entire response as a single, minified JSON object with no line breaks.
        The JSON object must have these exact keys: "title", "artist", "history", "trivia" (which should be an array of strings).
        Example format: {"title":"The Starry Night","artist":"Vincent van Gogh","history":"...","trivia":["fact1","fact2","fact3"]}
    `;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo', // Powerful and cost-effective model
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3, // Makes the output more focused and deterministic
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Your OpenAI key from .env
                    'Content-Type': 'application/json',
                },
            }
        );

        // The AI's response is a string of JSON, so we need to parse it
        const content = response.data.choices[0].message.content;
        console.log('OpenAI raw response:', content);
        return JSON.parse(content);

    } catch (error) {
        console.error('ERROR during OpenAI API call:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get details from OpenAI.');
    }
}


// --- UPDATED: API ENDPOINT ---
app.post('/api/identify', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No image file uploaded.' });
    }
    console.log('Image received. Analyzing with Google Vision...');

    try {
        const imageBuffer = req.file.buffer;
        const [result] = await visionClient.webDetection(imageBuffer);
        const webDetection = result.webDetection;

        let artworkName = 'Unknown Artwork';
        if (webDetection.bestGuessLabels.length > 0) {
            artworkName = webDetection.bestGuessLabels[0].label;
            console.log(`Vision API Best Guess: ${artworkName}`);
        } else {
            // If Vision API fails, we can't proceed
            return res.status(404).json({ success: false, error: 'Could not identify the artwork.' });
        }

        // --- NEW: Call the OpenAI function with the identified name ---
        const artDetails = await getArtDetailsFromOpenAI(artworkName);

        // Send the final, structured data back to the client
        res.json({
            success: true,
            data: artDetails, // This now contains title, artist, history, and trivia
        });

    } catch (error) {
        // This will catch errors from both Vision and OpenAI calls
        console.error('An error occurred in the identify process:', error);
        res.status(500).json({ success: false, error: 'Failed to process the request.' });
    }
});


// --- START SERVER ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});