# 🧠 PDF-RAG: Combining Vector Search and LLMs for Smarter Document Interaction


**PDF-RAG** is an AI-powered system that enables natural language querying over PDF documents. Leveraging **LangChain**, it integrates vector-based semantic search with language generation models to retrieve and generate contextually relevant answers from your PDFs. The pipeline involves extracting embeddings from uploaded documents, performing similarity searches against these embeddings, and using those results as context to produce precise, grounded responses.


---

## 📌 What This Project Does

This project enables:

- 📁 Uploading and parsing PDF documents to extract text
- 🧩 Chunking and embedding text using Hugging Face Transformers
- 🔍 Storing embeddings in a vector database (Qdrant) for efficient retrieval
- 💬 Accepting user queries and retrieving relevant document chunks
- 🤖 Using Gemini as a chat LLM, enhanced with retrieved document context to generate accurate, context-aware answers
- 🔗 Coordinating retrieval and generation with LangChain for a smooth user experience


---
## 🖥️ Architecture

![diagram-export-02-06-2025-09_23_41](https://github.com/user-attachments/assets/01be4ab4-4b02-410a-a414-a7317efa70cb)
---
## 🛠️ Tech Stack

### Languages  
- TypeScript (in frontend)
- JavaScript (in backend)

### Frameworks & Libraries  

- **Next.js** – React framework for building the frontend UI  
- **Clerk** – Authentication and user management service  
- **shadcn/ui** – Component library for building polished UI elements  

- **Express** – Node.js web framework for backend API  
- **BullMQ** – Job queue with Redis for background processing  
- **Multer** – Middleware for handling file uploads (PDFs)  
- **LangChain** – Responsible for loading PDF documents, extracting and preprocessing text, and intelligently chunking content for embedding and retrieval.  

### Databases & Storage  
- **Qdrant** – Vector similarity search database for storing embeddings  
- **Redis** – In-memory data store used by BullMQ for job queue  
- Local file system (`uploads/` folder) – Temporary storage for PDFs  

### APIs & External Services  
- **Hugging Face Inference API** – Embeddings generation via sentence-transformers  
- **Google Gemini API** – LLM for generating context-aware answers  

---


## 🚀 Potential Use Cases

- 📄 Quickly extract specific information from large collections of PDFs or documents.
- 🎓 Provide researchers with precise, context-aware answers from academic papers or reports.
- 🏢 Enable enterprises to implement smarter internal document search and knowledge management.
- 🎧 Assist support teams in accessing product manuals and FAQs through natural language queries.
- ⚖️ Help legal professionals query contracts and case files efficiently with conversational AI.

---






