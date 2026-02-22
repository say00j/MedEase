import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { getPatients } from '../../api'

export default function PatientList() {

  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
const [showModal, setShowModal] = useState(false)

function handlePatientClick(patient) {
  setSelectedPatient(patient)
  setShowModal(true)
}

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPatients()
        setPatients(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  async function sendRequest() {
  try {
    const doctorLicense = sessionStorage.getItem('medease_doctor_license')

    await fetch("http://localhost:5000/request-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        doctor_license: doctorLicense,
        patient_mobile: selectedPatient.id
      })
    })

    alert("Access request sent to patient.")
    setShowModal(false)

  } catch (err) {
    alert("Failed to send request.")
  }
}

  return (
    <>
      <Navbar />
      <div className="main-container">
        <Sidebar role="doctor" />
        <main className="content-area animate-fade">
          <h2 style={{ marginBottom: 20, fontSize: 28 }}>
            Available Patients
          </h2>

          {loading && <p>Loading patients...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && !error && (
            <div className="data-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Mobile Number</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(patient => (
                    <tr 
                      key={patient.id}
                      onClick={() => handlePatientClick(patient)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{patient.id}</td>
                      <td>{patient.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {showModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  }}>
    <div style={{
      background: 'white',
      padding: 30,
      borderRadius: 12,
      width: 400,
      textAlign: 'center'
    }}>
      <h3 style={{ marginBottom: 15 }}>
        Access Patient Data
      </h3>

      <p style={{ marginBottom: 25 }}>
        To access <b>{selectedPatient?.name}</b>'s medical data,
        patient consent is required.
        <br /><br />
        Send access request?
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 15 }}>
        <button
          onClick={sendRequest}
          style={{
            padding: '10px 20px',
            background: '#2E7D32',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          Yes
        </button>

        <button
          onClick={() => setShowModal(false)}
          style={{
            padding: '10px 20px',
            background: '#C62828',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          No
        </button>
      </div>
    </div>
  </div>
)}
            </div>
          )}
        </main>
      </div>
    </>
  )
}