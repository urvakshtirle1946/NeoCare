import { DataAPIClient } from "@datastax/astra-db-ts";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import "dotenv/config";

export async function POST(req: Request) {
  const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    GENAI_API_KEY,
  } = process.env;

  if (!ASTRA_DB_APPLICATION_TOKEN || !ASTRA_DB_API_ENDPOINT || !GENAI_API_KEY) {
    console.error("Missing environment variables in /api/chat");
    return NextResponse.json(
      { role: "assistant", content: "Missing required environment variables for chat service." },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({ apiKey: GENAI_API_KEY });
  const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
  const db = client.db(ASTRA_DB_API_ENDPOINT, {
    keyspace: ASTRA_DB_NAMESPACE,
  });

  try {
    const { message } = await req.json();

    const embedding = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: message,
    });

    const vector = embedding.embeddings?.[0]?.values;
    if (!vector || vector.length === 0) {
      throw new Error("Failed to generate embedding.");
    }

    const collection = await db.collection(ASTRA_DB_COLLECTION!);
    const cursor = collection.find(
      {},
      {
        sort: {
          $vector: vector,
        },
        limit: 5,
      }
    );
    const documents = await cursor.toArray();

    const contextText = documents.map((doc) => doc.text).join("\n");

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an intelligent assistant. Use the following context only if it's helpful. Otherwise, answer based on your own knowledge.\n\nContext:\n${contextText}\n\nQuestion:\n${message}`,
            },
          ],
        },
      ],
    });

    const response = await result.text;

    return NextResponse.json({ role: "assistant", content: response });

  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json(
      { role: "assistant", content: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
