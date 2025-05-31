import { Worker } from 'bullmq';
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
// import type { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";



const worker = new Worker(
    'file-upload-queue',
    async (job) => {
        console.log('Job: '+ job.data)
        const data = JSON.parse(job.data)
        /*
        Path: data.path
        read the pdf from path,
        chunk the pdf,
        call the openai embedding model for every chunk,
        store the chunk in qdrant db
        */

        //Loads the PDF
        const loader = new PDFLoader(data.path);
        const docs = await loader.load();

        console.log(docs)

        //Splits the PDF into chunks
        // const textSplitter = new CharacterTextSplitter({
        // chunkSize: 300,
        // chunkOverlap: 0,
        // });
        // const texts = await textSplitter.splitText(docs);      
        // console.log(texts)  
    },
    {
        concurrdency: 100, 
        connection: {
            host: 'localhost',
            port: '6379'
        } 
    }
)