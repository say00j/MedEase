from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import requests
import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import uuid
import bcrypt
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import os  

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)

# -----------------------------
# CORS CONFIG
# Allow requests from the Vite dev server (and production origin if needed)
# -----------------------------
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# -----------------------------
# SECURITY CONFIG
# -----------------------------

SECRET_KEY = os.getenv("KEY").encode()
cipher = Fernet(SECRET_KEY)

# -----------------------------
# FIREBASE INIT
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
Use only provided medical text.
Do not hallucinate.
"""

# -----------------------------
# HELPER FUNCTIONS
# -----------------------------

def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode(), hashed.encode())

def encrypt_data(data):
    return cipher.encrypt(json.dumps(data).encode()).decode()

def decrypt_data(data):
    return json.loads(cipher.decrypt(data.encode()).decode())

def log_doctor_access(doctor_license, patient_mobile):
    db.collection("doctor_access_logs").document(str(uuid.uuid4())).set({
        "timestamp": datetime.utcnow().isoformat(),
        "doctor_license": doctor_license,
        "patient_mobile": patient_mobile
    })

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

    # Store hashed password
    db.collection("doctor_accounts").document(license_number).set({
        "license_number": license_number,
        "password": hash_password(data["password"])
    })

    # Encrypt sensitive phone number
    encrypted_phone = encrypt_data(data["phone_number"])

    db.collection("doctors").document(license_number).set({
        "license_number": license_number,
        "name": data["name"],
        "phone_number": encrypted_phone,
        "created_at": datetime.utcnow().isoformat()
    })

    return jsonify({"message": "Doctor added securely"}), 200

# -----------------------------
# ADD PATIENT
# -----------------------------

@app.route("/add-patient", methods=["POST"])
def add_patient():
    data = request.get_json()
    required = ["mobile_number", "name", "password", "medical_data"]

    if not data or not all(field in data for field in required):
        return jsonify({"error": "Missing required fields"}), 400

    mobile_number = data["mobile_number"]

    if db.collection("patient_accounts").document(mobile_number).get().exists:
        return jsonify({"error": "Patient already exists"}), 400

    db.collection("patient_accounts").document(mobile_number).set({
        "mobile_number": mobile_number,
        "password": hash_password(data["password"])
    })

    encrypted_medical = encrypt_data(data["medical_data"])

    db.collection("patients").document(mobile_number).set({
        "mobile_number": mobile_number,
        "name": data["name"],
        "medical_data": encrypted_medical,
        "created_at": datetime.utcnow().isoformat()
    })

    return jsonify({"message": "Patient added securely"}), 200

# -----------------------------
# DOCTOR LOGIN
# -----------------------------

@app.route("/doctor-login", methods=["POST"])
def doctor_login():
    data = request.get_json()

    if not data or "license_number" not in data or "password" not in data:
        return jsonify({"error": "Missing credentials"}), 400

    doc = db.collection("doctor_accounts").document(data["license_number"]).get()

    if not doc.exists:
        return jsonify({"error": "Doctor not found"}), 404

    account = doc.to_dict()

    if not check_password(data["password"], account["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({"message": "Doctor login successful"}), 200

# -----------------------------
# PATIENT LOGIN
# -----------------------------

@app.route("/patient-login", methods=["POST"])
def patient_login():
    data = request.get_json()

    if not data or "mobile_number" not in data or "password" not in data:
        return jsonify({"error": "Missing credentials"}), 400

    doc = db.collection("patient_accounts").document(data["mobile_number"]).get()

    if not doc.exists:
        return jsonify({"error": "Patient not found"}), 404

    account = doc.to_dict()

    if not check_password(data["password"], account["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({"message": "Patient login successful"}), 200

# -----------------------------
# GET PATIENT (DECRYPT DATA)
# -----------------------------

@app.route("/patient/<mobile_number>", methods=["GET"])
def get_patient(mobile_number):
    doc = db.collection("patients").document(mobile_number).get()

    if not doc.exists:
        return jsonify({"error": "Patient not found"}), 404

    patient = doc.to_dict()

    # Decrypt medical data
    patient["medical_data"] = decrypt_data(patient["medical_data"])

    return jsonify(patient), 200

# -----------------------------
# ANALYSE
# -----------------------------

@app.route("/analyse", methods=["POST"])
def analyse():
    data = request.get_json()

    if not data or "medical_text" not in data:
        return jsonify({"error": "medical_text required"}), 400

    try:
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": data["medical_text"]}
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

        response = Response(generate(), mimetype="text/plain")
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

    except:
        return jsonify({"error": "LLM service unavailable"}), 500

# -----------------------------
# RUN
# -----------------------------

if __name__ == "__main__":
    app.run(port=5000, debug=True)