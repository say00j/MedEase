import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { getPatient, analyseStream } from '../../api'

const blue = '#1565C0'

export default function PatientDetails() {
  const navigate = useNavigate()
  const mobile = sessionStorage.getItem('medease_patient_mobile') || ''
  const [pat, setPat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // AI Analysis state
  const [analysisText, setAnalysisText] = useState('')
  const [analysisResult, setAnalysisResult] = useState('')
  const [analysing, setAnalysing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')

  useEffect(() => {
    if (!mobile) { navigate('/patient/login'); return }
    getPatient(mobile)
      .then(data => {
        setPat(data)
        // Pre-fill analysis box with their medical data
        const med = data.medical_data || {}
        const summary = [
          med.conditions && `Conditions/Allergies: ${med.conditions}`,
          med.blood_group && `Blood Group: ${med.blood_group}`,
          med.gender && `Gender: ${med.gender}`,
          med.age && `Age: ${med.age}`,
        ].filter(Boolean).join('\n')
        setAnalysisText(summary)
      })
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false))
  }, [mobile])

  async function handleAnalyse(e) {
    e.preventDefault()
    if (!analysisText.trim()) return
    setAnalysisResult('')
    setAnalysisError('')
    setAnalysing(true)
    try {
      await analyseStream(analysisText, (chunk) => {
        setAnalysisResult(prev => prev + chunk)
      })
    } catch (err) {
      setAnalysisError(err.message)
    } finally {
      setAnalysing(false)
    }
  }

  const med = pat?.medical_data || {}
  const fullName = pat?.name || 'Patient Name'
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
                <p>Loading your health details...</p>
              </div>
            </div>
          )}

          {fetchError && (
            <div style={{ background: '#FFEBEE', color: '#D32F2F', padding: '20px 24px', borderRadius: 12, marginBottom: 24, fontSize: 15 }}>
              ⚠ Failed to load data: {fetchError}
            </div>
          )}

          {!loading && pat && (
            <>
              {/* Profile Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 30, background: 'white', padding: '35px 40px', borderRadius: 20, boxShadow: '0 4px 25px rgba(0,0,0,0.05)', marginBottom: 35, borderLeft: `6px solid ${blue}` }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: `linear-gradient(135deg, ${blue}, #0D47A1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: 'white', fontWeight: 800, flexShrink: 0 }}>{initials}</div>
                <div>
                  <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{fullName}</h3>
                  <p style={{ color: '#7F8C8D', fontSize: 15 }}>{mobile}</p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                    {[
                      [`Blood: ${med.blood_group || '—'}`, '#FFEBEE', '#C62828'],
                      [`Age: ${med.age || '—'}`, '#E8F5E9', '#2E7D32'],
                      [`${med.gender || 'Unknown'}`, '#E3F2FD', blue],
                    ].map(([text, bg, color]) => (
                      <span key={text} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: bg, color }}>{text}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 35 }}>
                <div style={{ background: 'white', borderRadius: 14, padding: 25, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: blue, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 18, paddingBottom: 10, borderBottom: `2px solid #E3F2FD` }}>Personal Information</h4>
                  {[['Full Name', fullName], ['Date of Birth', med.dob || '—'], ['Age', med.age ? med.age + ' yrs' : '—'], ['Gender', med.gender || '—'], ['Mobile', mobile]].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0F0F0', fontSize: 14 }}>
                      <span style={{ color: '#7F8C8D' }}>{label}</span>
                      <span style={{ fontWeight: 700, color: '#2C3E50' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'white', borderRadius: 14, padding: 25, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: blue, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 18, paddingBottom: 10, borderBottom: `2px solid #E3F2FD` }}>Medical Information</h4>
                  {[['Blood Group', med.blood_group || '—'], ['Height', med.height ? med.height + ' cm' : '—']].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0F0F0', fontSize: 14 }}>
                      <span style={{ color: '#7F8C8D' }}>{label}</span>
                      <span style={{ fontWeight: 700, color: '#2C3E50' }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ color: '#7F8C8D', marginTop: 15, fontSize: 13 }}>Known Conditions / Allergies</div>
                  <div style={{ background: '#FFF8E1', borderRadius: 10, padding: 15, fontSize: 14, color: '#5D4037', marginTop: 10, lineHeight: 1.6 }}>
                    {med.conditions || 'None mentioned.'}
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              <div style={{ background: 'white', borderRadius: 14, padding: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: 35 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#D32F2F', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 18, paddingBottom: 10, borderBottom: '2px solid #FFEBEE' }}>🤖 AI Medical Analysis</h4>
                <form onSubmit={handleAnalyse}>
                  <textarea
                    value={analysisText}
                    onChange={e => setAnalysisText(e.target.value)}
                    placeholder="Paste medical text or describe symptoms for AI analysis..."
                    style={{ width: '100%', minHeight: 120, padding: '13px 15px', border: '1.5px solid #E0E4E8', borderRadius: 10, fontSize: 14, outline: 'none', background: '#FAFAFA', color: '#2C3E50', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                  <button type="submit" disabled={analysing} style={{ marginTop: 12, padding: '12px 28px', background: analysing ? '#e57373' : '#D32F2F', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: analysing ? 'not-allowed' : 'pointer' }}>
                    {analysing ? 'Analysing...' : '✨ Analyse with AI'}
                  </button>
                </form>

                {analysisError && (
                  <div style={{ marginTop: 16, padding: '12px 16px', background: '#FFEBEE', color: '#D32F2F', borderRadius: 8, fontSize: 14 }}>
                    ⚠ {analysisError}
                  </div>
                )}

                {analysisResult && (
                  <div style={{ marginTop: 20, padding: '20px 24px', background: '#F8F9FA', borderRadius: 12, borderLeft: '4px solid #D32F2F', fontSize: 15, lineHeight: 1.8, color: '#2C3E50', whiteSpace: 'pre-wrap' }}>
                    {analysisResult}
                    {analysing && <span style={{ display: 'inline-block', width: 8, height: 16, background: '#D32F2F', marginLeft: 4, animation: 'pulse 1s infinite' }} />}
                  </div>
                )}
              </div>

              {/* Appointments Table */}
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>Appointment History</h2>
              <div className="data-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Appointment ID</th>
                      <th>Doctor Name</th>
                      <th>Date</th>
                      <th>Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['#APT-9921', 'Dr. Sarah Wilson', 'Jan 12, 2026'],
                      ['#APT-8842', 'Dr. Michael Chen', 'Dec 5, 2025'],
                      ['#APT-7731', 'Dr. Emily Davis', 'Nov 18, 2025'],
                    ].map(([id, doc, date]) => (
                      <tr key={id}>
                        <td>{id}</td>
                        <td>{doc}</td>
                        <td>{date}</td>
                        <td><a href="#" style={{ color: blue, fontWeight: 600, textDecoration: 'none' }}>Download PDF</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  )
}
