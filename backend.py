from flask import Flask, request, Response, jsonify
import requests
import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import uuid

app = Flask(__name__)

# -----------------------------
# FIREBASE SETUP
# -----------------------------

cred = credentials.Certificate("serviceAccountKey.json")

if not firebase_admin._apps:
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

# -----------------------------
# TEST FIREBASE
# -----------------------------

@app.route("/test-firebase")
def test_firebase():
    db.collection("test").document("sample").set({
        "status": "connected"
    })
    return "Firebase Connected Successfully"

# -----------------------------
# ADD DOCTOR
# -----------------------------

@app.route("/add-doctor", methods=["POST"])
def add_doctor():
    data = request.get_json()
    required = ["license_number", "name", "phone_number", "password"]

    if not data or not all(field in data for field in required):
        return jsonify({"error": "Missing required fields"}), 400

    license_number = data["license_number"]

    if db.collection("doctor_accounts").document(license_number).get().exists:
        return jsonify({"error": "Doctor already exists"}), 400

    # Create login account
    db.collection("doctor_accounts").document(license_number).set({
        "license_number": license_number,
        "password": data["password"]
    })

    # Create profile
    db.collection("doctors").document(license_number).set({
        "license_number": license_number,
        "name": data["name"],
        "phone_number": data["phone_number"],
        "created_at": datetime.utcnow().isoformat()
    })

    return jsonify({"message": "Doctor added successfully"}), 200

# -----------------------------
# ADD PATIENT
# -----------------------------

@app.route("/add-patient", methods=["POST"])
def add_patient():
    data = request.get_json()
    required = ["mobile_number", "name", "password"]

    if not data or not all(field in data for field in required):
        return jsonify({"error": "Missing required fields"}), 400

    mobile_number = data["mobile_number"]

    if db.collection("patient_accounts").document(mobile_number).get().exists:
        return jsonify({"error": "Patient already exists"}), 400

    # Create login account
    db.collection("patient_accounts").document(mobile_number).set({
        "mobile_number": mobile_number,
        "password": data["password"]
    })

    # Create profile
    db.collection("patients").document(mobile_number).set({
        "mobile_number": mobile_number,
        "name": data["name"],
        "medical_data": {},
        "created_at": datetime.utcnow().isoformat()
    })

    return jsonify({"message": "Patient added successfully"}), 200

# -----------------------------
# DOCTOR LOGIN
# -----------------------------

@app.route("/doctor-login", methods=["POST"])
def doctor_login():
    data = request.get_json()

    if not data or "license_number" not in data or "password" not in data:
        return jsonify({"error": "License number and password required"}), 400

    license_number = data["license_number"]
    password = data["password"]

    account_doc = db.collection("doctor_accounts").document(license_number).get()

    if not account_doc.exists:
        return jsonify({"error": "Doctor not found"}), 404

    account = account_doc.to_dict()

    if account["password"] != password:
        return jsonify({"error": "Invalid credentials"}), 401

    profile_doc = db.collection("doctors").document(license_number).get()
    doctor = profile_doc.to_dict()

    return jsonify({
        "message": "Doctor login successful",
        "name": doctor["name"],
        "license_number": license_number
    }), 200

# -----------------------------
# PATIENT LOGIN
# -----------------------------

@app.route("/patient-login", methods=["POST"])
def patient_login():
    data = request.get_json()

    if not data or "mobile_number" not in data or "password" not in data:
        return jsonify({"error": "Mobile number and password required"}), 400

    mobile_number = data["mobile_number"]
    password = data["password"]

    account_doc = db.collection("patient_accounts").document(mobile_number).get()

    if not account_doc.exists:
        return jsonify({"error": "Patient not found"}), 404

    account = account_doc.to_dict()

    if account["password"] != password:
        return jsonify({"error": "Invalid credentials"}), 401

    profile_doc = db.collection("patients").document(mobile_number).get()
    patient = profile_doc.to_dict()

    return jsonify({
        "message": "Patient login successful",
        "name": patient["name"],
        "mobile_number": mobile_number
    }), 200

# -----------------------------
# GET DOCTOR PROFILE
# -----------------------------

@app.route("/doctor/<license_number>", methods=["GET"])
def get_doctor(license_number):
    doc = db.collection("doctors").document(license_number).get()

    if not doc.exists:
        return jsonify({"error": "Doctor not found"}), 404

    return jsonify(doc.to_dict()), 200

# -----------------------------
# GET PATIENT PROFILE
# -----------------------------

@app.route("/patient/<mobile_number>", methods=["GET"])
def get_patient(mobile_number):
    doc = db.collection("patients").document(mobile_number).get()

    if not doc.exists:
        return jsonify({"error": "Patient not found"}), 404

    return jsonify(doc.to_dict()), 200

# -----------------------------
# LOG DOCTOR ACCESS
# -----------------------------

def log_doctor_access(doctor_license, patient_mobile):
    db.collection("doctor_access_logs").document(str(uuid.uuid4())).set({
        "timestamp": datetime.utcnow().isoformat(),
        "doctor_license": doctor_license,
        "patient_mobile": patient_mobile
    })

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
                chunk = json.loads(line.decode("utf-8"))

                if "message" in chunk and "content" in chunk["message"]:
                    yield chunk["message"]["content"]

                if chunk.get("done", False):
                    break

    return Response(generate(), mimetype="text/plain")

# -----------------------------
# RUN APP
# -----------------------------

if __name__ == "__main__":
    app.run(port=5000, debug=True)