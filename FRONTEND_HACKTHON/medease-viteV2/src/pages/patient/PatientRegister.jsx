import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { patientRegister } from '../../api'

const blue = '#1565C0'
const inputStyle = {
  width: '100%', padding: '13px 15px', border: '1.5px solid #E0E4E8',
  borderRadius: 10, fontSize: 14, outline: 'none', background: '#FAFAFA',
  color: '#2C3E50', boxSizing: 'border-box', appearance: 'none', fontFamily: 'inherit',
}
const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#444',
  marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.4px',
}
const sectionTitle = {
  fontSize: 12, fontWeight: 700, color: blue, textTransform: 'uppercase',
  letterSpacing: 1, margin: '25px 0 15px', paddingBottom: 8,
  borderBottom: '2px solid #E3F2FD',
}

export default function PatientRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    // identity
    mobile_number: '', name: '', password: '', confirmPassword: '',
    // medical_data fields
    dob: '', age: '', gender: '', blood_group: '', height: '', conditions: '',
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

    // Calculate age from dob if provided
    const age = form.dob
      ? Math.floor((new Date() - new Date(form.dob)) / (365.25 * 24 * 3600 * 1000))
      : form.age || null

    setLoading(true)
    try {
      await patientRegister({
        mobile_number: form.mobile_number,
        name: form.name,
        password: form.password,
        medical_data: {
          dob: form.dob,
          age,
          gender: form.gender,
          blood_group: form.blood_group,
          height: form.height,
          conditions: form.conditions,
        },
      })
      setToast(true)
      setTimeout(() => navigate('/patient/login'), 2000)
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
        {/* Left */}
        <div style={{ width: 380, background: `linear-gradient(160deg, ${blue}, #0D47A1)`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 40px', color: 'white', position: 'sticky', top: 70, height: 'calc(100vh - 70px)' }}>
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="35" r="22" fill="rgba(255,255,255,0.2)" />
            <path d="M20 80 Q20 60 50 60 Q80 60 80 80" stroke="white" strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="50" cy="35" r="16" stroke="white" strokeWidth="6" />
          </svg>
          <h2 style={{ fontSize: 30, fontWeight: 800, textAlign: 'center', marginTop: 20 }}>Create Your Patient Account</h2>
          <p style={{ opacity: 0.85, textAlign: 'center', lineHeight: 1.7, marginTop: 10, fontSize: 15 }}>Register with MedEase to manage your health records, appointments, and reports effortlessly.</p>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 15, width: '100%' }}>
            {['Enter your personal & health information', 'Set up your secure login credentials', 'Access your personal health dashboard'].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: 14, opacity: 0.9 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '50px 40px', background: 'white', overflowY: 'auto' }}>
          <div className="animate-fade" style={{ width: '100%', maxWidth: 520 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E3F2FD', color: blue, padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>👤 Patient Registration</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A2E', marginBottom: 6 }}>Create Patient Account</h2>
            <p style={{ color: '#7F8C8D', marginBottom: 30, fontSize: 15 }}>All details are stored securely and encrypted in our backend.</p>

            <form onSubmit={handleRegister} noValidate>
              {/* Account Info */}
              <div style={sectionTitle}>Account Information</div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Mobile Number</label>
                <input style={inputStyle} type="tel" placeholder="e.g. +91 9876543210" value={form.mobile_number} onChange={set('mobile_number')} required />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} type="text" placeholder="e.g. Sreehari Kumar" value={form.name} onChange={set('name')} required />
              </div>

              {/* Medical Data */}
              <div style={sectionTitle}>Medical Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Date of Birth</label>
                  <input style={inputStyle} type="date" value={form.dob} onChange={set('dob')} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Gender</label>
                  <select style={inputStyle} value={form.gender} onChange={set('gender')}>
                    <option value="">Select Gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Blood Group</label>
                  <select style={inputStyle} value={form.blood_group} onChange={set('blood_group')}>
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Height (cm)</label>
                  <input style={inputStyle} type="number" placeholder="e.g. 170" value={form.height} onChange={set('height')} />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Known Allergies / Medical Conditions</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} placeholder="e.g. Penicillin allergy, Diabetes Type 2..." value={form.conditions} onChange={set('conditions')}></textarea>
              </div>

              {/* Credentials */}
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

              <button type="submit" disabled={loading} style={{ width: '100%', padding: 15, background: loading ? '#64b5f6' : blue, color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 10 }}>
                {loading ? 'Creating Account...' : 'Create Patient Account →'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#7F8C8D' }}>
              Already have an account? <Link to="/patient/login" style={{ color: blue, fontWeight: 600, textDecoration: 'none' }}>Login here</Link>
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
