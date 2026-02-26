import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { getPatients, checkAccess, getApprovedPatient, requestAccess } from '../../api'

// ─────────────────────────────────────────────────────────────
// Timeout constants
// ─────────────────────────────────────────────────────────────
const ACCESS_TIMEOUT_MS  = 2 * 60 * 1000            // 2-minute timed session
const GRANT_KEY_PREFIX   = 'medease_access_granted_at_' // sessionStorage key per patient

const AVATAR_COLORS = [
  '#D32F2F', '#1565C0', '#2E7D32', '#6A1B9A', '#E65100', '#00695C',
]
const INITIALS = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'PT'

export default function PatientList() {
  const [patients,             setPatients]             = useState([])
  const [loading,              setLoading]              = useState(true)
  const [error,                setError]                = useState('')
  const [selectedPatient,      setSelectedPatient]      = useState(null)
  const [showModal,            setShowModal]            = useState(false)       // consent / re-request modal
  const [sessionExpired,       setSessionExpired]       = useState(false)       // shown inside the consent modal
  const [showStartModal,       setShowStartModal]       = useState(false)       // "patient approved — start session?" modal
  const [pendingSessionPatient, setPendingSessionPatient] = useState(null)

  // Countdown state
  const [activePatientId, setActivePatientId] = useState(null)
  const [secondsLeft,     setSecondsLeft]     = useState(null)
  const intervalRef = useRef(null)

  const navigate = useNavigate()

  // ─────────────────────────────────────────────────────────────
  // sessionStorage helpers
  // ─────────────────────────────────────────────────────────────

  function getMsRemaining(patientId) {
    const raw = sessionStorage.getItem(GRANT_KEY_PREFIX + patientId)
    if (!raw) return null
    return ACCESS_TIMEOUT_MS - (Date.now() - Number(raw))
  }

  function recordGrant(patientId) {
    sessionStorage.setItem(GRANT_KEY_PREFIX + patientId, Date.now().toString())
  }

  function clearGrant(patientId) {
    sessionStorage.removeItem(GRANT_KEY_PREFIX + patientId)
  }

  async function expireAccessOnBackend(patientId) {
    const doctorLicense = sessionStorage.getItem('medease_doctor_license')
    if (!doctorLicense) return
    try {
      await fetch('http://localhost:5000/expire-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_license: doctorLicense, patient_mobile: patientId }),
      })
    } catch (err) { console.warn('expire-access call failed:', err) }
  }

  // ─────────────────────────────────────────────────────────────
  // Countdown ticker
  // ─────────────────────────────────────────────────────────────

  function startCountdown(patientId) {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setActivePatientId(patientId)
    setSecondsLeft(Math.ceil(getMsRemaining(patientId) / 1000))

    intervalRef.current = setInterval(() => {
      const ms = getMsRemaining(patientId)
      if (ms !== null && ms > 0) {
        setSecondsLeft(Math.ceil(ms / 1000))
      } else {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        clearGrant(patientId)
        expireAccessOnBackend(patientId)
        setActivePatientId(null)
        setSecondsLeft(null)
      }
    }, 1000)
  }

  // Restore in-progress countdown after a page refresh
  useEffect(() => {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith(GRANT_KEY_PREFIX)) {
        const patientId = key.replace(GRANT_KEY_PREFIX, '')
        const ms = getMsRemaining(patientId)
        if (ms !== null && ms > 0) { startCountdown(patientId); break }
        else clearGrant(patientId)
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // ─────────────────────────────────────────────────────────────
  // Fetch patient list
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    getPatients()
      .then(setPatients)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // ─────────────────────────────────────────────────────────────
  // Patient card click — full consent gate
  // ─────────────────────────────────────────────────────────────

  async function handlePatientClick(patient) {
    const doctorLicense = sessionStorage.getItem('medease_doctor_license')

    try {
      const result = await checkAccess(doctorLicense, patient.id)

      if (!result.exists) {
        setSelectedPatient(patient); setShowModal(true); return
      }

      if (result.status === 'approved') {
        const ms = getMsRemaining(patient.id)

        if (ms !== null && ms <= 0) {
          clearGrant(patient.id)
          setSessionExpired(true)
          setSelectedPatient(patient); setShowModal(true); return
        }

        if (ms !== null && ms > 0) {
          startCountdown(patient.id)
          const data = await getApprovedPatient(patient.id, doctorLicense)
          navigate('/doctor/patient-view', { state: data }); return
        }

        // No local grant yet — patient just approved; prompt doctor to start session
        if (ms === null) {
          setPendingSessionPatient(patient); setShowStartModal(true); return
        }
      }

      if (result.status === 'pending') {
        alert('⏳ Request already sent. Waiting for patient approval.'); return
      }

      if (result.status === 'rejected') {
        setSelectedPatient(patient); setShowModal(true); return
      }
    } catch (err) {
      alert('Error checking access: ' + err.message)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Start timed session  (called from "Start Session" modal)
  // ─────────────────────────────────────────────────────────────

  async function startSession() {
    if (!pendingSessionPatient) return
    const doctorLicense = sessionStorage.getItem('medease_doctor_license')
    try {
      recordGrant(pendingSessionPatient.id)
      startCountdown(pendingSessionPatient.id)
      const data = await getApprovedPatient(pendingSessionPatient.id, doctorLicense)
      setShowStartModal(false); setPendingSessionPatient(null)
      navigate('/doctor/patient-view', { state: data })
    } catch (err) {
      alert('Failed to load patient data: ' + err.message)
    }
  }

  async function sendRequest() {
    const doctorLicense = sessionStorage.getItem('medease_doctor_license')
    try {
      await requestAccess(doctorLicense, selectedPatient.id)
      alert('✅ Access request sent to patient.')
      setShowModal(false); setSessionExpired(false)
    } catch (err) {
      alert('Failed to send request: ' + err.message)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <>
      <Navbar />
      <div className="main-container">
        <Sidebar role="doctor" />
        <main className="content-area animate-fade">

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#D32F2F', lineHeight: 1.1 }}>
              Patient List
            </h1>
            <p style={{ color: '#7F8C8D', fontSize: 14, marginTop: 4 }}>
              {patients.length} patients · Click a patient to view their record (consent required)
            </p>
          </div>

          {/* Live access-session countdown banner */}
          {activePatientId && secondsLeft !== null && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
              padding: '10px 18px', borderRadius: 10,
              background: secondsLeft <= 60 ? '#FFEBEE' : secondsLeft <= 300 ? '#FFF3E0' : '#E8F5E9',
              border: `1.5px solid ${secondsLeft <= 60 ? '#EF9A9A' : secondsLeft <= 300 ? '#FFCC80' : '#A5D6A7'}`,
              color: secondsLeft <= 60 ? '#C62828' : secondsLeft <= 300 ? '#E65100' : '#2E7D32',
              fontWeight: 600, fontSize: 14,
            }}>
              <span style={{ fontSize: 18 }}>{secondsLeft <= 60 ? '🚨' : secondsLeft <= 300 ? '⚠️' : '🔓'}</span>
              <span>
                Active access session — expires in{' '}
                <span style={{ fontFamily: 'monospace', fontSize: 15 }}>{formatTime(secondsLeft)}</span>
                {secondsLeft <= 300 && secondsLeft > 60 && ' — expiring soon!'}
                {secondsLeft <= 60 && ' — almost expired!'}
              </span>
            </div>
          )}

          {loading && <div style={{ padding: 40, textAlign: 'center', color: '#7F8C8D' }}>Loading patients…</div>}
          {error   && <div style={{ padding: 16, background: '#FFEBEE', borderRadius: 10, color: '#C62828' }}>⚠ {error}</div>}

          {/* Patient Cards */}
          {!loading && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {patients.map((patient, idx) => (
                <div key={patient.id} className="pl-patient-card" onClick={() => handlePatientClick(patient)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                    <div className="pl-avatar" style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
                      {INITIALS(patient.name)}
                    </div>
                    <div>
                      <div className="pl-patient-name">{patient.name}</div>
                      <div className="pl-patient-id">📱 {patient.id}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                    {/* Access-gate patient view */}
                    <button
                      className="pl-action-btn pl-btn-blue"
                      onClick={e => { e.stopPropagation(); handlePatientClick(patient) }}
                    >
                      🔐 View Medical Record
                    </button>

                    {/* Doctor intake flow — no consent needed */}
                    <button
                      className="pl-action-btn"
                      style={{ background: '#D32F2F', color: '#fff', border: 'none' }}
                      onClick={e => { e.stopPropagation(); navigate('/doctor/patient-summary', { state: { patient } }) }}
                    >
                      📋 Upload & Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── "Patient Approved — Start Session" modal ── */}
          {showStartModal && pendingSessionPatient && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div style={{ background: 'white', padding: 32, borderRadius: 14, width: 420, textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
                <div style={{ background: '#E8F5E9', border: '1.5px solid #A5D6A7', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 22 }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#2E7D32', fontSize: 14 }}>Patient has approved your request</div>
                    <div style={{ fontSize: 12, color: '#388E3C', marginTop: 2 }}>
                      {pendingSessionPatient.name} has granted access to their medical data.
                    </div>
                  </div>
                </div>
                <h3 style={{ marginBottom: 10, fontSize: 18 }}>Start Access Session?</h3>
                <p style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>
                  Starting the session will begin a <strong>2-minute access window</strong>.
                  After it expires you will need to request access again.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
                  <button onClick={startSession} style={{ padding: '10px 24px', background: '#1565C0', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    🔓 Start Session
                  </button>
                  <button onClick={() => { setShowStartModal(false); setPendingSessionPatient(null) }} style={{ padding: '10px 24px', background: '#ECEFF1', color: '#333', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Consent / re-request modal ── */}
          {showModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div style={{ background: 'white', padding: 30, borderRadius: 12, width: 400, textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
                <h3 style={{ marginBottom: 15 }}>Access Patient Data</h3>

                {sessionExpired && (
                  <div style={{ background: '#FFEBEE', border: '1.5px solid #EF9A9A', borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#C62828', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}>
                    <span style={{ fontSize: 16 }}>⏰</span>
                    <span>Your 2-minute access window has expired. Send a new request to regain access.</span>
                  </div>
                )}

                <p style={{ marginBottom: 25 }}>
                  To access <b>{selectedPatient?.name}</b>'s medical data, patient consent is required.
                  <br /><br />
                  Send access request?
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 15 }}>
                  <button onClick={sendRequest} style={{ padding: '10px 20px', background: '#2E7D32', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                    ✅ Yes, Send Request
                  </button>
                  <button onClick={() => { setShowModal(false); setSessionExpired(false) }} style={{ padding: '10px 20px', background: '#C62828', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  )
}