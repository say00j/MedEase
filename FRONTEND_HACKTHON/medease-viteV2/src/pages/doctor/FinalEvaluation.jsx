import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

export default function FinalEvaluation() {
    const { state } = useLocation()
    const navigate = useNavigate()

    const { patient = {}, combinedNotes = '', medicineRec: initMedRec = '' } = state || {}
    const [medicineRec, setMedicineRec] = useState(initMedRec)

    const today = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
    })

    return (
        <>
            <Navbar />
            <div className="main-container">
                <Sidebar role="doctor" />
                <main className="content-area animate-fade">

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                                <button
                                    onClick={() => navigate(-1)}
                                    style={{
                                        background: '#FFEBEE', border: 'none', borderRadius: 8,
                                        padding: '7px 14px', color: '#D32F2F', fontWeight: 700,
                                        cursor: 'pointer', fontSize: 13,
                                    }}
                                >
                                    ← Back
                                </button>
                                <h1 style={{ fontSize: 30, fontWeight: 800, color: '#D32F2F' }}>
                                    Final Evaluation
                                </h1>
                                <span style={{
                                    background: '#E8F5E9', color: '#2E7D32', borderRadius: 20,
                                    padding: '4px 14px', fontSize: 12, fontWeight: 700,
                                }}>
                                    ✓ Complete
                                </span>
                            </div>
                            <p style={{ color: '#7F8C8D', fontSize: 14, marginLeft: 100 }}>
                                Generated on {today} &nbsp;·&nbsp; MedEase Patient Report
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={() => window.print()}
                                style={{
                                    background: '#F5F7FA', border: '1.5px solid #E0E4E8',
                                    borderRadius: 9, padding: '10px 20px', fontWeight: 600,
                                    fontSize: 14, cursor: 'pointer', color: '#2C3E50',
                                }}
                            >
                                🖨️ Print
                            </button>
                            <button
                                onClick={() => navigate('/doctor/test-review', {
                                    state: { patient, combinedNotes, medicineRec }
                                })}
                                className="ap-save-btn"
                                style={{ width: 'auto', padding: '10px 24px', marginTop: 0 }}
                            >
                                ✔ Next
                            </button>
                        </div>
                    </div>

                    {/* Patient Identity Banner */}
                    <div className="fe-banner">
                        <div className="fe-avatar">
                            {patient.name ? patient.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2C3E50', marginBottom: 8 }}>
                                {patient.name || 'Unknown Patient'}
                            </h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {patient.age && <span className="ps-chip">🎂 {patient.age} yrs</span>}
                                {patient.gender && <span className="ps-chip">⚧ {patient.gender}</span>}
                                {patient.height && <span className="ps-chip">📏 {patient.height} cm</span>}
                                {patient.weight && <span className="ps-chip">⚖️ {patient.weight} kg</span>}
                                {patient.prevDataFile && <span className="ps-chip fe-chip-grey">📎 {patient.prevDataFile}</span>}
                                {patient.reportFile && <span className="ps-chip fe-chip-grey">🧾 {patient.reportFile}</span>}
                            </div>
                        </div>
                    </div>

                    {/* 2-col report grid */}
                    <div className="fe-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>

                        {/* Summary — machine-generated narrative */}
                        <div className="fe-card">
                            <div className="fe-card-header">
                                <span className="fe-dot fe-dot-red" />
                                <span className="fe-card-label">Summary</span>
                                <span style={{
                                    marginLeft: 'auto', background: '#FFF3E0', color: '#E65100',
                                    borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
                                }}>⚡ Auto-generated</span>
                            </div>
                            <p className="fe-card-body" style={{ lineHeight: 1.9 }}>
                                {[
                                    patient.name && `Patient ${patient.name}`,
                                    patient.age && `(${patient.age} yrs${patient.gender ? `, ${patient.gender}` : ''})`,
                                    patient.height && `Ht: ${patient.height} cm`,
                                    patient.weight && `Wt: ${patient.weight} kg`,
                                    patient.currentIssue && `presents with ${patient.currentIssue}.`,
                                    patient.doctorNotes && `Initial evaluation: ${patient.doctorNotes}.`,
                                    combinedNotes && `Assessment & plan: ${combinedNotes}.`,
                                ].filter(Boolean).join(' ') || <span className="fe-empty">No summary data available.</span>}
                            </p>
                        </div>

                        {/* Medicine Recommendation — editable */}
                        <div className="fe-card">
                            <div className="fe-card-header">
                                <span className="fe-dot" style={{ background: '#E91E63' }} />
                                <span className="fe-card-label">Test Recommendation</span>
                            </div>
                            <textarea
                                value={medicineRec}
                                onChange={e => setMedicineRec(e.target.value)}
                                className="ap-textarea"
                                style={{ flex: 1, minHeight: 180, marginTop: 8 }}
                                placeholder="e.g. Tab. Azithromycin 500mg OD × 3 days, Syrup Benadryl 10ml TDS…"
                            />
                        </div>
                    </div>

                </main>
            </div>
        </>
    )
}
