📚 PDF-RAG
An AI-powered PDF question-answering app that lets you upload PDFs and chat with their content intelligently using embeddings and retrieval-augmented generation (RAG).

🛠 Tech Stack
Frontend
⚛️ Next.js (React Framework)

📝 TypeScript (Typed JavaScript)

🎨 Tailwind CSS (Utility-first styling)

🔐 Clerk (Authentication: Login/Signup)

🎭 Lucide React (Icons)

Backend
🟢 Node.js (JavaScript runtime, ES Modules)

🚂 Express.js (Web framework)

📄 pdf-parse (PDF text extraction)

⚙️ BullMQ (Job queue for async tasks)

🧠 Langchain (Embeddings, NLP utilities)

@langchain/community

@langchain/core

@langchain/openai

@langchain/qdrant

@langchain/textsplitters

📦 Multer (File uploads)

🌐 node-fetch (HTTP requests)

🔐 dotenv (Environment variables)

🌍 cors (Cross-Origin Resource Sharing)

🚀 Features
Upload PDFs and parse their content

Generate semantic embeddings of documents

Store embeddings in vector DB (Qdrant)

Answer questions based on uploaded PDF content

Authentication-protected user access

Scalable async processing with BullMQ

📂 Project Structure
frontend/ — Next.js + Clerk + UI

server/ — Express backend with workers handling PDF parsing and embedding

.env — API keys and sensitive config

