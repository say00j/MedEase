import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { uploadPatientReport } from '../../api'

const ACCEPT_TYPES = 'image/*,application/pdf,.pdf,.jpg,.jpeg,.png,.webp'

function FilePreviewCard({ file, onRemove }) {
    const isImage = file.type.startsWith('image/')
    const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf')
    const url = URL.createObjectURL(file)

    return (
        <div style={{
            background: '#fff',
            border: '1.5px solid #E8ECF0',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(44,62,80,0.07)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            transition: 'box-shadow 0.2s',
        }}
            onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(211,47,47,0.13)'}
            onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(44,62,80,0.07)'}
        >
            {/* Preview area */}
            <div style={{
                background: '#F5F7FA',
                height: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}>
                {isImage ? (
                    <img
                        src={url}
                        alt={file.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : isPDF ? (
                    <div style={{ textAlign: 'center', color: '#B71C1C' }}>
                        <div style={{ fontSize: 52 }}>📄</div>
                        <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4, color: '#D32F2F' }}>PDF Document</div>
                    </div>
                ) : (
                    <div style={{ fontSize: 48 }}>📎</div>
                )}
            </div>

            {/* File info */}
            <div style={{ padding: '10px 14px', borderTop: '1px solid #F0F2F5', flex: 1 }}>
                <div style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: '#2C3E50',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 160,
                }}>{file.name}</div>
                <div style={{ fontSize: 11, color: '#95A5A6', marginTop: 2 }}>
                    {(file.size / 1024).toFixed(1)} KB &nbsp;·&nbsp;
                    {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                </div>
            </div>

            {/* Action row */}
            <div style={{
                display: 'flex',
                gap: 8,
                padding: '8px 14px 12px',
                borderTop: '1px solid #F0F2F5',
            }}>
                {(isImage || isPDF) && (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            flex: 1,
                            background: 'linear-gradient(135deg,#FFEBEE,#FCE4EC)',
                            color: '#D32F2F',
                            border: 'none',
                            borderRadius: 8,
                            padding: '7px 0',
                            fontWeight: 700,
                            fontSize: 12,
                            textAlign: 'center',
                            textDecoration: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        👁 View
                    </a>
                )}
                <button
                    onClick={() => onRemove(file.name)}
                    style={{
                        flex: 1,
                        background: '#FFF5F5',
                        color: '#C62828',
                        border: '1.5px solid #FFCDD2',
                        borderRadius: 8,
                        padding: '7px 0',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                    }}
                >
                    ✕ Remove
                </button>
            </div>

            {/* Badge */}
            <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: isImage ? '#E8F5E9' : '#FFF3E0',
                color: isImage ? '#2E7D32' : '#E65100',
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 0.5,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}>
                {isImage ? '🖼 IMAGE' : isPDF ? '📄 PDF' : '📎 FILE'}
            </div>
        </div>
    )
}

