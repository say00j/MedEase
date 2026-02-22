import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { getPatients } from '../../api'

const INITIALS = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'PT'

const AVATAR_COLORS = [
  '#D32F2F', '#1565C0', '#2E7D32', '#6A1B9A', '#E65100', '#00695C',
]

export default function PatientList() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getPatients()
      .then(setPatients)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

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
              {patients.length} patients · Select a patient to begin evaluation
            </p>
          </div>

          {loading && (
            <div style={{ padding: 40, textAlign: 'center', color: '#7F8C8D' }}>
              Loading patients…
            </div>
          )}
          {error && (
            <div style={{ padding: 16, background: '#FFEBEE', borderRadius: 10, color: '#C62828' }}>
              ⚠ {error}
            </div>
          )}

          {/* Patient Cards */}
          {!loading && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {patients.map((patient, idx) => (
                <div key={patient.id} className="pl-patient-card">
                  {/* Avatar + info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                    <div
                      className="pl-avatar"
                      style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                    >
                      {INITIALS(patient.name)}
                    </div>
                    <div>
                      <div className="pl-patient-name">{patient.name}</div>
                      <div className="pl-patient-id">📱 {patient.id}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                    <button
                      className="pl-action-btn pl-btn-blue"
                      onClick={() => navigate('/doctor/patient-summary', { state: { patient } })}
                    >
                      📋 View Summary &amp; Upload Reports
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}