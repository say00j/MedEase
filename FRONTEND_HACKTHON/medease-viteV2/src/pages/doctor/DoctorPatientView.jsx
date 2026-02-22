import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { expireAccess } from '../../api'

const blue = '#1565C0'
const GRANT_KEY_PREFIX = 'medease_access_granted_at_'
const ACCESS_TIMEOUT_MS = 2 * 60 * 1000 // 2 minutes

export default function DoctorPatientView() {
  const location = useLocation()
  const navigate = useNavigate()
  const patient = location.state

  const [secondsLeft, setSecondsLeft] = useState(null)
  const intervalRef = useRef(null)

  function getMsRemaining(patientId) {
    const raw = sessionStorage.getItem(GRANT_KEY_PREFIX + patientId)
    if (!raw) return null
    return ACCESS_TIMEOUT_MS - (Date.now() - Number(raw))
  }

  function clearGrant(patientId) {
    sessionStorage.removeItem(GRANT_KEY_PREFIX + patientId)
  }

  function formatTime(secs) {
    if (secs == null || secs < 0) return '00:00'
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  useEffect(() => {
    if (!patient) { navigate('/doctor/home'); return }

    const patientId = patient.mobile_number
    const initialMs = getMsRemaining(patientId)
    setSecondsLeft(initialMs !== null ? Math.ceil(initialMs / 1000) : null)

    intervalRef.current = setInterval(() => {
      const ms = getMsRemaining(patientId)
      if (ms === null || ms <= 0) {
        clearInterval(intervalRef.current)
        clearGrant(patientId)
        setSecondsLeft(0)
        const doctorLicense = sessionStorage.getItem('medease_doctor_license')
        expireAccess(doctorLicense, patientId).then(() => {
          alert(
            `⏰ Access timeout\n\nYour 2-minute access window for ${patient.name} has expired.\nYou will be redirected back to the patient list.`
          )
          navigate('/doctor/patients')
        })
        return
      }
      setSecondsLeft(Math.ceil(ms / 1000))
    }, 1000)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!patient) return null

  const med = patient.medical_data || {}
  const initials = patient.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'PT'

  // Timer badge colours
  const timerColor = secondsLeft === null ? '#7F8C8D' : secondsLeft <= 60 ? '#C62828' : secondsLeft <= 300 ? '#E65100' : '#2E7D32'
  const timerBg    = secondsLeft === null ? '#F5F5F5' : secondsLeft <= 60 ? '#FFEBEE' : secondsLeft <= 300 ? '#FFF3E0' : '#E8F5E9'
  const timerBorder= secondsLeft === null ? '#E0E0E0' : secondsLeft <= 60 ? '#EF9A9A' : secondsLeft <= 300 ? '#FFCC80' : '#A5D6A7'
  const timerIcon  = secondsLeft !== null && secondsLeft <= 60 ? '🚨' : secondsLeft !== null && secondsLeft <= 300 ? '⚠️' : '🔓'

  return (
    <>
      <Navbar />
      <div className="main-container">
        <Sidebar role="doctor" />
        <main className="content-area animate-fade">
          <h2 style={{ marginBottom: 25, fontSize: 28 }}>Patient Medical Record</h2>

          {/* ── Profile Card ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 30,
            background: 'white', padding: '35px 40px', borderRadius: 20,
            boxShadow: '0 4px 25px rgba(0,0,0,0.05)', marginBottom: 35,
            borderLeft: `6px solid ${blue}`,
          }}>
            {/* Avatar */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: `linear-gradient(135deg, ${blue}, #0D47A1)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, color: 'white', fontWeight: 800, flexShrink: 0,
            }}>
              {initials}
            </div>

            {/* Name + mobile + timer */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
                <h3 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{patient.name}</h3>

                {/* Access-countdown badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 14px', borderRadius: 999,
                  background: timerBg, border: `1.5px solid ${timerBorder}`,
                  color: timerColor, fontWeight: 700, fontSize: 13,
                  transition: 'background 0.4s, border-color 0.4s, color 0.4s',
                }}>
                  <span style={{ fontSize: 14 }}>{timerIcon}</span>
                  <span>
                    Access expires in{' '}
                    <span style={{ fontFamily: 'monospace', fontSize: 14 }}>
                      {secondsLeft !== null ? formatTime(secondsLeft) : '--:--'}
                    </span>
                  </span>
                </div>
              </div>
              <p style={{ color: '#7F8C8D', fontSize: 15, margin: 0 }}>Mobile: {patient.mobile_number}</p>
            </div>
          </div>

          {/* ── Medical Details Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Personal Info */}
            <div style={{ background: 'white', borderRadius: 14, padding: 25, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: blue, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 18 }}>
                Personal Information
              </h4>
              {[
                ['Full Name', patient.name],
                ['Age', med.age || '—'],
                ['Gender', med.gender || '—'],
                ['Blood Group', med.blood_group || '—'],
                ['Date of Birth', med.dob || '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0F0F0', fontSize: 14 }}>
                  <span style={{ color: '#7F8C8D' }}>{label}</span>
                  <span style={{ fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Medical Info */}
            <div style={{ background: 'white', borderRadius: 14, padding: 25, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: blue, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 18 }}>
                Medical Information
              </h4>
              {[
                ['Height', med.height ? med.height + ' cm' : '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0F0F0', fontSize: 14 }}>
                  <span style={{ color: '#7F8C8D' }}>{label}</span>
                  <span style={{ fontWeight: 700 }}>{value}</span>
                </div>
              ))}

              <div style={{ color: '#7F8C8D', marginTop: 15, fontSize: 13 }}>Known Conditions / Allergies</div>
              <div style={{ background: '#FFF8E1', borderRadius: 10, padding: 15, fontSize: 14, color: '#5D4037', marginTop: 10, lineHeight: 1.6 }}>
                {med.conditions || 'No known conditions mentioned.'}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
