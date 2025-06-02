import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fetch from 'node-fetch'; // npm install node-fetch
import { Queue } from 'bullmq';
import 'dotenv/config';

const queue = new Queue('file-upload-queue', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  await queue.add(
    'file-ready',
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    })
  );
  res.json({ message: 'uploaded' });
});

app.get('/chat', async (req, res) => {
  try {
    const userQuery = req.query.message;
    if (!userQuery) return res.status(400).json({ error: 'Message query param required' });

    // Dummy placeholder — replace with real vector search result
    const contextDocs = [`Dummy context for query: ${userQuery}`];
    const contextText = contextDocs.join('\n');

    const prompt = `You are a helpful AI assistant. Use the following context extracted from documents to answer the user's query.\n\nContext:\n${contextText}\n\nQuestion: ${userQuery}\n\nAnswer:`;

    const GEMINI_API_KEY = 'AIzaSyAsvuJ4EiX-rM5Vng3xFuJk5ONADl1_2Ro';
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No answer generated.';

    res.json({
      message: answer.trim(),
      docs: contextDocs,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on PORT:${PORT}`));
