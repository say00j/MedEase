import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { doctorLogin } from '../../api'

export default function DoctorLogin() {
  const navigate = useNavigate()
  const [licenseNumber, setLicenseNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await doctorLogin({ license_number: licenseNumber, password })
      sessionStorage.setItem('medease_doctor_license', licenseNumber)
      if (res.name) sessionStorage.setItem('medease_doctor_name', res.name)
      navigate('/doctor/home')
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
        <div style={{ flex: 1, background: 'linear-gradient(145deg, #D32F2F, #B71C1C)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', color: 'white' }}>
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" fill="rgba(255,255,255,0.15)" />
            <path d="M50 25V75M25 50H75" stroke="white" strokeWidth="10" strokeLinecap="round" />
          </svg>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: '20px 0 15px', textAlign: 'center' }}>Doctor's Portal</h2>
          <p style={{ opacity: 0.85, textAlign: 'center', maxWidth: 300, lineHeight: 1.7 }}>Access patient records, schedules, and clinical analytics in one unified platform.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 40 }}>
            <span style={{ width: 28, height: 10, borderRadius: 5, background: 'white' }}></span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }}></span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }}></span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white' }}>
          <div style={{ width: '100%', maxWidth: 420, padding: '50px 40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFEBEE', color: '#D32F2F', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>🩺 Doctor Account</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#1A1A2E', marginBottom: 8 }}>Welcome Back, Doctor</h2>
            <p style={{ color: '#7F8C8D', marginBottom: 35, fontSize: 15 }}>Enter your license number and password to access the portal.</p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>License Number</label>
                <input type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)}
                  placeholder="e.g. MCI-123456" required
                  style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E0E4E8', borderRadius: 10, fontSize: 15, outline: 'none', background: '#FAFAFA', color: '#2C3E50', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" required
                  style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #E0E4E8', borderRadius: 10, fontSize: 15, outline: 'none', background: '#FAFAFA', color: '#2C3E50', boxSizing: 'border-box' }} />
              </div>

              {error && <p style={{ color: '#D32F2F', fontSize: 13, marginBottom: 15, padding: '10px 14px', background: '#FFEBEE', borderRadius: 8 }}>⚠ {error}</p>}

              <button type="submit" disabled={loading} style={{ width: '100%', padding: 15, background: loading ? '#e57373' : '#D32F2F', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.5px' }}>
                {loading ? 'Signing in...' : 'Login to Doctor Portal'}
              </button>
            </form>

            <div style={{ textAlign: 'center', color: '#ccc', margin: '20px 0', fontSize: 13 }}>or</div>
            <Link to="/doctor/register" style={{ display: 'block', width: '100%', padding: 14, border: '2px solid #D32F2F', color: '#D32F2F', borderRadius: 10, fontSize: 15, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>+ Create New Doctor Account</Link>
            <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: 20, fontSize: 14, color: '#7F8C8D', textDecoration: 'none' }}>
              ← Back to <span style={{ color: '#D32F2F', fontWeight: 600 }}>Role Selection</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
