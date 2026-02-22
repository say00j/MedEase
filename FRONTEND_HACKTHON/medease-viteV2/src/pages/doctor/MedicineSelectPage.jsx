import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

// ── Mock LLM-generated medicine recommendations ────────────────────────────
// In production, this would come from an API call using the uploaded test data
const LLM_MEDICINES = [
    {
        id: 1,
        name: 'Tab. Paracetamol 500mg',
        dosage: '1-0-1',
        duration: '5 days',
        reason: 'For fever and pain relief based on reported symptoms.',
        category: 'Analgesic / Antipyretic',
        icon: '💊',
        confidence: 97,
    },
    {
        id: 2,
        name: 'Tab. Azithromycin 500mg',
        dosage: '1-0-0',
        duration: '3 days',
        reason: 'Broad-spectrum antibiotic indicated for suspected bacterial infection.',
        category: 'Antibiotic',
        icon: '🧬',
        confidence: 89,
    },
    {
        id: 3,
        name: 'Tab. Ferrous Sulphate 200mg',
        dosage: '0-1-0',
        duration: '4 weeks',
        reason: 'Haemoglobin borderline low (10.2 g/dL) — iron supplementation recommended.',
        category: 'Iron Supplement',
        icon: '🩸',
        confidence: 95,
    },
    {
        id: 4,
        name: 'Tab. Vitamin C 500mg',
        dosage: '1-0-0',
        duration: '4 weeks',
        reason: 'Enhances iron absorption when taken alongside ferrous sulphate.',
        category: 'Vitamin Supplement',
        icon: '🍊',
        confidence: 91,
    },
    {
        id: 5,
        name: 'Syp. Liv 52 10ml',
        dosage: '1-0-1 (BD)',
        duration: '2 weeks',
        reason: 'Hepato-protective support — slightly elevated liver enzymes noted in report.',
        category: 'Hepato-protective',
        icon: '🌿',
        confidence: 78,
    },
    {
        id: 6,
        name: 'Tab. Cetirizine 10mg',
        dosage: '0-0-1',
        duration: '7 days',
        reason: 'Antihistamine for allergic response reported by patient.',
        category: 'Antihistamine',
        icon: '🌾',
        confidence: 82,
    },
]

function ConfidenceBadge({ value }) {
    const color = value >= 90 ? '#2E7D32' : value >= 75 ? '#E65100' : '#C62828'
    const bg = value >= 90 ? '#E8F5E9' : value >= 75 ? '#FFF3E0' : '#FFEBEE'
    return (
        <span style={{
            background: bg,
            color,
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.4,
            whiteSpace: 'nowrap',
        }}>
            🤖 {value}% match
        </span>
    )
}

