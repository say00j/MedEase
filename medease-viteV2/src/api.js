// Central API service — all fetch calls go through here
const BASE_URL = 'http://localhost:5000'

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

export async function getPatients() {
  const response = await fetch("http://localhost:5000/patients")

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || "Failed to fetch patients")
  }

  return response.json()
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
