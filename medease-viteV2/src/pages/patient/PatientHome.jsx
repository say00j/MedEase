import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { getPatient } from '../../api'

const blue = '#1565C0'

export default function PatientHome() {
  const navigate = useNavigate()
  const mobile = sessionStorage.getItem('medease_patient_mobile') || ''
  const [pat, setPat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    if (!mobile) { navigate('/patient/login'); return }
    getPatient(mobile)
      .then(data => setPat(data))
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false))
  }, [mobile])

  function handleLogout() {
    sessionStorage.removeItem('medease_patient_mobile')
    navigate('/login')
  }

  const med = pat?.medical_data || {}
  const firstName = pat?.name?.split(' ')[0] || 'Patient'
  const initials = pat?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'PT'

  return (
    <>
      <Navbar />
      <div className="main-container">
        <Sidebar role="patient" />
        <main className="content-area animate-fade">
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
              <div style={{ textAlign: 'center', color: '#7F8C8D' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                <p>Loading your health data...</p>
              </div>
            </div>
          )}

          {fetchError && (
            <div style={{ background: '#FFEBEE', color: '#D32F2F', padding: '20px 24px', borderRadius: 12, marginBottom: 24, fontSize: 15 }}>
              ⚠ Failed to load patient data: {fetchError}
            </div>
          )}

          {!loading && pat && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 40, flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ fontSize: 56, fontWeight: 800, color: blue, lineHeight: 1.1, marginBottom: 15 }}>
                    Hello,<br />{firstName}!
                  </h1>
                  <p style={{ fontSize: 18, color: '#7F8C8D', maxWidth: 420 }}>
                    Welcome back to your MedEase health dashboard. Stay on top of your wellbeing.
                  </p>
                </div>

                <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.07)', padding: 35, minWidth: 300, maxWidth: 340, borderTop: `5px solid ${blue}` }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${blue}, #0D47A1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: 'white', fontWeight: 800, margin: '0 auto 20px' }}>{initials}</div>
                  <h3 style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, color: '#2C3E50', marginBottom: 5 }}>{pat.name}</h3>
                  <span style={{ display: 'block', textAlign: 'center', background: '#E3F2FD', color: blue, padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>{mobile}</span>
                  {[
                    ['Date of Birth', med.dob || '—'],
                    ['Age', med.age ? med.age + ' yrs' : '—'],
                    ['Gender', med.gender || '—'],
                    ['Blood Group', med.blood_group || '—'],
                    ['Height', med.height ? med.height + ' cm' : '—'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0F0F0', fontSize: 14 }}>
                      <span style={{ color: '#7F8C8D', fontWeight: 500 }}>{label}</span>
                      <span style={{ fontWeight: 700, color: '#2C3E50' }}>{value}</span>
                    </div>
                  ))}
                  <button onClick={handleLogout} style={{ marginTop: 15, width: '100%', padding: 10, background: 'transparent', border: '1.5px solid #E0E4E8', borderRadius: 8, color: '#7F8C8D', cursor: 'pointer', fontSize: 14 }}>Logout</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 40 }}>
                {[['3', 'Appointments'], [med.blood_group || '—', 'Blood Group'], [med.height ? med.height + ' cm' : '—', 'Height']].map(([num, label]) => (
                  <div key={label} style={{ background: 'white', borderRadius: 14, padding: 25, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: blue }}>{num}</div>
                    <div style={{ fontSize: 13, color: '#7F8C8D', marginTop: 5, fontWeight: 500 }}>{label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  )
}