export default function MedicineSelectPage() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const { patient = {}, evaluation = '', uploadedFiles = [] } = state || {}

    const [medicines, setMedicines] = useState(
        LLM_MEDICINES.map(m => ({ ...m, selected: true }))
    )
    const [doctorComment, setDoctorComment] = useState('')
    const [newMed, setNewMed] = useState('')
    const [newDosage, setNewDosage] = useState('')

    const initials = patient.name
        ? patient.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'PT'

    const selected = medicines.filter(m => m.selected)
    const skipped = medicines.filter(m => !m.selected)

    function toggleMed(id) {
        setMedicines(prev => prev.map(m => m.id === id ? { ...m, selected: !m.selected } : m))
    }

    function addCustomMed() {
        if (!newMed.trim()) return
        setMedicines(prev => [...prev, {
            id: Date.now(),
            name: newMed.trim(),
            dosage: newDosage.trim() || 'As directed',
            duration: '—',
            reason: 'Manually added by doctor.',
            category: 'Custom',
            icon: '💉',
            confidence: null,
            selected: true,
        }])
        setNewMed('')
        setNewDosage('')
    }

    function handleFinish() {
        navigate('/doctor/patients', {
            state: {
                patient,
                selectedMedicines: selected,
                skippedMedicines: skipped,
                doctorComment,
                evaluation,
                uploadedFiles,
            }
        })
    }

    function handlePrint() {
        const date = new Date().toLocaleDateString('en-IN', {
            day: '2-digit', month: 'long', year: 'numeric'
        })
        const time = new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit'
        })

        const medRows = medicines.map((m, i) => `
            <tr style="border-bottom:1px solid #EEE; background:${m.selected ? '#fff' : '#FFF5F5'}">
                <td style="padding:10px 12px; font-weight:700; color:${m.selected ? '#2C3E50' : '#9E9E9E'}; text-decoration:${m.selected ? 'none' : 'line-through'}">${i + 1}. ${m.name}</td>
                <td style="padding:10px 12px; color:#555; font-size:13px">${m.dosage}</td>
                <td style="padding:10px 12px; color:#555; font-size:13px">${m.duration}</td>
                <td style="padding:10px 12px; font-size:12px; color:#666">${m.category}</td>
                <td style="padding:10px 12px">
                    <span style="background:${m.selected ? '#E8F5E9' : '#FFEBEE'}; color:${m.selected ? '#2E7D32' : '#C62828'}; border-radius:20px; padding:3px 10px; font-size:11px; font-weight:800">
                        ${m.selected ? '✓ Prescribed' : '✕ Skipped'}
                    </span>
                </td>
                <td style="padding:10px 12px; font-size:12px; color:#6A1B9A">${m.reason}</td>
            </tr>
        `).join('')

        const patientInfo = [
            patient.name && `<strong>Name:</strong> ${patient.name}`,
            patient.age && `<strong>Age:</strong> ${patient.age} yrs`,
            patient.gender && `<strong>Gender:</strong> ${patient.gender}`,
            patient.height && `<strong>Height:</strong> ${patient.height} cm`,
            patient.weight && `<strong>Weight:</strong> ${patient.weight} kg`,
        ].filter(Boolean).join('&nbsp;&nbsp;|&nbsp;&nbsp;')

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Prescription — ${patient.name || 'Patient'}</title>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI', Arial, sans-serif; }
        body { background:#fff; color:#2C3E50; padding:32px 40px; font-size:14px; }
        .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #7B1FA2; padding-bottom:16px; margin-bottom:20px; }
        .logo { font-size:28px; font-weight:900; color:#7B1FA2; letter-spacing:-1px; }
        .logo span { color:#2C3E50; }
        .meta { text-align:right; font-size:12px; color:#777; line-height:1.8; }
        .section-title { font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; color:#7B1FA2; margin:20px 0 8px; border-left:4px solid #7B1FA2; padding-left:10px; }
        .patient-box { background:#F3E5F5; border-radius:10px; padding:14px 18px; font-size:13px; line-height:2; margin-bottom:4px; }
        .symptom-box { background:#F9F5FF; border-left:3px solid #AB47BC; padding:10px 14px; border-radius:0 8px 8px 0; font-size:13px; color:#4A148C; margin-bottom:4px; }
        table { width:100%; border-collapse:collapse; margin-top:8px; }
        th { background:#6A1B9A; color:#fff; padding:10px 12px; text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; }
        .comment-box { background:#F8F4FF; border:1px solid #D1C4E9; border-radius:10px; padding:14px 18px; font-size:13px; line-height:1.8; color:#2C3E50; white-space:pre-wrap; min-height:60px; }
        .footer { margin-top:32px; border-top:1px solid #E0E0E0; padding-top:14px; display:flex; justify-content:space-between; font-size:12px; color:#999; }
        .stats-row { display:flex; gap:20px; margin-bottom:4px; }
        .stat-chip { background:#EDE7F6; color:#6A1B9A; border-radius:20px; padding:4px 14px; font-size:12px; font-weight:800; }
        .stat-chip.green { background:#E8F5E9; color:#2E7D32; }
        .stat-chip.red { background:#FFEBEE; color:#C62828; }
        @media print { body { padding:16px 24px; } }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="logo">Med<span>Ease</span></div>
            <div style="font-size:12px; color:#888; margin-top:4px">AI-Assisted Prescription Report</div>
        </div>
        <div class="meta">
            <div>Date: ${date}</div>
            <div>Time: ${time}</div>
            <div>Printed by Doctor</div>
        </div>
    </div>

    <div class="section-title">Patient Information</div>
    <div class="patient-box">${patientInfo || 'No patient data available.'}</div>

    ${patient.currentIssue ? `
    <div class="section-title">Presenting Symptoms</div>
    <div class="symptom-box">${patient.currentIssue}</div>` : ''}

    ${evaluation ? `
    <div class="section-title">Evaluation Notes</div>
    <div class="symptom-box" style="color:#2C3E50">${evaluation}</div>` : ''}

    <div class="section-title">Medicine Prescription</div>
    <div class="stats-row">
        <span class="stat-chip">Total: ${medicines.length}</span>
        <span class="stat-chip green">Prescribed: ${selected.length}</span>
        <span class="stat-chip red">Skipped: ${skipped.length}</span>
    </div>
    <table>
        <thead>
            <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Duration</th>
                <th>Category</th>
                <th>Status</th>
                <th>AI Reason</th>
            </tr>
        </thead>
        <tbody>${medRows}</tbody>
    </table>

    <div class="section-title">Doctor's Comments</div>
    <div class="comment-box">${doctorComment || '<em style="color:#999">No comments added.</em>'}</div>

    <div class="footer">
        <div>MedEase — AI-Assisted Healthcare Platform</div>
        <div>Generated: ${date} at ${time}</div>
    </div>
</body>
</html>`

        const win = window.open('', '_blank', 'width=1000,height=700')
        win.document.write(html)
        win.document.close()
        win.focus()
        setTimeout(() => win.print(), 500)
    }

    return (
        <>
            <Navbar />
            <div className="main-container">
                <Sidebar role="doctor" />
                <main className="content-area animate-fade" style={{ paddingBottom: 40 }}>

                    {/* ── Gradient Header ── */}
                    <div className="tr-page-header" style={{
                        background: 'linear-gradient(135deg, #6A1B9A 0%, #4A148C 100%)',
                        boxShadow: '0 8px 32px rgba(106,27,154,0.28)',
                        marginBottom: 26,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <button className="tr-back-btn" onClick={() => navigate(-1)}>← Back</button>
                            <div>
                                <h1 className="tr-page-title">💊 Medicine Recommendations</h1>
                                <p className="tr-page-sub">
                                    AI-suggested medicines based on uploaded test data. Select what to prescribe.
                                </p>
                            </div>
                        </div>

                        {/* Stats + patient chip */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div className="tr-header-stats">
                                <div className="tr-stat-pill tr-stat-green">
                                    ✓ {selected.length} Selected
                                </div>
                                <div className="tr-stat-pill tr-stat-red">
                                    ✕ {skipped.length} Skipped
                                </div>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.18)', borderRadius: 12,
                                padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.3)', color: '#fff',
                                    fontWeight: 800, fontSize: 13, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>{initials}</div>
                                <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
                                    {patient.name || 'Unknown Patient'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Main Two-column Layout ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

                        {/* ── LEFT — Medicine Checklist ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                            {/* LLM badge */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                background: 'linear-gradient(135deg,#F3E5F5,#EDE7F6)',
                                border: '1.5px solid #CE93D8',
                                borderRadius: 12,
                                padding: '12px 18px',
                            }}>
                                <span style={{ fontSize: 22 }}>🤖</span>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 14, color: '#4A148C' }}>
                                        AI-Generated Recommendations
                                    </div>
                                    <div style={{ fontSize: 12, color: '#7B1FA2' }}>
                                        Based on the uploaded lab reports and patient history. Review each suggestion carefully.
                                    </div>
                                </div>
                            </div>

                            {/* Medicine cards */}
                            {medicines.map((med, idx) => (
                                <div
                                    key={med.id}
                                    onClick={() => toggleMed(med.id)}
                                    style={{
                                        background: med.selected ? '#fff' : 'linear-gradient(135deg,#FAFAFA,#F5F5F5)',
                                        border: med.selected
                                            ? '2px solid #AB47BC'
                                            : '1.5px solid #E0E0E0',
                                        borderRadius: 16,
                                        padding: '18px 20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 16,
                                        transition: 'all 0.2s ease',
                                        boxShadow: med.selected
                                            ? '0 4px 20px rgba(171,71,188,0.15)'
                                            : '0 2px 8px rgba(0,0,0,0.04)',
                                        opacity: med.selected ? 1 : 0.65,
                                        transform: med.selected ? 'translateY(0)' : 'translateY(1px)',
                                    }}
                                >
                                    {/* Custom checkbox */}
                                    <div style={{
                                        width: 26,
                                        height: 26,
                                        borderRadius: 8,
                                        border: med.selected ? '2px solid #7B1FA2' : '2px solid #BDBDBD',
                                        background: med.selected
                                            ? 'linear-gradient(135deg,#9C27B0,#6A1B9A)'
                                            : '#F5F5F5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 13,
                                        fontWeight: 800,
                                        color: '#fff',
                                        flexShrink: 0,
                                        marginTop: 2,
                                        transition: 'all 0.18s ease',
                                    }}>
                                        {med.selected ? '✓' : ''}
                                    </div>

                                    {/* Medicine icon */}
                                    <div style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        background: med.selected
                                            ? 'linear-gradient(135deg,#F3E5F5,#EDE7F6)'
                                            : '#F5F5F5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 22,
                                        flexShrink: 0,
                                        transition: 'background 0.2s',
                                    }}>
                                        {med.icon}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                                            <span style={{
                                                fontWeight: 800,
                                                fontSize: 15,
                                                color: med.selected ? '#2C3E50' : '#9E9E9E',
                                                textDecoration: med.selected ? 'none' : 'line-through',
                                                transition: 'color 0.2s',
                                            }}>
                                                {med.name}
                                            </span>
                                            {med.confidence !== null && <ConfidenceBadge value={med.confidence} />}
                                            <span style={{
                                                background: '#EDE7F6',
                                                color: '#6A1B9A',
                                                borderRadius: 20,
                                                padding: '2px 10px',
                                                fontSize: 10,
                                                fontWeight: 700,
                                                letterSpacing: 0.3,
                                            }}>
                                                {med.category}
                                            </span>
                                        </div>

                                        {/* Dosage row */}
                                        <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                ⏱ <strong>{med.dosage}</strong>
                                            </span>
                                            <span style={{ fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                📅 <strong>{med.duration}</strong>
                                            </span>
                                        </div>

                                        {/* Reason */}
                                        <div style={{
                                            background: med.selected ? '#F8F4FF' : '#FAFAFA',
                                            borderLeft: `3px solid ${med.selected ? '#AB47BC' : '#E0E0E0'}`,
                                            borderRadius: '0 8px 8px 0',
                                            padding: '8px 12px',
                                            fontSize: 12,
                                            color: med.selected ? '#4A148C' : '#9E9E9E',
                                            lineHeight: 1.6,
                                            transition: 'all 0.2s',
                                        }}>
                                            🤖 {med.reason}
                                        </div>
                                    </div>

                                    {/* Status badge */}
                                    <div style={{
                                        background: med.selected ? '#E8F5E9' : '#FFEBEE',
                                        color: med.selected ? '#2E7D32' : '#C62828',
                                        borderRadius: 20,
                                        padding: '4px 12px',
                                        fontSize: 11,
                                        fontWeight: 800,
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        alignSelf: 'center',
                                        transition: 'all 0.2s',
                                    }}>
                                        {med.selected ? '✓ Prescribe' : '✕ Skip'}
                                    </div>
                                </div>
                            ))}

                            {/* ── Add custom medicine ── */}
                            <div style={{
                                background: '#FAFAFA',
                                border: '2px dashed #CE93D8',
                                borderRadius: 16,
                                padding: '18px 20px',
                            }}>
                                <div style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: '#6A1B9A',
                                    marginBottom: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}>
                                    ➕ Add Medicine Manually
                                </div>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    <input
                                        placeholder="Medicine name (e.g. Tab. Dolo 650)"
                                        value={newMed}
                                        onChange={e => setNewMed(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addCustomMed()}
                                        className="ap-input"
                                        style={{ flex: 2, minWidth: 180 }}
                                    />
                                    <input
                                        placeholder="Dosage (e.g. 1-0-1)"
                                        value={newDosage}
                                        onChange={e => setNewDosage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addCustomMed()}
                                        className="ap-input"
                                        style={{ flex: 1, minWidth: 120 }}
                                    />
                                    <button
                                        onClick={addCustomMed}
                                        style={{
                                            background: 'linear-gradient(135deg,#9C27B0,#6A1B9A)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 10,
                                            padding: '10px 20px',
                                            fontWeight: 800,
                                            fontSize: 13,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT — Sticky sidebar ── */}
                        <div style={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>

                            {/* Doctor comment card */}
                            <div style={{
                                background: '#fff',
                                borderRadius: 18,
                                boxShadow: '0 6px 30px rgba(0,0,0,0.07)',
                                padding: '22px 20px',
                                borderTop: '4px solid #7B1FA2',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 10,
                                        background: 'linear-gradient(135deg,#F3E5F5,#EDE7F6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 18,
                                    }}>📝</div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 15, color: '#2C3E50' }}>
                                            Doctor's Comments
                                        </div>
                                        <div style={{ fontSize: 12, color: '#95A5A6' }}>
                                            Clinical notes for this prescription
                                        </div>
                                    </div>
                                </div>
                                <textarea
                                    value={doctorComment}
                                    onChange={e => setDoctorComment(e.target.value)}
                                    className="ap-textarea"
                                    style={{
                                        minHeight: 220,
                                        marginTop: 14,
                                        borderColor: doctorComment ? '#AB47BC' : '#E0E4E8',
                                    }}
                                    placeholder="e.g. Patient has mild anaemia. Iron therapy initiated. Follow up in 2 weeks after repeat CBC. Advised high-iron diet. No adverse drug reactions expected..."
                                />
                                {!doctorComment && (
                                    <div style={{
                                        fontSize: 11,
                                        color: '#E65100',
                                        marginTop: 6,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                    }}>
                                        ⚡ Adding a comment is recommended before finalising
                                    </div>
                                )}
                            </div>

                            {/* Summary card */}
                            <div style={{
                                background: 'linear-gradient(135deg,#F3E5F5,#EDE7F6)',
                                borderRadius: 16,
                                padding: '18px 20px',
                                border: '1.5px solid #CE93D8',
                            }}>
                                <div style={{ fontWeight: 800, fontSize: 13, color: '#4A148C', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    📊 Prescription Summary
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {[
                                        { label: 'Total Suggested', value: medicines.length, color: '#6A1B9A', bg: '#EDE7F6' },
                                        { label: 'Selected to Prescribe', value: selected.length, color: '#2E7D32', bg: '#E8F5E9' },
                                        { label: 'Skipped', value: skipped.length, color: '#C62828', bg: '#FFEBEE' },
                                    ].map(row => (
                                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 12, color: '#555' }}>{row.label}</span>
                                            <span style={{
                                                background: row.bg,
                                                color: row.color,
                                                borderRadius: 20,
                                                padding: '3px 12px',
                                                fontSize: 12,
                                                fontWeight: 800,
                                            }}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress bar */}
                                <div style={{ marginTop: 14 }}>
                                    <div style={{ fontSize: 11, color: '#6A1B9A', fontWeight: 700, marginBottom: 5 }}>
                                        Selection Rate
                                    </div>
                                    <div style={{ background: '#D1C4E9', borderRadius: 8, height: 8, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: medicines.length ? `${(selected.length / medicines.length) * 100}%` : '0%',
                                            background: 'linear-gradient(90deg,#9C27B0,#6A1B9A)',
                                            borderRadius: 8,
                                            transition: 'width 0.35s ease',
                                        }} />
                                    </div>
                                    <div style={{ fontSize: 11, color: '#7B1FA2', marginTop: 4, textAlign: 'right' }}>
                                        {medicines.length ? Math.round((selected.length / medicines.length) * 100) : 0}%
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons row */}
                            <div style={{ display: 'flex', gap: 10 }}>

                                {/* Print button */}
                                <button
                                    onClick={handlePrint}
                                    style={{
                                        flex: 1,
                                        padding: '14px 0',
                                        background: '#fff',
                                        color: '#7B1FA2',
                                        border: '2px solid #AB47BC',
                                        borderRadius: 10,
                                        fontWeight: 800,
                                        fontSize: 14,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 8px rgba(123,31,162,0.1)',
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.background = '#F3E5F5'
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(123,31,162,0.18)'
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.background = '#fff'
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(123,31,162,0.1)'
                                    }}
                                >
                                    🖨️ Print
                                </button>

                                {/* Finalise button */}
                                <button
                                    onClick={handleFinish}
                                    className="ap-save-btn"
                                    style={{
                                        flex: 1,
                                        marginTop: 0,
                                        background: 'linear-gradient(135deg,#7B1FA2,#4A148C)',
                                        boxShadow: '0 6px 20px rgba(123,31,162,0.3)',
                                        fontSize: 14,
                                        padding: '14px 0',
                                    }}
                                >
                                    ✔ Finalise &amp; Done
                                </button>
                            </div>

                            {selected.length === 0 && (
                                <div style={{
                                    background: '#FFEBEE',
                                    border: '1px solid #FFCDD2',
                                    borderRadius: 10,
                                    padding: '10px 14px',
                                    fontSize: 12,
                                    color: '#C62828',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                }}>
                                    ⚠️ No medicines selected — please select at least one to prescribe.
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
