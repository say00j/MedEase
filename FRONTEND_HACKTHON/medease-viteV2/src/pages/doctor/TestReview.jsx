import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { saveTests } from '../../api'

function parseTests(raw = '') {
    return raw
        .split(/[\n,]+/)
        .map(t => t.replace(/^\s*\d+[.)]\s*/, '').trim())
        .filter(Boolean)
}

const TEST_ICONS = ['🔬', '🩸', '🫀', '🧬', '💉', '🩺', '🧪', '📋', '🫁', '🦠']

export default function TestReview() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const { patient = {}, combinedNotes = '', medicineRec = '' } = state || {}

    const initialTests = parseTests(medicineRec).map((name, i) => ({
        id: i,
        name,
        icon: TEST_ICONS[i % TEST_ICONS.length],
        checked: true,
        reason: '',
    }))

    const [tests, setTests] = useState(initialTests)
    const [newTest, setNewTest] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState('')

    function toggle(id) {
        setTests(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t))
    }
    function setReason(id, val) {
        setTests(prev => prev.map(t => t.id === id ? { ...t, reason: val } : t))
    }
    function addTest() {
        if (!newTest.trim()) return
        setTests(prev => [...prev, {
            id: Date.now(), name: newTest.trim(),
            icon: TEST_ICONS[prev.length % TEST_ICONS.length],
            checked: true, reason: '',
        }])
        setNewTest('')
    }
    function removeTest(id) {
        setTests(prev => prev.filter(t => t.id !== id))
    }

    const approved = tests.filter(t => t.checked).length
    const skipped = tests.filter(t => !t.checked).length

    async function handleSave() {
        // Validate
        const missingReasons = tests.some(t => !t.checked && !t.reason.trim())
        if (missingReasons) {
            setSaveError('Please provide a reason for all skipped tests.')
            return
        }

        const docLicense = sessionStorage.getItem('medease_doctor_license')
        const docName = sessionStorage.getItem('medease_doctor_name')

        if (!docLicense || !docName) {
            setSaveError('Doctor session missing. Please log in again.')
            return
        }

        setIsSaving(true)
        setSaveError('')

        const payload = {
            doctor_license: docLicense,
            doctor_name: docName,
            patient_mobile: patient.mobile_number || patient.id,
            patient_name: patient.name || 'Unknown',
            tests: tests.map(t => ({
                name: t.name,
                required: t.checked,
                reason: t.checked ? '' : t.reason
            }))
        }

        try {
            await saveTests(payload)
            navigate('/doctor/patients', { replace: true })
        } catch (err) {
            setSaveError(err.message)
            setIsSaving(false)
        }
    }
    const initials = patient.name
        ? patient.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'PT'

    return (
        <>
            <Navbar />
            <div className="main-container">
                <Sidebar role="doctor" />
                <main className="content-area animate-fade" style={{ paddingBottom: 40 }}>

                    {/* ── Gradient Page Header ── */}
                    <div className="tr-page-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <button
                                onClick={() => navigate(-1)}
                                className="tr-back-btn"
                            >← Back</button>
                            <div>
                                <h1 className="tr-page-title">🔬 Test Review</h1>
                                <p className="tr-page-sub">
                                    Confirm which tests are required. Uncheck and explain if not needed.
                                </p>
                            </div>
                        </div>
                        <div className="tr-header-stats">
                            <div className="tr-stat-pill tr-stat-green">
                                <span>✓</span> {approved} Approved
                            </div>
                            <div className="tr-stat-pill tr-stat-red">
                                <span>✕</span> {skipped} Skipped
                            </div>
                            <div className="tr-stat-pill tr-stat-grey">
                                <span>Σ</span> {tests.length} Total
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, alignItems: 'start' }}>

                        {/* ── LEFT — Test checklist ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                            {tests.length === 0 && (
                                <div className="tr-empty-state">
                                    <span style={{ fontSize: 48 }}>🔬</span>
                                    <p style={{ fontWeight: 600 }}>No tests added yet</p>
                                    <p style={{ fontSize: 13 }}>Use the field below to add recommended tests</p>
                                </div>
                            )}

                            {tests.map((t, idx) => (
                                <div key={t.id} className={`tr-item${t.checked ? '' : ' tr-item-unchecked'}`}>
                                    <div className="tr-item-top">
                                        {/* Checkbox + icon + name */}
                                        <label className="tr-checkbox-label">
                                            <div className="tr-custom-check">
                                                <input
                                                    type="checkbox"
                                                    checked={t.checked}
                                                    onChange={() => toggle(t.id)}
                                                    className="tr-checkbox"
                                                />
                                                <div className={`tr-check-box ${t.checked ? 'tr-check-on' : 'tr-check-off'}`}>
                                                    {t.checked ? '✓' : '✕'}
                                                </div>
                                            </div>
                                            <div className="tr-test-icon">{t.icon}</div>
                                            <div>
                                                <div className={`tr-test-name${t.checked ? '' : ' tr-muted'}`}>
                                                    {t.name}
                                                </div>
                                                <div className="tr-test-num">Test #{idx + 1}</div>
                                            </div>
                                        </label>

                                        {/* Status badge */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span className={`tr-badge ${t.checked ? 'tr-badge-green' : 'tr-badge-red'}`}>
                                                {t.checked ? '✓ Required' : '✕ Skipped'}
                                            </span>
                                            <button
                                                onClick={() => removeTest(t.id)}
                                                className="tr-remove-btn"
                                                title="Remove"
                                            >✕</button>
                                        </div>
                                    </div>

                                    {/* Reason — animated reveal */}
                                    {!t.checked && (
                                        <div className="tr-reason-wrap">
                                            <div className="tr-reason-header">
                                                <span>⚠️</span>
                                                <span>Why is this test not mandatory?</span>
                                            </div>
                                            <textarea
                                                value={t.reason}
                                                onChange={e => setReason(t.id, e.target.value)}
                                                className="ap-textarea tr-reason-textarea"
                                                placeholder="e.g. Patient already had this test last month with normal results…"
                                            />
                                            {!t.reason && (
                                                <span className="tr-warn-text">⚡ Reason is required before finalising</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Add new test */}
                            <div className="tr-add-row">
                                <div className="tr-add-icon">➕</div>
                                <input
                                    type="text"
                                    value={newTest}
                                    onChange={e => setNewTest(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addTest()}
                                    className="tr-add-input"
                                    placeholder="Add a test — press Enter or click Add…"
                                />
                                <button onClick={addTest} className="tr-add-btn">Add</button>
                            </div>
                        </div>

                        {/* ── RIGHT — Sticky patient card ── */}
                        <div className="tr-right-card">
                            {/* Patient identity */}
                            <div className="tr-patient-banner">
                                <div className="tr-patient-avatar">{initials}</div>
                                <div>
                                    <div className="tr-patient-name">
                                        {patient.name || 'Unknown Patient'}
                                    </div>
                                    <div className="tr-patient-meta">
                                        {[
                                            patient.age && `${patient.age} yrs`,
                                            patient.gender,
                                            patient.height && `${patient.height} cm`,
                                            patient.weight && `${patient.weight} kg`,
                                        ].filter(Boolean).join(' · ')}
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="tr-divider" />

                            {patient.currentIssue && (
                                <div className="tr-info-block">
                                    <div className="tr-info-label">🤒 Symptoms</div>
                                    <div className="tr-info-text">{patient.currentIssue}</div>
                                </div>
                            )}
                            {combinedNotes && (
                                <div className="tr-info-block">
                                    <div className="tr-info-label">📋 Assessment & Plan</div>
                                    <div className="tr-info-text">{combinedNotes}</div>
                                </div>
                            )}

                            {/* Live stats bar */}
                            <div className="tr-stats-bar">
                                <div className="tr-stat-row">
                                    <span className="tr-stat-label">Approved</span>
                                    <div className="tr-stat-track">
                                        <div
                                            className="tr-stat-fill tr-fill-green"
                                            style={{ width: tests.length ? `${(approved / tests.length) * 100}%` : '0%' }}
                                        />
                                    </div>
                                    <span className="tr-stat-count">{approved}</span>
                                </div>
                                <div className="tr-stat-row">
                                    <span className="tr-stat-label">Skipped</span>
                                    <div className="tr-stat-track">
                                        <div
                                            className="tr-stat-fill tr-fill-red"
                                            style={{ width: tests.length ? `${(skipped / tests.length) * 100}%` : '0%' }}
                                        />
                                    </div>
                                    <span className="tr-stat-count">{skipped}</span>
                                </div>
                            </div>

                            {saveError && (
                                <div style={{ color: '#D32F2F', background: '#FFEBEE', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginTop: 15 }}>
                                    ⚠️ {saveError}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button
                                    onClick={() => window.print()}
                                    disabled={isSaving}
                                    style={{
                                        flex: 1, background: '#F5F7FA', border: '1.5px solid #E0E4E8',
                                        borderRadius: 10, padding: '12px 0', fontWeight: 700,
                                        fontSize: 14, cursor: isSaving ? 'not-allowed' : 'pointer', color: '#2C3E50',
                                        transition: 'background 0.2s', opacity: isSaving ? 0.7 : 1
                                    }}
                                    onMouseOver={e => !isSaving && (e.currentTarget.style.background = '#ECEFF1')}
                                    onMouseOut={e => !isSaving && (e.currentTarget.style.background = '#F5F7FA')}
                                >
                                    🖨️ Print
                                </button>
                                <button
                                    className="ap-save-btn"
                                    disabled={isSaving}
                                    style={{ flex: 1, marginTop: 0, opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
                                    onClick={handleSave}
                                >
                                    {isSaving ? 'Saving...' : 'Next →'}
                                </button>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </>
    )
}
