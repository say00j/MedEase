import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

export default function TestResultsPage() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const patient = state?.patient || {}
    const initials = patient.name
        ? patient.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'PT'

    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [done, setDone] = useState(false)
    const [notes, setNotes] = useState('')
    const fileRef = useRef()

    async function handleUpload() {
        if (!file) return
        setUploading(true)
        await new Promise(r => setTimeout(r, 1400))
        setUploading(false)
        setDone(true)
    }

    return (
        <>
            <Navbar />
            <div className="main-container">
                <Sidebar role="doctor" />
                <main className="content-area animate-fade">

                    {/* Header */}
                    <div className="tr-page-header" style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <button className="tr-back-btn" onClick={() => navigate(-1)}>← Back</button>
                            <div>
                                <h1 className="tr-page-title">🔬 Test Review</h1>
                                <p className="tr-page-sub">Upload test results and add clinical observations</p>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: 22, alignItems: 'start' }}>

                        {/* LEFT — Upload SECTION (ONLY TEST) */}
                        <div className="fe-card" style={{ borderTop: '4px solid #1565C0' }}>
                            <div className="fe-card-header">
                                <span className="fe-dot" style={{ background: '#1565C0' }} />
                                <span className="fe-card-label">Test Report Upload</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#90A4AE', margin: '8px 0 12px' }}>
                                Upload lab results or scan reports for this specific test review step.
                            </p>

                            {!done ? (
                                <>
                                    <div
                                        className={`pl-dropzone${file ? ' pl-dropzone-active' : ''}`}
                                        style={{ borderColor: file ? '#1565C0' : undefined, marginTop: 12 }}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]) }}
                                        onClick={() => fileRef.current.click()}
                                    >
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            style={{ display: 'none' }}
                                            onChange={e => setFile(e.target.files[0])}
                                        />
                                        {file ? (
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: 36 }}>📄</div>
                                                <div className="pl-file-name">{file.name}</div>
                                                <div className="pl-file-size">{(file.size / 1024).toFixed(1)} KB</div>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: 42, marginBottom: 10 }}>☁️</div>
                                                <div className="pl-drop-primary">
                                                    Drag & drop or <span style={{ color: '#1565C0', fontWeight: 700 }}>browse</span>
                                                </div>
                                                <div className="pl-drop-sub">PDF, JPG or PNG of the lab / scan report</div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleUpload}
                                        disabled={!file || uploading}
                                        style={{
                                            marginTop: 14, width: '100%', padding: '13px 0',
                                            background: file ? 'linear-gradient(135deg,#1565C0,#0D47A1)' : '#CFD8DC',
                                            color: '#fff', border: 'none', borderRadius: 10,
                                            fontWeight: 700, fontSize: 14,
                                            cursor: file ? 'pointer' : 'not-allowed', transition: 'opacity 0.2s',
                                        }}
                                    >
                                        {uploading ? '⏳ Uploading…' : '⬆ Upload Test Report'}
                                    </button>
                                </>
                            ) : (
                                <div className="pl-success" style={{ padding: '20px 0 8px' }}>
                                    <div className="pl-success-icon" style={{ background: '#E3F2FD', color: '#1565C0' }}>✓</div>
                                    <div className="pl-success-title">Uploaded!</div>
                                    <div className="pl-success-sub"><b>{file?.name}</b> saved.</div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT — Notes SECTION */}
                        <div className="fe-card" style={{ borderTop: '4px solid #1565C0' }}>
                            <div className="fe-card-header">
                                <span className="fe-dot" style={{ background: '#1565C0' }} />
                                <span className="fe-card-label">Doctor's Observation & Assessment</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#7F8C8D', margin: '8px 0 12px' }}>
                                Record your findings and interpretation of the relevant tests.
                            </p>
                            <textarea
                                className="ap-textarea"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                style={{ minHeight: 250 }}
                                placeholder="e.g. CBC confirms low ferritin levels. Urinalysis shows trace protein..."
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                                <button
                                    onClick={() => navigate('/doctor/medicine-results', { state: { patient } })}
                                    style={{
                                        padding: '13px 40px',
                                        background: 'linear-gradient(135deg,#1565C0,#0D47A1)',
                                        color: '#fff', border: 'none', borderRadius: 10,
                                        fontWeight: 700, fontSize: 15, cursor: 'pointer',
                                    }}
                                >
                                    Next Step (Medicine Recommendation) →
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
