import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { analyseStream } from '../../api'

export default function PatientDataSummary() {
    const location = useLocation()
    const navigate = useNavigate()
    const { patient = {} } = location.state || {}

    const [isAnalysing, setIsAnalysing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState('')
    const [error, setError] = useState('')

    const initials = patient.name
        ? patient.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'PT'

    const handleGenerateAnalysis = async () => {
        setIsAnalysing(true)
        setError('')
        setAnalysisResult('')

        // Construct the prompt for the AI based on collected data
        const medicalText = `
        Patient Name: ${patient.name || 'Unknown'}
        Age: ${patient.age || 'Not provided'}
        Gender: ${patient.gender || 'Not provided'}
        Height: ${patient.height ? patient.height + ' cm' : 'Not provided'}
        Weight: ${patient.weight ? patient.weight + ' kg' : 'Not provided'}
        
        Chief Complaint / Current Issue:
        ${patient.currentIssue || 'None reported'}
        
        Medical History / Details:
        ${patient.medical_data || 'None reported'}
        `

        try {
            await analyseStream(medicalText, (chunk) => {
                setAnalysisResult(prev => prev + chunk)
            })
        } catch (err) {
            console.error('Analysis error:', err)
            setError('Failed to generate clinical analysis. The LLM service might be unavailable.')
        } finally {
            setIsAnalysing(false)
        }
    }

    const handleProceed = () => {
        navigate('/doctor/test-review', {
            state: {
                patient,
                doctorNotes: analysisResult // Pass the AI summary as doctorNotes if generated
            }
        })
    }

    return (
        <>
            <Navbar />
            <div className="main-container">
                <Sidebar role="doctor" />
                <main className="content-area animate-fade">
                    
                    {/* Header */}
                    <div className="tr-page-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <button className="tr-back-btn" onClick={() => navigate(-1)}>← Back</button>
                            <div>
                                <h1 className="tr-page-title">📋 Patient Data Summary</h1>
                                <p className="tr-page-sub">Review the collected Intake data and generate an AI Clinical Analysis before proceeding to document uploads.</p>
                            </div>
                        </div>

                        {/* Patient Badge */}
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
                                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{patient.mobile_number || patient.id}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                        
                        {/* LEFT: Patient Intake Data */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            
                            {/* Vitals & Demographics */}
                           <div className="ps-card" style={{ borderTop: '4px solid #3498DB' }}>
                                <div className="ps-card-header">
                                    <div className="ps-icon-badge" style={{ background: '#E3F2FD', color: '#1976D2' }}>👤</div>
                                    <div>
                                        <h2 className="ps-card-title">Patient Demographics</h2>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginTop: 10 }}>
                                    <div><span style={{color: '#7F8C8D', fontSize: 12}}>Age</span><div style={{fontWeight: 600}}>{patient.age || '—'} yrs</div></div>
                                    <div><span style={{color: '#7F8C8D', fontSize: 12}}>Gender</span><div style={{fontWeight: 600}}>{patient.gender || '—'}</div></div>
                                    <div><span style={{color: '#7F8C8D', fontSize: 12}}>Height</span><div style={{fontWeight: 600}}>{patient.height ? patient.height + ' cm' : '—'}</div></div>
                                    <div><span style={{color: '#7F8C8D', fontSize: 12}}>Weight</span><div style={{fontWeight: 600}}>{patient.weight ? patient.weight + ' kg' : '—'}</div></div>
                                    <div style={{ gridColumn: '1 / -1' }}><span style={{color: '#7F8C8D', fontSize: 12}}>Mobile Number</span><div style={{fontWeight: 600}}>{patient.mobile_number || '—'}</div></div>
                                </div>
                            </div>

                            {/* Clinical Info */}
                            <div className="ps-card" style={{ borderTop: '4px solid #E67E22' }}>
                                <div className="ps-card-header">
                                    <div className="ps-icon-badge" style={{ background: '#FFF3E0', color: '#E65100' }}>🏥</div>
                                    <div>
                                        <h2 className="ps-card-title">Intake Clinical Information</h2>
                                    </div>
                                </div>
                                
                                <div style={{ marginTop: 15 }}>
                                    <h3 style={{ fontSize: 13, color: '#7F8C8D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Chief Complaint</h3>
                                    <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, fontSize: 14, color: '#2C3E50', border: '1px solid #E8ECF0' }}>
                                        {patient.currentIssue || <span style={{ color: '#BDC3C7', fontStyle: 'italic' }}>No current issue reported.</span>}
                                    </div>
                                </div>

                                <div style={{ marginTop: 15 }}>
                                    <h3 style={{ fontSize: 13, color: '#7F8C8D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Medical History</h3>
                                    <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, fontSize: 14, color: '#2C3E50', border: '1px solid #E8ECF0', whiteSpace: 'pre-wrap' }}>
                                        {patient.medical_data || <span style={{ color: '#BDC3C7', fontStyle: 'italic' }}>No relevant medical history provided.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: AI Analysis */}
                        <div className="ps-card" style={{ borderTop: '4px solid #9B59B6', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div className="ps-card-header" style={{ marginBottom: 15 }}>
                                <div className="ps-icon-badge" style={{ background: '#F3E5F5', color: '#8E24AA' }}>✨</div>
                                <div>
                                    <h2 className="ps-card-title">AI Clinical Analysis</h2>
                                    <p className="ps-card-sub">Generate a structured summary of the intake data.</p>
                                </div>
                            </div>

                            {error && (
                                <div style={{ padding: '10px 14px', background: '#FFEBEE', color: '#D32F2F', borderRadius: 8, fontSize: 13, marginBottom: 15 }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <textarea
                                className="ap-textarea"
                                readOnly
                                value={analysisResult}
                                placeholder="Click the button below to generate an AI summary of the patient's symptoms and history..."
                                style={{ 
                                    flex: 1, 
                                    minHeight: 250, 
                                    marginBottom: 15, 
                                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02)',
                                    background: '#FAFAFB',
                                    whiteSpace: 'pre-wrap'
                                }}
                            />

                            <button
                                onClick={handleGenerateAnalysis}
                                disabled={isAnalysing}
                                style={{
                                    width: '100%', padding: '12px',
                                    background: isAnalysing ? '#BDC3C7' : 'linear-gradient(135deg, #9B59B6, #8E44AD)',
                                    color: '#fff', border: 'none', borderRadius: 10,
                                    fontWeight: 700, fontSize: 14, cursor: isAnalysing ? 'not-allowed' : 'pointer',
                                    boxShadow: isAnalysing ? 'none' : '0 4px 12px rgba(155,89,182,0.3)',
                                    transition: 'all 0.2s',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
                                }}
                            >
                                {isAnalysing ? (
                                    <>
                                        <div className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                        Analysing...
                                    </>
                                ) : '✨ Generate AI Analysis'}
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 30, paddingBottom: 40 }}>
                        <button
                            onClick={handleProceed}
                            className="ap-save-btn"
                            style={{ width: 'auto', padding: '14px 40px' }}
                        >
                            Proceed to Documents →
                        </button>
                    </div>

                    <style>{`
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                    `}</style>
                </main>
            </div>
        </>
    )
}
