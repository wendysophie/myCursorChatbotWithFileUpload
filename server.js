const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

/** Configure multer for handling file uploads */
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and text files are allowed.'));
    }
  }
});

// Initialize Gemini API
const genAI = new GoogleGenerativeAI('AIzaSyDGoUahxXvFYpEQ2rcHIDtR7HsPbF5Zm5w'); // Replace with your API key
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/** POST method route for chat with document support */
app.post("/chat-with-docs", upload.array('documents'), async (req, res) => {
    try {
        const msg = req.body.chat;
        let documentContext = '';

        // Start a new chat without history for now
        const chat = model.startChat();

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (file.mimetype === 'text/plain') {
                    documentContext += file.buffer.toString('utf-8') + '\n';
                }
            }
        }

        const fullPrompt = documentContext ? 
            `Context from uploaded documents:\n${documentContext}\n\nUser message: ${msg}` : 
            msg;

        const result = await chat.sendMessage(fullPrompt);
        const response = await result.response;
        const text = response.text();

        res.send({"text": text});
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).send({ error: error.message });
    }
});

const PORT = 9000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 