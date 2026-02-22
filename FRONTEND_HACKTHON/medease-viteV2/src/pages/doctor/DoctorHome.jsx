import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

export default function DoctorHome() {
  const navigate = useNavigate()
  const license = sessionStorage.getItem('medease_doctor_license') || ''
  const name = sessionStorage.getItem('medease_doctor_name') || 'Doctor'
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'DR'

  function handleLogout() {
    sessionStorage.removeItem('medease_doctor_license')
    sessionStorage.removeItem('medease_doctor_name')
    navigate('/login')
  }

  return (
    <>
      <Navbar />
      <div className="main-container">
        <Sidebar role="doctor" />
        <main className="content-area animate-fade">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 40, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: 56, fontWeight: 800, color: '#D32F2F', lineHeight: 1.1, marginBottom: 15 }}>
                Welcome,<br />{name}!
              </h1>
              <p style={{ fontSize: 18, color: '#7F8C8D', maxWidth: 420 }}>
                Manage your patients, review analytics, and provide better care today.
              </p>
            </div>

            <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.07)', padding: 35, minWidth: 300, maxWidth: 340, borderTop: '5px solid #D32F2F' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #D32F2F, #B71C1C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: 'white', fontWeight: 800, margin: '0 auto 20px' }}>{initials}</div>
              <h3 style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, color: '#2C3E50', marginBottom: 5 }}>{name}</h3>
              <span style={{ display: 'block', textAlign: 'center', background: '#FFEBEE', color: '#D32F2F', padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>Verified Doctor</span>
              {[['License Number', license]].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0F0F0', fontSize: 14 }}>
                  <span style={{ color: '#7F8C8D', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontWeight: 700, color: '#2C3E50' }}>{value || '—'}</span>
                </div>
              ))}
              <button onClick={handleLogout} style={{ marginTop: 15, width: '100%', padding: 10, background: 'transparent', border: '1.5px solid rgb(255, 0, 0)', borderRadius: 8, color: 'rgb(246, 5, 5)', cursor: 'pointer', fontSize: 14 }}>Logout</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 40 }}>
            {[['5', "Today's Appointments"], ['142', 'Total Patients'], ['98%', 'Patient Satisfaction']].map(([num, label]) => (
              <div key={label} style={{ background: 'white', borderRadius: 14, padding: 25, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#D32F2F' }}>{num}</div>
                <div style={{ fontSize: 13, color: '#7F8C8D', marginTop: 5, fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  )
}
