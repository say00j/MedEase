import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const styles = {
  loginContainer: {
    display: 'flex',
    height: 'calc(100vh - 70px)',
    background: 'white',
  },
  loginLeft: {
    flex: 1,
    background: '#F8F9FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px',
  },
  loginRight: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '100px',
  },
  loginTabs: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
  },
  tabBtn: {
    flex: 1,
    padding: '15px',
    border: '2px solid #D32F2F',
    background: 'transparent',
    color: '#D32F2F',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    fontSize: '15px',
  },
  illustration: {
    maxWidth: '80%',
    height: 'auto',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
    objectFit: 'cover',
  },
}

export default function RoleSelect() {
  return (
    <>
      <Navbar />
      <div className="animate-fade" style={styles.loginContainer}>
        <div style={styles.loginLeft}>
          <img src="/img/d2.jpg" alt="MedEase Illustration" style={styles.illustration} />
        </div>
        <div style={styles.loginRight}>
          <h2 style={{ fontSize: 32, marginBottom: 10, color: '#2C3E50' }}>Welcome to MedEase</h2>
          <p style={{ color: '#7F8C8D', marginBottom: 40 }}>
            Your professional healthcare assistant. Please select your role to continue.
          </p>
          <div style={styles.loginTabs}>
            <Link to="/doctor/login" style={styles.tabBtn}>Login as Doctor</Link>
            <Link to="/patient/login" style={styles.tabBtn}>Login as Patient</Link>
          </div>
        </div>
      </div>
    </>
  )
}
