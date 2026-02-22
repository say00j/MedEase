import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { patientLogin } from '../../api'

const blue = '#1565C0'

export default function PatientLogin() {
  const navigate = useNavigate()
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await patientLogin({ mobile_number: mobile, password })
      // Store mobile for fetching patient data on subsequent pages
      sessionStorage.setItem('medease_patient_mobile', mobile)
      navigate('/patient/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', height: 'calc(100vh - 70px)', background: '#F5F7FA' }}>
        <div style={{ flex: 1, background: 'linear-gradient(145deg, #1565C0, #0D47A1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', color: 'white' }}>
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="35" r="22" fill="rgba(255,255,255,0.2)" />
            <path d="M20 80 Q20 60 50 60 Q80 60 80 80" stroke="white" strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="50" cy="35" r="16" stroke="white" strokeWidth="6" />
          </svg>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: '20px 0 15px', textAlign: 'center' }}>Patient Portal</h2>
          <p style={{ opacity: 0.85, textAlign: 'center', maxWidth: 300, lineHeight: 1.7 }}>View your health records, upcoming appointments, and reports all in one secure place.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 40 }}>
            <span style={{ width: 28, height: 10, borderRadius: 5, background: 'white' }}></span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }}></span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }}></span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white' }}>
          <div style={{ width: '100%', maxWidth: 420, padding: '50px 40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E3F2FD', color: blue, padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>👤 Patient Account</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#1A1A2E', marginBottom: 8 }}>Hello, Patient!</h2>
            <p style={{ color: '#7F8C8D', marginBottom: 35, fontSize: 15 }}>Log in with your mobile number and password to access your health dashboard.</p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mobile Number</label>
                <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="e.g. +91 9876543210" required
                  style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E0E4E8', borderRadius: 10, fontSize: 15, outline: 'none', background: '#FAFAFA', color: '#2C3E50', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required
                  style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E0E4E8', borderRadius: 10, fontSize: 15, outline: 'none', background: '#FAFAFA', color: '#2C3E50', boxSizing: 'border-box' }} />
              </div>

              {error && <p style={{ color: '#D32F2F', fontSize: 13, marginBottom: 15, padding: '10px 14px', background: '#FFEBEE', borderRadius: 8 }}>⚠ {error}</p>}

              <button type="submit" disabled={loading} style={{ width: '100%', padding: 15, background: loading ? '#64b5f6' : blue, color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.5px' }}>
                {loading ? 'Signing in...' : 'Login to Patient Portal'}
              </button>
            </form>

            <div style={{ textAlign: 'center', color: '#ccc', margin: '20px 0', fontSize: 13 }}>or</div>
            <Link to="/patient/register" style={{ display: 'block', width: '100%', padding: 14, border: `2px solid ${blue}`, color: blue, borderRadius: 10, fontSize: 15, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>+ Create New Patient Account</Link>
            <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: 20, fontSize: 14, color: '#7F8C8D', textDecoration: 'none' }}>
              ← Back to <span style={{ color: blue, fontWeight: 600 }}>Role Selection</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
