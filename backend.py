from flask import Flask, request, Response, jsonify
import requests
import json

app = Flask(__name__)

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "llama3.2:latest"

SYSTEM_PROMPT = """
You are a clinical medical summarization assistant.

Rules:
- Use ONLY the provided medical text.
- Do NOT hallucinate.
- Do NOT invent conditions.
- Provide structured clinical summary.
"""

@app.route("/analyse", methods=["POST"])
def analyse():

    data = request.get_json()

    if not data or "medical_text" not in data:
        return jsonify({"error": "medical_text field required"}), 400

    medical_text = data["medical_text"]

    user_prompt = f"""
Provide structured clinical summary with:
1. Patient Overview
2. Chronic Conditions
3. Current Medications
4. Abnormal Lab Findings
5. Risk Factors
6. Clinical Risk Category (Low/Moderate/High)

Medical Record:
{medical_text}
"""

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        "stream": True,
        "options": {
            "temperature": 0.2
        }
    }

    def generate():
        response = requests.post(OLLAMA_URL, json=payload, stream=True)

        for line in response.iter_lines():
            if line:
                data = json.loads(line.decode("utf-8"))

                if "message" in data and "content" in data["message"]:
                    yield data["message"]["content"]

                if data.get("done", False):
                    break

    return Response(generate(), mimetype="text/plain")


if __name__ == "__main__":
    app.run(port=5000, debug=True)