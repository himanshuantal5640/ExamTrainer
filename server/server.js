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

// Example API handler
app.post('/api/generate-response', async (req, res) => {
    const { input } = req.body; // Expecting input in the request

    // Normalize user input for easier comparison
    const normalizedInput = input.toLowerCase().trim();
    console.log('Normalized Input:', normalizedInput); // Debugging log

    try {
        // Use GoogleGenAI to generate content based on user input
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: normalizedInput, // Use the normalized input
        });

        // Check if the response is valid
        if (response && response.text) {
            return res.json({
                success: true,
                message: response.text, // Return the generated content
            });
        } else {
            return res.json({
                success: false,
                message: "I'm sorry, I didn't understand that. Can you please rephrase?",
            });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request. Please try again later.',
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
