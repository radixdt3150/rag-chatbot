import requests
from huggingface_hub import login
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from transformers import pipeline
import torch
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Load a fast embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Load a conversation LLM
pipe = pipeline("text-generation", model="google/gemma-3-1b-it", torch_dtype=torch.bfloat16)

@app.route("/embed", methods=["POST"])
def embed():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' in request"}), 400

    text = data["text"]
    if not isinstance(text, str):
        return jsonify({"error": "'text' must be a string"}), 400

    try:
        embedding = model.encode(text).tolist()
        return jsonify({"embedding": embedding})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    prompt = data.get("prompt")

    # result = generator(prompt, max_new_tokens=512, do_sample=True, temperature=0.7)
    # output = result[0]["generated_text"]

    messages = [
    [
        {
            "role": "system",
            "content": [{"type": "text", "text": "You are a helpful assistant."},]
        },
        {
            "role": "user",
            "content": [{"type": "text", "text": "Write a 1000 word essay on hugging face the company"},]
        },
    ],
    ]
    answer = pipe(prompt, max_new_tokens=500)

    return jsonify({"answer": answer})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005)

