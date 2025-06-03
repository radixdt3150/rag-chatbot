import { Injectable, OnModuleInit } from "@nestjs/common";
import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";
import { loadPdfText } from "./utils/loader";
import { splitText } from "./utils/text-split";
import { v4 as uuidv4 } from "uuid";

import axios from "axios";

@Injectable()
export class VectorService implements OnModuleInit {
    private readonly qdrant = new QdrantClient({
        url: "http://localhost:6333",
    });
    private readonly openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    private readonly flaskApiUrl = "http://localhost:5005/embed";

    // This method will be automatically called when the module is initialized
    async onModuleInit() {
        await this.createCollection();
    }

    async indexPdf(buffer: Buffer) {
        try {
            const text = await loadPdfText(buffer);
            const chunks = splitText(text);

            const vectors = await Promise.all(
                chunks.map(async (chunk) => {
                    const embedding = await this.embedText(chunk);
                    return {
                        id: uuidv4(),
                        vector: embedding,
                        payload: { text: chunk },
                    };
                })
            );
            // console.log(JSON.stringify(vectors));
            await this.qdrant.upsert("university-docs", {
                points: vectors,
            });

            return { indexed: vectors.length };
        } catch (error: any) {
            console.log({ error: error.data });
        }
    }

    /**
     * @description - Generates for text chunks. Embedding is a vector that captures semantic information
     * and context of a word, phrase, etc.
     */
    private async embedText(text: string): Promise<number[]> {
        // const res = await this.openaiClient.embeddings.create({
        //     model: "text-embedding-3-small",
        //     input: text,
        // });
        // return res.data[0].embedding;

        const response = await axios.post(this.flaskApiUrl, { text });
        return response.data.embedding;
    }

    async query(question: string) {
        const embedding = await this.embedText(question);
        const result = await this.qdrant.search("university-docs", {
            vector: embedding,
            limit: 3,
        });

        return result.map((r) => r.payload.text);
    }

    async answerQuestion(question: string) {
        const embedding = await this.embedText(question);

        const searchResult = await this.qdrant.search("university-docs", {
            vector: embedding,
            limit: 4,
            with_payload: true,
        });

        const contextChunks = searchResult
            .map((item) => item.payload?.text || "")
            .filter(Boolean)
            .join("\n\n");

        const prompt = `
        You are a helpful assistant. Use the context below to answer the user's question.
        
        Context:
        ${contextChunks}
        
        Question:
        ${question}
        
        Answer:
        `;

        const completion = await this.openaiClient.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
        });

        return completion.choices[0].message.content;
    }

    private async createCollection() {
        const collectionName = "university-docs"; // Use your desired collection name

        try {
            // Get collections response
            const collectionsResponse = await this.qdrant.getCollections();

            // Check if collections property exists and then find collection
            const collectionExists = collectionsResponse.collections.some(
                (collection) => collection.name === collectionName
            );

            if (!collectionExists) {
                // Create the collection if it doesn't exist
                await this.qdrant.createCollection(
                    collectionName, // First argument: Collection name
                    {
                        // Vectors schema
                        vectors: {
                            size: 384, // Vector size for your embeddings (ensure this matches your model's embedding size)
                            distance: "Cosine", // Distance metric: "Cosine" or "Euclidean"
                        },
                    }
                );
                console.log(
                    `Collection '${collectionName}' created successfully.`
                );
            } else {
                console.log(`Collection '${collectionName}' already exists.`);
            }
        } catch (error) {
            console.error("Error creating collection:", error);
        }
    }
}
