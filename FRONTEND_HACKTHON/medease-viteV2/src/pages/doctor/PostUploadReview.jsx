import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

export default function PostUploadReview() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const patient = state?.patient || {}

    const [evaluation, setEvaluation] = useState('')
    const [medicineRec, setMedicineRec] = useState('')

    const initials = patient.name
        ? patient.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'PT'

    return (
        <>
            <Navbar />
            <div className="main-container">
                <Sidebar role="doctor" />
                <main className="content-area animate-fade">

                    {/* ── Header ── */}
                    <div className="tr-page-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <button className="tr-back-btn" onClick={() => navigate(-1)}>← Back</button>
                            <div>
                                <h1 className="tr-page-title">📝 Post-Upload Review</h1>
                                <p className="tr-page-sub">Add evaluation notes and medicine recommendations after reviewing the uploaded reports</p>
                            </div>
                        </div>

                        {/* Patient chip */}
                        <div style={{
                            background: 'rgba(255,255,255,0.18)', borderRadius: 12,
                            padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.3)', color: '#fff',
                                fontWeight: 800, fontSize: 14, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                            }}>{initials}</div>
                            <div>
                                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{patient.name || 'Unknown'}</div>
                                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{patient.id}</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Two-column sections ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>

                        {/* LEFT — Evaluation & Doctor's Comment */}
                        <div className="fe-card" style={{ borderTop: '4px solid #D32F2F' }}>
                            <div className="fe-card-header" style={{ marginBottom: 6 }}>
                                <span className="fe-dot fe-dot-red" />
                                <span className="fe-card-label">Evaluation &amp; Doctor's Comment</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#90A4AE', marginBottom: 12, lineHeight: 1.6 }}>
                                Summarise your evaluation of the uploaded test &amp; medicine reports. Include clinical observations and any follow-up notes.
                            </p>
                            <textarea
                                className="ap-textarea"
                                value={evaluation}
                                onChange={e => setEvaluation(e.target.value)}
                                style={{ minHeight: 260 }}
                                placeholder="e.g. Haemoglobin levels are borderline low (10.2 g/dL). CBC suggests mild anaemia. Patient is responding to iron therapy. Recommend repeat CBC in 2 weeks and review diet..."
                            />
                        </div>

                        {/* RIGHT — Medicine Recommendation */}
                        <div className="fe-card" style={{ borderTop: '4px solid #E91E63' }}>
                            <div className="fe-card-header" style={{ marginBottom: 6 }}>
                                <span className="fe-dot" style={{ background: '#E91E63' }} />
                                <span className="fe-card-label">Medicine Recommendation</span>
                                <span style={{
                                    marginLeft: 'auto', background: '#FCE4EC', color: '#C2185B',
                                    borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700,
                                }}>💊 Prescription</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#90A4AE', marginBottom: 12, lineHeight: 1.6 }}>
                                List drugs, dosage, frequency and duration based on the uploaded results.
                            </p>
                            <textarea
                                className="ap-textarea"
                                value={medicineRec}
                                onChange={e => setMedicineRec(e.target.value)}
                                style={{ minHeight: 260, borderColor: '#F8BBD0' }}
                                placeholder="e.g. Tab. Ferrous Sulphate 200mg OD × 4 weeks&#10;Tab. Vitamin C 500mg OD&#10;Syrup Liv 52 10ml BD × 2 weeks&#10;Review after CBC..."
                            />
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                        <button
                            onClick={() => window.print()}
                            style={{
                                background: '#F5F7FA', border: '1.5px solid #E0E4E8',
                                borderRadius: 10, padding: '12px 24px', fontWeight: 700,
                                fontSize: 14, cursor: 'pointer', color: '#2C3E50',
                            }}
                        >
                            🖨️ Print
                        </button>
                        <button
                            className="ap-save-btn"
                            style={{ width: 'auto', padding: '12px 28px', marginTop: 0 }}
                            onClick={() => navigate('/doctor/patients')}
                        >
                            ✔ Finalise &amp; Done
                        </button>
                    </div>

                </main>
            </div>
        </>
    )
}
