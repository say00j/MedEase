import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { doctorRegister } from '../../api'

const inputStyle = {
  width: '100%', padding: '13px 15px', border: '1.5px solid #E0E4E8',
  borderRadius: 10, fontSize: 14, outline: 'none', background: '#FAFAFA',
  color: '#2C3E50', boxSizing: 'border-box', appearance: 'none',
}
const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#444',
  marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.4px',
}
const sectionTitle = {
  fontSize: 12, fontWeight: 700, color: '#D32F2F', textTransform: 'uppercase',
  letterSpacing: 1, margin: '25px 0 15px', paddingBottom: 8,
  borderBottom: '2px solid #FFEBEE',
}

export default function DoctorRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    license_number: '', name: '', phone_number: '',
    password: '', confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await doctorRegister({
        license_number: form.license_number,
        name: form.name,
        phone_number: form.phone_number,
        password: form.password,
      })
      setToast(true)
      setTimeout(() => navigate('/doctor/login'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', background: '#F5F7FA' }}>
        <div style={{ width: 380, background: 'linear-gradient(160deg, #D32F2F, #B71C1C)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 40px', color: 'white', position: 'sticky', top: 70, height: 'calc(100vh - 70px)' }}>
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" fill="rgba(255,255,255,0.15)" />
            <path d="M50 25V75M25 50H75" stroke="white" strokeWidth="10" strokeLinecap="round" />
          </svg>
          <h2 style={{ fontSize: 30, fontWeight: 800, textAlign: 'center', marginTop: 20 }}>Create Your Doctor Account</h2>
          <p style={{ opacity: 0.85, textAlign: 'center', lineHeight: 1.7, marginTop: 10, fontSize: 15 }}>Join MedEase and streamline your practice with intelligent patient management.</p>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 15, width: '100%' }}>
            {['Enter your license & contact details', 'Set up secure login credentials', 'Access your MedEase dashboard'].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: 14, opacity: 0.9 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px 40px', background: 'white', overflowY: 'auto' }}>
          <div className="animate-fade" style={{ width: '100%', maxWidth: 520 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFEBEE', color: '#D32F2F', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>🩺 Doctor Registration</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A2E', marginBottom: 6 }}>Create Doctor Account</h2>
            <p style={{ color: '#7F8C8D', marginBottom: 30, fontSize: 15 }}>All fields are required to complete registration.</p>

            <form onSubmit={handleRegister} noValidate>
              <div style={sectionTitle}>Professional Information</div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>License Number</label>
                <input style={inputStyle} type="text" placeholder="e.g. MCI-123456" value={form.license_number} onChange={set('license_number')} required />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} type="text" placeholder="e.g. Dr. Sarah Wilson" value={form.name} onChange={set('name')} required />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Phone Number</label>
                <input style={inputStyle} type="tel" placeholder="e.g. +91 9876543210" value={form.phone_number} onChange={set('phone_number')} required />
              </div>

              <div style={sectionTitle}>Login Credentials</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Password</label>
                  <input style={inputStyle} type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Confirm Password</label>
                  <input style={inputStyle} type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
                </div>
              </div>

              {error && <p style={{ color: '#D32F2F', fontSize: 13, marginBottom: 12, padding: '10px 14px', background: '#FFEBEE', borderRadius: 8 }}>⚠ {error}</p>}

              <button type="submit" disabled={loading} style={{ width: '100%', padding: 15, background: loading ? '#e57373' : '#D32F2F', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 10 }}>
                {loading ? 'Creating Account...' : 'Create Doctor Account →'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#7F8C8D' }}>
              Already have an account?{' '}
              <Link to="/doctor/login" style={{ color: '#D32F2F', fontWeight: 600, textDecoration: 'none' }}>Login here</Link>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 30, right: 30, background: '#2E7D32', color: 'white', padding: '15px 25px', borderRadius: 10, fontWeight: 600, fontSize: 15, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 9999 }}>
          ✅ Account created! Redirecting to login...
        </div>
      )}
    </>
  )
}
