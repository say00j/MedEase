import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import uuid

# INIT FIREBASE
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

print("Connected to Firebase")

# CLEAR OLD DATA
collections = [
    "doctor_accounts",
    "doctors",
    "patient_accounts",
    "patients",
    "doctor_access_logs"
]

for col in collections:
    docs = db.collection(col).stream()
    for doc in docs:
        doc.reference.delete()

print("Old data cleared")

# -----------------------------
# DOCTOR LOGIN DATA
# -----------------------------

doctor_accounts = [
    {"license_number": "TNMC1001", "password": "123456"},
    {"license_number": "KLMC2002", "password": "123456"}
]

for acc in doctor_accounts:
    db.collection("doctor_accounts").document(acc["license_number"]).set(acc)

print("Doctor login accounts added")

# -----------------------------
# DOCTOR PROFILE DATA
# -----------------------------

doctor_profiles = [
    {
        "license_number": "TNMC1001",
        "name": "Dr. Arun Kumar",
        "phone_number": "9876543210",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "license_number": "KLMC2002",
        "name": "Dr. Meera Nair",
        "phone_number": "9898989898",
        "created_at": datetime.utcnow().isoformat()
    }
]

for doc in doctor_profiles:
    db.collection("doctors").document(doc["license_number"]).set(doc)

print("Doctor profiles added")

# -----------------------------
# PATIENT LOGIN DATA
# -----------------------------

patient_accounts = [
    {"mobile_number": "9000000001", "password": "123456"},
    {"mobile_number": "9000000002", "password": "123456"}
]

for acc in patient_accounts:
    db.collection("patient_accounts").document(acc["mobile_number"]).set(acc)

print("Patient login accounts added")

# -----------------------------
# PATIENT MEDICAL DATA
# -----------------------------

patients = [
    {
        "mobile_number": "9000000001",
        "name": "Rajesh Kumar",
        "medical_data": {
            "conditions": ["Type 2 Diabetes", "Hypertension"],
            "labs": {"HbA1c": "8.2%", "LDL": "165 mg/dL"},
            "notes": "Chest discomfort for 3 days."
        },
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "mobile_number": "9000000002",
        "name": "Anita Sharma",
        "medical_data": {
            "conditions": ["Asthma"],
            "labs": {"SpO2": "95%"},
            "notes": "Breathlessness occasionally."
        },
        "created_at": datetime.utcnow().isoformat()
    }
]

for patient in patients:
    db.collection("patients").document(patient["mobile_number"]).set(patient)

print("Patient medical data added")

# -----------------------------
# ACCESS LOGS
# -----------------------------

logs = [
    {
        "timestamp": datetime.utcnow().isoformat(),
        "doctor_license": "TNMC1001",
        "patient_mobile": "9000000001"
    },
    {
        "timestamp": datetime.utcnow().isoformat(),
        "doctor_license": "KLMC2002",
        "patient_mobile": "9000000002"
    }
]

for log in logs:
    db.collection("doctor_access_logs").document(str(uuid.uuid4())).set(log)

print("Access logs inserted")

print("COMPLETE SYSTEM DATA READY")