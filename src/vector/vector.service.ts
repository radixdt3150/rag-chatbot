import { Injectable } from "@nestjs/common";
import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";
import { loadPdfText } from "./utils/loader";
import { splitText } from "./utils/text-split";

@Injectable()
export class VectorService {
    private readonly qdrant = new QdrantClient({
        url: "http://localhost:6333",
    });
    private readonly openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    async indexPdf(buffer: Buffer) {
        const text = await loadPdfText(buffer);
        const chunks = splitText(text);
        console.log({ chunks: chunks.length });
        const vectors = await Promise.all(
            chunks.map(async (chunk, idx) => {
                const embedding = await this.embedText(chunk);
                return {
                    id: `${Date.now()}_${idx}`,
                    vector: embedding,
                    payload: { text: chunk },
                };
            })
        );

        await this.qdrant.upsert("university-docs", {
            points: vectors,
        });

        return { indexed: vectors.length };
    }

    /**
     * @description - Generates for text chunks. Embedding is a vector that captures semantic information
     * and context of a word, phrase, etc.
     */
    private async embedText(text: string): Promise<number[]> {
        const res = await this.openaiClient.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
        });
        return res.data[0].embedding;
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
}
