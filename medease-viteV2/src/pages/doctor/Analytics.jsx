import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const bars = [
  { label: 'Cardiology', height: '80%' },
  { label: 'Neurology', height: '45%' },
  { label: 'Pediatrics', height: '90%' },
  { label: 'Orthopedics', height: '60%' },
  { label: 'General', height: '75%' },
]

export default function Analytics() {
  return (
    <>
      <Navbar />
      <div className="main-container">
        <Sidebar role="doctor" />
        <main className="content-area animate-fade">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
            <div style={{ width: '80%', maxWidth: 800, background: 'white', padding: 40, borderRadius: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <h2 style={{ marginBottom: 10 }}>Patient Recovery Analytics</h2>
              <p style={{ color: '#7F8C8D' }}>Comparison of recovery rates across different departments</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 300, marginTop: 40, gap: 20 }}>
                {bars.map(b => (
                  <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: '100%', height: b.height, background: '#D32F2F', borderRadius: '8px 8px 0 0', transition: 'all 0.3s ease' }}></div>
                    <span style={{ fontSize: 14, color: '#7F8C8D', fontWeight: 600 }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
