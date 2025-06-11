# RAG Chatbot with NestJS and Flask (HuggingFace)

## 📘 Overview

This project demonstrates a practical implementation of a **Retrieval-Augmented Generation (RAG)** chatbot using two backend services:

- A **NestJS backend** (in TypeScript) that handles user queries, document ingestion, and response generation.
- A **Flask-based Python microservice** for generating **text embeddings** using HuggingFace models.

Together, these components enable a chatbot that can answer user questions based on context retrieved from uploaded documents.

---

## 🤖 What is RAG?

**Retrieval-Augmented Generation (RAG)** is an approach that enhances the capabilities of a language model by grounding its responses in external documents. Instead of relying solely on the language model's internal knowledge, RAG works as follows:

1. **Query Embedding**: Convert the user's question into a dense vector.
2. **Document Retrieval**: Use that vector to search for relevant document chunks (also stored as vectors) in a **vector database**.
3. **Prompt Construction**: Build a prompt that includes the retrieved document context + the original question.
4. **LLM Response**: Generate a response using a large language model (LLM), conditioned on the retrieved context.

This dramatically improves factual accuracy and domain-specific knowledge.

---

## 🗂️ Backend Architecture

```
NestJS (API Layer)
├── File Upload Endpoint
│ → Chunk text → Send chunks to Flask for embedding → Store in Vector DB
├── Question Answering Endpoint
│ → Send question to Flask for embedding
│ → Search vector DB for top-K context chunks
│ → Compose prompt (context + question)
│ → Send prompt to LLM API (OpenAI/HuggingFace)
```

---

## 🔍 Vector Database (Qdrant)

- Stores document **chunks** and their **vector embeddings**.
- Supports similarity search using cosine/similarity metrics.
- Used to retrieve relevant document parts given a user query.

---

## 🧠 Text Embedding (Flask + HuggingFace)

We built a simple Flask API to:

- Accept a text string (from NestJS).
- Use a HuggingFace model like `sentence-transformers/all-MiniLM-L6-v2` to generate a vector embedding.
- Return that embedding as a JSON array.

### 🧩 Flask Embedding Service (Pseudocode)

```python
POST /embed
    -> Input: { text: "Some input" }
    -> Tokenize and embed using HuggingFace model
    -> Return: { embedding: [0.01, 0.33, ..., 0.42] }
```

---


# 📤 Document Upload and Indexing (NestJS)

## Process Overview

When a user uploads a document:

1. **Extract File Content**  
   The content is extracted using tools like `pdf-parse` or directly from plain text.

2. **Split Text into Chunks**  
   The extracted text is divided into smaller chunks, typically by paragraph or token length.

3. **Embed Chunks via Flask Service**  
   Each chunk is sent to a Flask-based service to retrieve its vector embedding.

4. **Store in Qdrant**  
   The embedding vector and the corresponding text chunk are stored in Qdrant.

---

## Pseudocode

```ts
const chunks = splitTextIntoChunks(documentText);

for (const chunk of chunks) {
    const embedding = POST('/embed', { text: chunk });
    qdrant.upsert({
        vector: embedding,
        payload: { text: chunk }
    });
}
```
---

# ❓ Answering a Question (NestJS)

## Process Overview

- **Receive Question via API**  
  A user sends a question through an API endpoint (e.g., using Postman).

- **Generate Embedding for the Question**  
  NestJS forwards the question to the Flask service to obtain its vector embedding.

- **Perform Vector Search**  
  The embedding is used to query Qdrant, retrieving the most relevant text chunks.

- **Form Context Block**  
  The top `k` results are combined into a single block of contextual information.

- **Construct Prompt**


- **Send to LLM**  
The constructed prompt is passed to an LLM (OpenAI GPT-3.5 or a local HuggingFace model).

- **Return Response**  
The LLM's response is returned to the user.

---

## 🧩 Answering Flow (Pseudocode)

```ts
const embedding = callFlaskEmbed(question);
const results = qdrant.search({ vector: embedding });
const context = join(results.payload.text);
const prompt = buildPrompt(context, question);
const answer = callLLM(prompt);
return answer;
```

---

# 🧠 Language Model (LLM)

- Initially used OpenAI's `gpt-4` and `gpt-3.5-turbo`.
- Later switched to free HuggingFace-hosted models (e.g., **DeepSeek**, **Mistral**).
- The LLM is responsible for generating the final response based on the provided context.

---

## ✅ Summary of Benefits

- 🔍 **High-accuracy answers** grounded in user-provided documents.
- 💵 **Cost reduction** by using free HuggingFace models.
- 🔧 **Decoupled architecture** allows scaling or swapping parts independently.
- 🧠 **Debuggable pipeline** with clear understanding of where each step may fail.