export default function PatientSummary() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const patient = state?.patient || {}

    const [uploadedFiles, setUploadedFiles] = useState([])
    const [isDragging, setIsDragging] = useState(false)
    const [testNotes, setTestNotes] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')
    const fileInputRef = useRef(null)

    const narrative = [
        patient.name && `Patient ${patient.name}`,
        patient.age && `(${patient.age} yrs${patient.gender ? `, ${patient.gender}` : ''})`,
        patient.height && `Height: ${patient.height} cm`,
        patient.weight && `Weight: ${patient.weight} kg`,
        patient.currentIssue && `presents with — ${patient.currentIssue}`,
    ]
        .filter(Boolean)
        .join(', ')

    function addFiles(files) {
        const arr = Array.from(files)
        setUploadedFiles(prev => {
            const existingNames = new Set(prev.map(f => f.name))
            return [...prev, ...arr.filter(f => !existingNames.has(f.name))]
        })
    }

    function handleFileChange(e) {
        addFiles(e.target.files)
        e.target.value = ''
    }

    function handleDrop(e) {
        e.preventDefault()
        setIsDragging(false)
        addFiles(e.dataTransfer.files)
    }

    function removeFile(name) {
        setUploadedFiles(prev => prev.filter(f => f.name !== name))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setUploadError('')
        setIsUploading(true)
        
        try {
            // Upload all files to the backend and get their server URLs
            const uploadedData = await Promise.all(
                uploadedFiles.map(async (f) => {
                    const res = await uploadPatientReport(f)
                    return {
                        name: f.name,
                        type: f.type,
                        size: f.size,
                        url: res.url,
                    }
                })
            )

            navigate('/doctor/post-upload-review', {
                state: {
                    patient,
                    uploadedFiles: uploadedData,
                    testNotes,
                }
            })
        } catch (err) {
            setUploadError(err.message)
            setIsUploading(false)
        }
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
                            Review the patient summary and upload any relevant test data or reports.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                        {/* ── Section 1: Narrative Summary ── */}
                        <div className="ps-card">
                            <div className="ps-card-header">
                                <div className="ps-icon-badge">📋</div>
                                <div>
                                    <h2 className="ps-card-title">Narrative Summary</h2>
                                    <p className="ps-card-sub">Auto-generated from patient intake form.</p>
                                </div>
                            </div>
                            <div className="ps-narrative-box">
                                <div className="ps-chips">
                                    {patient.name && <span className="ps-chip">👤 {patient.name}</span>}
                                    {patient.age && <span className="ps-chip">🎂 {patient.age} yrs</span>}
                                    {patient.gender && <span className="ps-chip">⚧ {patient.gender}</span>}
                                    {patient.height && <span className="ps-chip">📏 {patient.height} cm</span>}
                                    {patient.weight && <span className="ps-chip">⚖️ {patient.weight} kg</span>}
                                </div>
                                {patient.currentIssue && (
                                    <div className="ps-section-block">
                                        <span className="ps-block-label">Symptoms</span>
                                        <p className="ps-block-text">{patient.currentIssue}</p>
                                    </div>
                                )}
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

                        {/* ── Section 2: Upload Test Data ── */}
                        <div className="ps-card" style={{ borderTop: '4px solid #D32F2F' }}>
                            <div className="ps-card-header">
                                <div className="ps-icon-badge" style={{ background: 'linear-gradient(135deg,#FFEBEE,#FCE4EC)', fontSize: 22 }}>🧪</div>
                                <div style={{ flex: 1 }}>
                                    <h2 className="ps-card-title">Upload Test Data</h2>
                                    <p className="ps-card-sub">Upload lab reports, scan images, or any test-related files for this patient.</p>
                                </div>
                                {uploadedFiles.length > 0 && (
                                    <span style={{
                                        background: 'linear-gradient(135deg,#D32F2F,#B71C1C)',
                                        color: '#fff',
                                        borderRadius: 20,
                                        padding: '5px 16px',
                                        fontSize: 13,
                                        fontWeight: 800,
                                    }}>
                                        {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {uploadError && <div style={{ color: '#D32F2F', fontSize: 13, marginBottom: 15, padding: '10px 14px', background: '#FFEBEE', borderRadius: 8 }}>⚠ {uploadError}</div>}

                            {/* Drag & Drop zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                style={{
                                    border: `2.5px dashed ${isDragging ? '#D32F2F' : '#E0D0D0'}`,
                                    borderRadius: 16,
                                    background: isDragging
                                        ? 'linear-gradient(135deg,rgba(211,47,47,0.06),rgba(183,28,28,0.03))'
                                        : 'linear-gradient(135deg,#FFF9F9,#FFF5F5)',
                                    padding: '40px 24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s ease',
                                    marginTop: 16,
                                    transform: isDragging ? 'scale(1.01)' : 'scale(1)',
                                    boxShadow: isDragging ? '0 8px 32px rgba(211,47,47,0.12)' : 'none',
                                }}
                            >
                                <div style={{ fontSize: 52, marginBottom: 14, lineHeight: 1 }}>
                                    {isDragging ? '📂' : '⬆️'}
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 17, color: '#C62828', marginBottom: 6 }}>
                                    {isDragging ? 'Drop files here!' : 'Click or Drag & Drop to Upload'}
                                </div>
                                <div style={{ fontSize: 13, color: '#95A5A6', marginBottom: 18 }}>
                                    Supports images (JPG, PNG, WebP) and PDF reports
                                </div>
                                <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                                    style={{
                                        background: 'linear-gradient(135deg,#D32F2F,#B71C1C)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 10,
                                        padding: '11px 28px',
                                        fontWeight: 800,
                                        fontSize: 14,
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 16px rgba(211,47,47,0.25)',
                                        transition: 'transform 0.15s',
                                    }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    📁 Browse Files
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={ACCEPT_TYPES}
                                multiple
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />

                            {/* Uploaded file grid */}
                            {uploadedFiles.length > 0 && (
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        margin: '22px 0 12px',
                                        gap: 10,
                                    }}>
                                        <div style={{
                                            height: 2,
                                            flex: 1,
                                            background: 'linear-gradient(90deg,#FFCDD2,transparent)',
                                            borderRadius: 2,
                                        }} />
                                        <span style={{ fontWeight: 800, color: '#B71C1C', fontSize: 13, letterSpacing: 0.5 }}>
                                            UPLOADED FILES ({uploadedFiles.length})
                                        </span>
                                        <div style={{
                                            height: 2,
                                            flex: 1,
                                            background: 'linear-gradient(90deg,transparent,#FFCDD2)',
                                            borderRadius: 2,
                                        }} />
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                        gap: 16,
                                    }}>
                                        {uploadedFiles.map(file => (
                                            <FilePreviewCard key={file.name} file={file} onRemove={removeFile} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Section 3: Test Notes ── */}
                        <div className="ps-card">
                            <div className="ps-card-header">
                                <div className="ps-icon-badge ps-icon-green">📝</div>
                                <div>
                                    <h2 className="ps-card-title">Test Notes <span style={{ fontSize: 12, fontWeight: 500, color: '#95A5A6' }}>(optional)</span></h2>
                                    <p className="ps-card-sub">Any additional notes or observations about the test data uploaded above.</p>
                                </div>
                            </div>
                            <textarea
                                value={testNotes}
                                onChange={e => setTestNotes(e.target.value)}
                                className="ap-textarea"
                                style={{ flex: 1, minHeight: 120, marginTop: 10 }}
                                placeholder="e.g. CBC result from 20 Feb — Haemoglobin borderline low at 10.2 g/dL. Follow-up in 2 weeks..."
                            />
                        </div>

                        {/* Action row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 13, color: '#95A5A6' }}>
                                {uploadedFiles.length === 0
                                    ? '⚠️ No files uploaded yet — you can still proceed'
                                    : `✅ ${uploadedFiles.length} file(s) ready for review`}
                            </div>
                            <button type="submit" className="ap-save-btn" disabled={isUploading} style={{ width: 'auto', padding: '13px 40px', opacity: isUploading ? 0.7 : 1 }}>
                                {isUploading ? 'Uploading files...' : 'Next →'}
                            </button>
                        </div>

                    </form>
                </main>
            </div>
        </>
    )
}
