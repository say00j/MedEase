// Central API service — all fetch calls go through here
const BASE_URL = 'http://100.80.166.45:5000'

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// ── Doctor ──────────────────────────────────────────────
export const doctorRegister = (payload) =>
  request('POST', '/add-doctor', payload)

export const doctorLogin = (payload) =>
  request('POST', '/doctor-login', payload)

// ── Patient ─────────────────────────────────────────────
export const patientRegister = (payload) =>
  request('POST', '/add-patient', payload)

export const patientLogin = (payload) =>
  request('POST', '/patient-login', payload)

export const getPatient = (mobileNumber) =>
  request('GET', `/patient/${mobileNumber}`)

const MOCK_PATIENTS = [
  { id: '9876543210', name: 'Aarav Sharma' },
  { id: '9123456780', name: 'Priya Mehta' },
  { id: '9988776655', name: 'Rohan Gupta' },
  { id: '9001122334', name: 'Sneha Iyer' },
  { id: '9765432109', name: 'Karan Patel' },
]

export async function getPatients() {
  try {
    const response = await fetch(BASE_URL + '/patients')
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to fetch patients')
    }
    return response.json()
  } catch {
    // Backend unavailable — return mock data so the UI still works
    return MOCK_PATIENTS
  }
}

export async function getPatientRequests(mobile) {
  const res = await fetch(`${BASE_URL}/patient-requests/${mobile}`)

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || "Failed to fetch requests")
  }

  return res.json()
}

export async function updateRequestStatus(requestId, status) {
  const res = await fetch(`${BASE_URL}/update-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      request_id: requestId,
      status: status
    })
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || "Failed to update request")
  }

  return res.json()
}

// ── AI Analyse (streaming) ───────────────────────────────
export async function analyseStream(medicalText, onChunk) {
  const res = await fetch(`${BASE_URL}/analyse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medical_text: medicalText }),
  })
  if (!res.ok) throw new Error('Analysis failed')
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value))
  }
}
