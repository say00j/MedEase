import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

export default function PatientSummary() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const patient = state?.patient || {}

    const [combinedNotes, setCombinedNotes] = useState('')
    const [medicineRec, setMedicineRec] = useState('')
    const [submitted, setSubmitted] = useState(false)

    // Auto-build narrative from the form data
    const narrative = [
        patient.name && `Patient ${patient.name}`,
        patient.age && `(${patient.age} yrs${patient.gender ? `, ${patient.gender}` : ''})`,
        patient.height && `Height: ${patient.height} cm`,
        patient.weight && `Weight: ${patient.weight} kg`,
        patient.currentIssue && `presents with — ${patient.currentIssue}`,
    ]
        .filter(Boolean)
        .join(', ')

    function handleSubmit(e) {
        e.preventDefault()
        navigate('/doctor/test-results', {
            state: {
                patient,
                combinedNotes,
                medicineRec,
            }
        })
    }

    return (
        <>
            <Navbar />
            <div className="main-container">
                <Sidebar role="doctor" />
                <main className="content-area animate-fade">
                    {/* Page header */}
                    <div style={{ marginBottom: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
                            <button
                                onClick={() => navigate(-1)}
                                style={{
                                    background: '#FFEBEE',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '7px 14px',
                                    color: '#D32F2F',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                ← Back
                            </button>
                            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#D32F2F' }}>
                                Patient Report
                            </h1>
                        </div>
                        <p style={{ color: '#7F8C8D', fontSize: 14, marginLeft: 94 }}>
                            Review the summary, add suggestions, and record your final comments before saving.
                        </p>
                    </div>

                    {submitted && (
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
                            ✅ Report saved! Redirecting to Patient List…
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                        {/* ── Section 1: Narrative Summary ── */}
                        <div className="ps-card">
                            <div className="ps-card-header">
                                <div className="ps-icon-badge">📋</div>
                                <div>
                                    <h2 className="ps-card-title">Narrative Summary</h2>
                                    <p className="ps-card-sub">Auto-generated from patient intake form. Edit if needed.</p>
                                </div>
                            </div>
                            <div className="ps-narrative-box">
                                {/* Patient info chips */}
                                <div className="ps-chips">
                                    {patient.name && <span className="ps-chip">👤 {patient.name}</span>}
                                    {patient.age && <span className="ps-chip">🎂 {patient.age} yrs</span>}
                                    {patient.gender && <span className="ps-chip">⚧ {patient.gender}</span>}
                                    {patient.height && <span className="ps-chip">📏 {patient.height} cm</span>}
                                    {patient.weight && <span className="ps-chip">⚖️ {patient.weight} kg</span>}
                                </div>
                                {/* Symptoms */}
                                {patient.currentIssue && (
                                    <div className="ps-section-block">
                                        <span className="ps-block-label">Symptoms</span>
                                        <p className="ps-block-text">{patient.currentIssue}</p>
                                    </div>
                                )}
                                {/* Doctor eval (from previous page) */}
                                {patient.doctorNotes && (
                                    <div className="ps-section-block">
                                        <span className="ps-block-label">Initial Evaluation</span>
                                        <p className="ps-block-text">{patient.doctorNotes}</p>
                                    </div>
                                )}
                                {!narrative && (
                                    <p style={{ color: '#7F8C8D', fontSize: 14 }}>No patient data received.</p>
                                )}
                            </div>
                        </div>

                        {/* ── Section 2: Assessment & Recommendation ── */}
                        <div className="ps-bottom-grid">
                            <div className="ps-card">
                                <div className="ps-card-header">
                                    <div className="ps-icon-badge ps-icon-green">📋</div>
                                    <div>
                                        <h2 className="ps-card-title">Assessment &amp; Plan</h2>
                                        <p className="ps-card-sub">Suggestions, next steps, and clinical notes.</p>
                                    </div>
                                </div>
                                <textarea
                                    value={combinedNotes}
                                    onChange={e => setCombinedNotes(e.target.value)}
                                    className="ap-textarea"
                                    style={{ flex: 1, minHeight: 150, marginTop: 10 }}
                                    placeholder="e.g. CBC & thyroid panel ordered. Follow-up in 1 week..."
                                />
                            </div>

                            <div className="ps-card">
                                <div className="ps-card-header">
                                    <div className="ps-icon-badge" style={{ background: '#FCE4EC' }}>💉</div>
                                    <div>
                                        <h2 className="ps-card-title">Test Recommendation</h2>
                                        <p className="ps-card-sub">Specific tests or drugs to recommend.</p>
                                    </div>
                                </div>
                                <textarea
                                    value={medicineRec}
                                    onChange={e => setMedicineRec(e.target.value)}
                                    className="ap-textarea"
                                    style={{ flex: 1, minHeight: 150, marginTop: 10 }}
                                    placeholder="e.g. Tab. Azithromycin 500mg OD × 3 days..."
                                />
                            </div>
                        </div>

                        {/* Next button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="ap-save-btn" style={{ width: 'auto', padding: '13px 40px' }}>
                                Next →
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </>
    )
}
