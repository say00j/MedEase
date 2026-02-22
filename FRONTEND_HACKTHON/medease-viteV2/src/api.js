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

/** Patient reads their own data (no doctor gate) */
export const getPatient = (mobileNumber) =>
  request('GET', `/patient-self/${mobileNumber}`)

/** List all patients (name + id) */
export async function getPatients() {
  const response = await fetch(BASE_URL + '/patients')
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to fetch patients')
  }
  return response.json()
}

/** Patient's access request list */
export async function getPatientRequests(mobile) {
  const res = await fetch(`${BASE_URL}/patient-requests/${mobile}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to fetch requests')
  }
  return res.json()
}

/** Patient approves or rejects a doctor's request */
export async function updateRequestStatus(requestId, status) {
  const res = await fetch(`${BASE_URL}/update-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request_id: requestId, status }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to update request')
  }
  return res.json()
}

// ── Consent / Access Gate ────────────────────────────────

/** Doctor sends a new access request to a patient */
export async function requestAccess(doctorLicense, patientMobile) {
  const res = await fetch(`${BASE_URL}/request-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doctor_license: doctorLicense,
      patient_mobile: patientMobile,
    }),
  })
  if (!res.ok) throw new Error('Failed to send access request')
  return res.json()
}

/** Check latest access-request status between a doctor and patient */
export async function checkAccess(doctorLicense, patientMobile) {
  const res = await fetch(`${BASE_URL}/check-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doctor_license: doctorLicense,
      patient_mobile: patientMobile,
    }),
  })
  if (!res.ok) throw new Error('Failed to check access')
  return res.json()
}

/** Fetch decrypted patient data — only works if the patient has approved access */
export async function getApprovedPatient(mobile, doctorLicense) {
  const res = await fetch(`${BASE_URL}/patient/${mobile}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctor_license: doctorLicense }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Access denied')
  }
  return res.json()
}

/** Mark the current approved session as expired/rejected on the backend */
export async function expireAccess(doctorLicense, patientMobile) {
  try {
    await fetch(`${BASE_URL}/expire-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctor_license: doctorLicense,
        patient_mobile: patientMobile,
      }),
    })
  } catch (err) {
    console.warn('expire-access call failed:', err)
  }
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

// ── File Uploads ─────────────────────────────────────────
export async function uploadPatientReport(file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${BASE_URL}/upload-report`, {
    method: 'POST',
    body: formData, // No Content-Type header; fetch sets it automatically with the boundary
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to upload file')
  }
  
  return res.json()
}

// ── Save Tests ───────────────────────────────────────────
export async function saveTests(payload) {
  const res = await fetch(`${BASE_URL}/save-tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to save tests')
  }

  return res.json()
}
