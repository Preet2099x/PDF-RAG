# PDF-RAG Chatbot using Hugging Face + Qdrant

🧠 A local Retrieval-Augmented Generation chatbot that:
- Accepts PDF uploads
- Embeds content into Qdrant vector store
- Uses Hugging Face models for chat generation
- Queues jobs via Redis/BullMQ

## 🛠 Stack
- Node.js + Express
- Qdrant (local)
- Redis + BullMQ
- Hugging Face Transformers API

## 🔧 Run Locally

```bash
git clone https://github.com/yourname/pdf-rag-chatbot
cd pdf-rag-chatbot/server
npm install
node index.js
