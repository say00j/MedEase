from flask import Flask, request, Response, jsonify
import requests
import json
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)

# -----------------------------
# FIREBASE SETUP
# -----------------------------

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# -----------------------------
# OLLAMA CONFIG
# -----------------------------

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
#------------------------------
# test firebase
#------------------------------

@app.route("/test-firebase")
def test_firebase():
    db.collection("test").document("sample").set({
        "status": "connected"
    })
    return "Firebase Connected Successfully"

# -----------------------------
# ADD PATIENT
# -----------------------------

@app.route("/add-patient", methods=["POST"])
def add_patient():
    data = request.get_json()

    if not data or "patient_id" not in data:
        return jsonify({"error": "patient_id required"}), 400

    patient_id = data["patient_id"]

    db.collection("patients").document(patient_id).set(data)

    return jsonify({"message": "Patient saved successfully"}), 200


# -----------------------------
# GET PATIENT
# -----------------------------

@app.route("/patient/<patient_id>", methods=["GET"])
def get_patient(patient_id):
    doc = db.collection("patients").document(patient_id).get()

    if not doc.exists:
        return jsonify({"error": "Patient not found"}), 404

    return jsonify(doc.to_dict()), 200


# -----------------------------
# DOCTOR LOGIN
# -----------------------------

@app.route("/doctor-login", methods=["POST"])
def doctor_login():
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email and password required"}), 400

    email = data["email"]
    password = data["password"]

    doctors = db.collection("doctors").where("email", "==", email).stream()

    for doc in doctors:
        doctor = doc.to_dict()
        if doctor["password"] == password:
            return jsonify({
                "message": "Doctor login successful",
                "doctor_id": doctor["doctor_id"],
                "name": doctor["name"]
            }), 200

    return jsonify({"error": "Invalid credentials"}), 401


# -----------------------------
# PATIENT LOGIN
# -----------------------------

@app.route("/patient-login", methods=["POST"])
def patient_login():
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email and password required"}), 400

    email = data["email"]
    password = data["password"]

    patients = db.collection("patients_users").where("email", "==", email).stream()

    for doc in patients:
        patient = doc.to_dict()
        if patient["password"] == password:
            return jsonify({
                "message": "Patient login successful",
                "patient_id": patient["patient_id"],
                "name": patient["name"]
            }), 200

    return jsonify({"error": "Invalid credentials"}), 401

# -----------------------------
# ANALYSE MEDICAL DATA
# -----------------------------

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
        "options": {"temperature": 0.2}
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