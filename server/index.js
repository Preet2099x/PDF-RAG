import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fetch from 'node-fetch';
import { Queue } from 'bullmq';
import { QdrantVectorStore } from '@langchain/qdrant';
import dotenv from 'dotenv';

dotenv.config();

// Custom HuggingFace embeddings class (same as your worker.js)
class HuggingFaceEmbeddings {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl =
      'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction';
  }

  async embedDocuments(documents) {
    const texts = documents.map((doc) => (doc.pageContent ? doc.pageContent : doc));
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: texts }),
    });
    const vectors = await response.json();
    if (!Array.isArray(vectors)) {
      throw new Error(`Hugging Face API error: ${JSON.stringify(vectors)}`);
    }
    return vectors;
  }

  async embedQuery(text) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    });
    const vector = await response.json();
    if (!Array.isArray(vector)) {
      throw new Error(`Hugging Face API error: ${JSON.stringify(vector)}`);
    }
    return vector;
  }
}

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

    // Instantiate embeddings with your Hugging Face API key
    const embeddings = new HuggingFaceEmbeddings(process.env.HUGGINGFACE_API_KEY);

    // Connect to your existing Qdrant collection
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: 'http://localhost:6333',
      collectionName: 'langchainjs-testing',
    });

    // Get top 2 relevant documents from Qdrant for the user query
    const retriever = vectorStore.asRetriever({ k: 2 });
    const result = await retriever.invoke(userQuery);

    // Build prompt for Gemini API including the context and question
    const SYSTEM_PROMPT = `
You are a helpful AI Assistant. Use the following context extracted from documents to answer the user's query.

Context:
${JSON.stringify(result)}

Question: ${userQuery}

Answer:
`;

    // Gemini API call setup
    const GEMINI_API_KEY = 'AIzaSyAsvuJ4EiX-rM5Vng3xFuJk5ONADl1_2Ro';
    if (!GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY in environment variables');

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Call Gemini API with prompt
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_PROMPT }] }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated.';

    res.json({
      message: answer.trim(),
      docs: result,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on PORT:${PORT}`));
