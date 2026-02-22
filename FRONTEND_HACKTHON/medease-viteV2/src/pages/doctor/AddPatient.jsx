import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

export default function AddPatient() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    currentIssue: '',
    doctorNotes: '',
  })
  const [prevDataFile, setPrevDataFile] = useState(null)
  const [reportFile, setReportFile] = useState(null)
  const [saved, setSaved] = useState(false)

  const prevDataRef = useRef()
  const reportRef = useRef()

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSave(e) {
    e.preventDefault()
    navigate('/doctor/patient-summary', { state: { patient: { ...form, prevDataFile: prevDataFile?.name, reportFile: reportFile?.name } } })
  }

  return (
    <>
      <Navbar />
      <div className="main-container">
        <Sidebar role="doctor" />
        <main className="content-area animate-fade">
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#D32F2F', marginBottom: 4 }}>
              Add New Patient
            </h1>
            <p style={{ color: '#7F8C8D', fontSize: 15 }}>
              Fill in the patient's details, describe the current issue, and record your evaluation.
            </p>
          </div>

          {saved && (
            <div style={{
              background: 'linear-gradient(135deg,#D32F2F,#B71C1C)',
              color: '#fff',
              borderRadius: 10,
              padding: '14px 24px',
              marginBottom: 22,
              fontWeight: 600,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 4px 16px rgba(211,47,47,0.25)',
              animation: 'fadeIn 0.4s ease',
            }}>
              ✅ Patient saved successfully! Redirecting…
            </div>
          )}

          <form onSubmit={handleSave} className="ap-grid">
            {/* LEFT — Doctor Evaluation */}
            <div className="ap-panel">
              <div className="ap-panel-header">
                <span className="ap-panel-icon">🩺</span>
                <h2 className="ap-panel-title">Doctor's Evaluation</h2>
              </div>
              <p className="ap-panel-sub">Your immediate clinical assessment and direct thoughts on this patient.</p>
              <textarea
                name="doctorNotes"
                value={form.doctorNotes}
                onChange={handleChange}
                className="ap-textarea ap-textarea-grow"
                placeholder="e.g. Patient presents with mild tachycardia. Likely stress-induced. Rule out thyroid dysfunction…"
              />
            </div>

            {/* CENTER — Current Issue */}
            <div className="ap-panel ap-panel-center">
              <div className="ap-panel-header">
                <span className="ap-panel-icon">📝</span>
                <h2 className="ap-panel-title">Symptoms</h2>
              </div>
              <p className="ap-panel-sub">List all symptoms reported by the patient, including onset, duration, and severity.</p>
              <textarea
                name="currentIssue"
                value={form.currentIssue}
                onChange={handleChange}
                className="ap-textarea ap-textarea-grow"
                placeholder="e.g. Persistent headache for 3 days, mild fever (99°F), fatigue. No vomiting. Gradual onset…"
              />
            </div>

            {/* RIGHT — Patient Details */}
            <div className="ap-panel">
              <div className="ap-panel-header">
                <span className="ap-panel-icon">👤</span>
                <h2 className="ap-panel-title">Patient Details</h2>
              </div>
              <p className="ap-panel-sub">Basic information and medical records.</p>

              <div className="ap-fields">
                {[
                  { label: 'Full Name', name: 'name', type: 'text', placeholder: 'e.g. Anita Sharma', required: true },
                  { label: 'Age (years)', name: 'age', type: 'number', placeholder: 'e.g. 34', required: true },
                ].map(field => (
                  <div key={field.name} className="ap-field-group">
                    <label className="ap-label">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="ap-input"
                      min={field.type === 'number' ? 0 : undefined}
                    />
                  </div>
                ))}

                {/* Gender */}
                <div className="ap-field-group">
                  <label className="ap-label">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="ap-input"
                    required
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {[
                  { label: 'Height (cm)', name: 'height', type: 'number', placeholder: 'e.g. 165' },
                  { label: 'Weight (kg)', name: 'weight', type: 'number', placeholder: 'e.g. 60' },
                ].map(field => (
                  <div key={field.name} className="ap-field-group">
                    <label className="ap-label">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="ap-input"
                      min={field.type === 'number' ? 0 : undefined}
                    />
                  </div>
                ))}

                {/* Upload: Previous Data */}
                <div className="ap-field-group">
                  <label className="ap-label">Previous Medical Data</label>
                  <input
                    type="file"
                    ref={prevDataRef}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    style={{ display: 'none' }}
                    onChange={e => setPrevDataFile(e.target.files[0])}
                  />
                  <button
                    type="button"
                    className="ap-upload-btn"
                    onClick={() => prevDataRef.current.click()}
                  >
                    📎 {prevDataFile ? prevDataFile.name : 'Upload Previous Data'}
                  </button>
                </div>

                {/* Upload: Test Report */}
                <div className="ap-field-group">
                  <label className="ap-label">Test / Lab Report</label>
                  <input
                    type="file"
                    ref={reportRef}
                    accept=".pdf,.jpg,.png"
                    style={{ display: 'none' }}
                    onChange={e => setReportFile(e.target.files[0])}
                  />
                  <button
                    type="button"
                    className="ap-upload-btn"
                    onClick={() => reportRef.current.click()}
                  >
                    🧾 {reportFile ? reportFile.name : 'Upload Test Report'}
                  </button>
                </div>
              </div>

              <button type="submit" className="ap-save-btn">
                ✚ Save Patient
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  )
}
