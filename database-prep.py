import firebase_admin
from firebase_admin import credentials, firestore
from cryptography.fernet import Fernet
import bcrypt
import os
from dotenv import load_dotenv
import json

load_dotenv()

# Load encryption key
SECRET_KEY = os.getenv("KEY").encode()
cipher = Fernet(SECRET_KEY)

# Firebase init
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def encrypt_data(data):
    return cipher.encrypt(json.dumps(data).encode()).decode()

def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

print("Starting database migration...")

# -----------------------------
# MIGRATE DOCTOR ACCOUNTS
# -----------------------------

doctor_accounts = db.collection("doctor_accounts").stream()

for doc in doctor_accounts:
    data = doc.to_dict()
    
    if not data["password"].startswith("$2b$"):  # Not hashed yet
        hashed = hash_password(data["password"])
        doc.reference.update({"password": hashed})
        print(f"Hashed password for doctor {data['license_number']}")

# -----------------------------
# MIGRATE DOCTOR PHONE NUMBERS
# -----------------------------

doctors = db.collection("doctors").stream()

for doc in doctors:
    data = doc.to_dict()
    
    try:
        # Try decrypting — if fails, it means not encrypted
        cipher.decrypt(data["phone_number"].encode())
    except:
        encrypted = encrypt_data(data["phone_number"])
        doc.reference.update({"phone_number": encrypted})
        print(f"Encrypted phone for {data['license_number']}")

# -----------------------------
# MIGRATE PATIENT ACCOUNTS
# -----------------------------

patient_accounts = db.collection("patient_accounts").stream()

for doc in patient_accounts:
    data = doc.to_dict()
    
    if not data["password"].startswith("$2b$"):
        hashed = hash_password(data["password"])
        doc.reference.update({"password": hashed})
        print(f"Hashed password for patient {data['mobile_number']}")

# -----------------------------
# MIGRATE PATIENT MEDICAL DATA
# -----------------------------

patients = db.collection("patients").stream()

for doc in patients:
    data = doc.to_dict()

    try:
        cipher.decrypt(data["medical_data"].encode())
    except:
        encrypted = encrypt_data(data["medical_data"])
        doc.reference.update({"medical_data": encrypted})
        print(f"Encrypted medical data for {data['mobile_number']}")

print("Migration completed successfully.")