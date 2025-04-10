require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenAI } = require("@google/genai");

console.log("Before cors declaration");

console.log("After cors declaration");

const app = express();
const port = 3000;

// Enable CORS for the frontend
app.use(cors()); // Allow all origins (not recommended for production)

app.use(bodyParser.json());
app.use(express.static('public'));

// Log the API key for debugging (remove in production)
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);


// Initialize GoogleGenAI with the provided API key
const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define the /api/generate-plan endpoint
app.post('/api/generate-plan', async (req, res) => {
    const userInput = req.body.input;
    console.log('Received input:', userInput);

    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or "gemini-pro"
        const result = await model.generateContent(userInput);
        const response = await result.response;
        const text = await response.text();

        res.json({ plan: text });
    } catch (error) {
        console.error('Error generating study plan:', error.message || error);
        res.status(500).json({ error: 'Failed to generate study plan. Please try again later.' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
