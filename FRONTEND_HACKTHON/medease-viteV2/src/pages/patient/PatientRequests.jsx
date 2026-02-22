import { useEffect, useState } from "react"
import Navbar from "../../components/Navbar"
import Sidebar from "../../components/Sidebar"
import { getPatientRequests, updateRequestStatus } from "../../api"

export default function PatientRequests() {

  const mobile = sessionStorage.getItem("medease_patient_mobile")
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!mobile) return

    getPatientRequests(mobile)
      .then(setRequests)
      .finally(() => setLoading(false))
  }, [mobile])

  async function handleUpdate(id, status) {
    await updateRequestStatus(id, status)

    setRequests(prev =>
      prev.map(r =>
        r.request_id === id ? { ...r, status } : r
      )
    )
  }

  return (
    <>
      <Navbar />
      <div className="main-container">
        <Sidebar role="patient" />
        <main className="content-area animate-fade">
          <h2 style={{ marginBottom: 20, fontSize: 28 }}>
            Doctor Access Requests
          </h2>

          {loading && <p>Loading requests...</p>}

          {!loading && (
            <div className="data-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Doctor License</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.request_id}>
                      <td>{req.doctor_license}</td>
                      <td>{req.status}</td>
                      <td>
                        {req.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdate(req.request_id, "approved")}
                              style={{
                                marginRight: 10,
                                background: "#2E7D32",
                                color: "white",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: 6,
                                cursor: "pointer"
                              }}
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => handleUpdate(req.request_id, "rejected")}
                              style={{
                                background: "#C62828",
                                color: "white",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: 6,
                                cursor: "pointer"
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  )
}