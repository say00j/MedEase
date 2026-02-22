import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

export default function MedicineResultsPage() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const patient = state?.patient || {}
    const initials = patient.name
        ? patient.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'PT'

    const [medicines, setMedicines] = useState([
        { id: 1, name: 'Tab. Paracetamol 500mg', instruction: '1-0-1 (After Food)', completed: false },
        { id: 2, name: 'Syp. Benadryl 10ml', instruction: '0-0-1 (Bedtime)', completed: false },
    ])
    const [newMed, setNewMed] = useState('')
    const [newInst, setNewInst] = useState('')

    const addMedicine = () => {
        if (!newMed.trim()) return
        setMedicines([...medicines, {
            id: Date.now(),
            name: newMed,
            instruction: newInst || 'As directed',
            completed: false
        }])
        setNewMed('')
        setNewInst('')
    }

    const toggleMed = (id) => {
        setMedicines(medicines.map(m => m.id === id ? { ...m, completed: !m.completed } : m))
    }

    const removeMed = (id) => {
        setMedicines(medicines.filter(m => m.id !== id))
    }

    return (
        <>
            <Navbar />
            <div className="main-container">
                <Sidebar role="doctor" />
                <main className="content-area animate-fade">

                    {/* Header */}
                    <div className="tr-page-header" style={{ background: 'linear-gradient(135deg, #2E7D32, #1B5E20)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <button className="tr-back-btn" onClick={() => navigate(-1)}>← Back</button>
                            <div>
                                <h1 className="tr-page-title">💊 Medicine Recommendation</h1>
                                <p className="tr-page-sub">Review prescribed medicines and patient adherence</p>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 22, alignItems: 'start' }}>

                        {/* LEFT — Medicine Checklist */}
                        <div className="fe-card" style={{ borderTop: '4px solid #2E7D32' }}>
                            <div className="fe-card-header">
                                <span className="fe-dot" style={{ background: '#2E7D32' }} />
                                <span className="fe-card-label">Medicine Verification Checklist</span>
                            </div>

                            <div style={{ marginTop: 16 }}>
                                {medicines.map(med => (
                                    <div key={med.id} className={`tr-item ${med.completed ? 'tr-item-done' : ''}`} style={{ marginBottom: 12, padding: '14px 18px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
                                            <div
                                                className={`tr-checkbox ${med.completed ? 'tr-checkbox-checked' : ''}`}
                                                onClick={() => toggleMed(med.id)}
                                            >
                                                {med.completed && '✓'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, color: med.completed ? '#BDC3C7' : '#2C3E50', fontSize: 15 }}>
                                                    {med.name}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#7F8C8D', marginTop: 2 }}>
                                                    {med.instruction}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeMed(med.id)}
                                                style={{ background: 'none', border: 'none', color: '#E74C3C', cursor: 'pointer', fontSize: 18, opacity: 0.6 }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Med */}
                                <div style={{ marginTop: 20, padding: 16, background: '#F9FAFB', borderRadius: 12, border: '1px dashed #D1D5DB' }}>
                                    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                                        <input
                                            placeholder="Medicine Name (e.g. Tab. Dolo 650)"
                                            value={newMed}
                                            onChange={e => setNewMed(e.target.value)}
                                            style={{ flex: 2, padding: '10px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14 }}
                                        />
                                        <input
                                            placeholder="Dosage (e.g. 1-0-1)"
                                            value={newInst}
                                            onChange={e => setNewInst(e.target.value)}
                                            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14 }}
                                        />
                                    </div>
                                    <button
                                        onClick={addMedicine}
                                        style={{
                                            width: '100%', padding: '10px', background: '#2E7D32', color: '#fff',
                                            border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer',
                                            fontSize: 13
                                        }}
                                    >
                                        + Add Medicine to List
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — Notes SECTION */}
                        <div className="fe-card" style={{ borderTop: '4px solid #2E7D32' }}>
                            <div className="fe-card-header">
                                <span className="fe-dot" style={{ background: '#2E7D32' }} />
                                <span className="fe-card-label">Review Summary</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#7F8C8D', margin: '8px 0 12px' }}>
                                Document patient's adherence and response.
                            </p>
                            <textarea
                                className="ap-textarea"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                style={{ minHeight: 200 }}
                                placeholder="Patient reported consistent intake of prescribed meds. No adverse effects noted..."
                            />

                            <div style={{ marginTop: 24 }}>
                                <button
                                    onClick={() => navigate('/doctor/post-upload-review', { state: { patient } })}
                                    style={{
                                        width: '100%', padding: '14px 0',
                                        background: 'linear-gradient(135deg,#2E7D32,#1B5E20)',
                                        color: '#fff', border: 'none', borderRadius: 10,
                                        fontWeight: 700, fontSize: 15, cursor: 'pointer',
                                    }}
                                >
                                    Final Review Step →
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
