import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fetch from 'node-fetch'; // npm install node-fetch
import { Queue } from 'bullmq';
import { QdrantVectorStore } from '@langchain/qdrant';
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
    if (!userQuery)
      return res.status(400).json({ error: 'Message query param required' });

    // TODO: Replace this dummy context with real context from your vector store retriever
    const contextDocs = [`Dummy context for query: ${userQuery}`];

    const contextText = contextDocs.join('\n');

    const prompt = `
You are a helpful AI assistant. Use the following context extracted from documents to answer the user's query.

Context:
${contextText}

Question: ${userQuery}

Answer:
`;

    // Use a working Hugging Face model API endpoint here, e.g., "tiiuae/falcon-7b-instruct" or other text-generation model
    const HF_API_URL = 'https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct';
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    const hfResponse = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false,
        },
      }),
    });

    if (!hfResponse.ok) {
      const errorBody = await hfResponse.text();
      throw new Error(`Hugging Face API error: ${hfResponse.status} ${errorBody}`);
    }

    const hfData = await hfResponse.json();

    // Falcon and similar models usually return array with generated_text property
    // Fallback if undefined
    let answer = '';
    if (Array.isArray(hfData) && hfData.length > 0) {
      answer = hfData[0].generated_text ?? '';
      // Remove the prompt from the generated text if it is included
      if (answer.startsWith(prompt)) {
        answer = answer.slice(prompt.length).trim();
      }
    }

    res.json({
      message: answer,
      docs: contextDocs,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on PORT:${PORT}`));
