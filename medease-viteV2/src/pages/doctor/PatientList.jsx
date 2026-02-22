import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const appointments = [
  { id: '01', name: 'John Doe', time: '09:00 AM', detail: 'Routine Checkup' },
  { id: '02', name: 'Jane Smith', time: '10:30 AM', detail: 'Cardiac Review' },
  { id: '03', name: 'Robert Johnson', time: '11:15 AM', detail: 'Follow-up' },
  { id: '04', name: 'Alice Williams', time: '02:00 PM', detail: 'Vaccination' },
  { id: '05', name: 'Michael Brown', time: '03:45 PM', detail: 'General Consultation' },
]

export default function PatientList() {
  return (
    <>
      <Navbar />
      <div className="main-container">
        <Sidebar role="doctor" />
        <main className="content-area animate-fade">
          <h2 style={{ marginBottom: 20, fontSize: 28 }}>Daily Appointments</h2>
          <div className="data-table-container">
            <table>
              <thead>
                <tr>
                  <th>Sl No</th>
                  <th>Patient Name</th>
                  <th>Time</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.name}</td>
                    <td>{a.time}</td>
                    <td>
                      <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#E3F2FD', color: '#1976D2' }}>
                        {a.detail}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn-add">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </main>
      </div>
    </>
  )
}
