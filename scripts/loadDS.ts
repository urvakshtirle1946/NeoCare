import { DataAPIClient } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

type SimilarityMertic = "dot_product" | "cosine" | "euclidean";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  GENAI_API_KEY,
} = process.env;

const ai = new GoogleGenAI({ apiKey: GENAI_API_KEY! });

const filePaths = [
  './data/Sample-filled-in-MR.pdf',
  './data/Hackstart.pdf'
];

// const webUrls = [
//   'https://en.wikipedia.org/wiki/OpenAI',
//   'https://gemini.google.com'
// ];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);
const db = client.db(ASTRA_DB_API_ENDPOINT!, {
  keyspace: ASTRA_DB_NAMESPACE!,
});

const spilter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const createCollection = async (SimilarityMertic: SimilarityMertic = "dot_product") => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION!, {
    vector: {
      dimension: 768,
      metric: SimilarityMertic,
    },
  });
  console.log("✅ Collection Created:", res);
};

const loadPdfContent = async (filePath: string) => {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();
  return docs.map((doc) => doc.pageContent).join("\n");
};

const loadWebContent = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: { headless: true },
    gotoOptions: { waitUntil: "domcontentloaded" },
  });
  const docs = await loader.load();
  return docs.map((doc) => doc.pageContent).join("\n");
};

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION!);


  for await (const filePath of filePaths) {
    const content = await loadPdfContent(filePath);
    const chunks = await spilter.splitText(content);

    for await (const chunk of chunks) {
      const embedding = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: chunk,
      });

      const vector = embedding.embeddings?.[0]?.values;
      if (!vector) continue;

      await collection.insertOne({
        $vector: vector,
        text: chunk,
        source: filePath,
      });

      console.log("📥 PDF Chunk Inserted");
    }
  }

  // // 🌐 Process Web URLs
  // for await (const url of webUrls) {
  //   const content = await loadWebContent(url);
  //   const chunks = await spilter.splitText(content);

  //   for await (const chunk of chunks) {
  //     const embedding = await ai.models.embedContent({
  //       model: "text-embedding-004",
  //       contents: chunk,
  //     });

  //     const vector = embedding.embeddings?.[0]?.values;
  //     if (!vector) continue;

  //     await collection.insertOne({
  //       $vector: vector,
  //       text: chunk,
  //       source: url,
  //     });

  //     console.log("🌐 Web Chunk Inserted");
  //   }
  // }
};

createCollection().then(() => loadSampleData());
