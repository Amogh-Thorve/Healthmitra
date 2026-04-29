import { useEffect, useMemo, useRef, useState } from 'react'
import {
    AlertTriangle,
    Bell,
    CalendarDays,
    Camera,
    Cloud,
    CloudOff,
    FileText,
    MapPin,
    Phone,
    Plus,
    QrCode,
    Search,
    ShieldAlert,
    TrendingDown,
    TrendingUp,
    Upload,
    UserPlus,
    Users
} from 'lucide-react'

const initialPatients = [
    {
        id: 1, name: 'Ramesh Kumar', age: 45, gender: 'Male', blood_group: 'B+', village: 'Chandpur', phone: '9876543210',
        report_count: 3, risk: 78, riskHistory: [52, 58, 63, 70, 78], lastVisit: '2026-04-26', scheduledVisit: '2026-05-02',
        householdId: 'HH-CH-101', pendingReports: 1, followupStatus: 'overdue', flags: ['pneumonia']
    },
    {
        id: 2, name: 'Sunita Devi', age: 38, gender: 'Female', blood_group: 'O+', village: 'Chandpur', phone: '9988776655',
        report_count: 2, risk: 35, riskHistory: [42, 39, 37, 33, 35], lastVisit: '2026-04-22', scheduledVisit: '2026-05-03',
        householdId: 'HH-CH-101', pendingReports: 0, followupStatus: 'scheduled', flags: []
    },
    {
        id: 3, name: 'Mohan Lal', age: 62, gender: 'Male', blood_group: 'A+', village: 'Ramgarh', phone: '9123456701',
        report_count: 5, risk: 65, riskHistory: [54, 57, 60, 63, 65], lastVisit: '2026-04-18', scheduledVisit: '2026-04-25',
        householdId: 'HH-RG-122', pendingReports: 2, followupStatus: 'overdue', flags: ['fracture']
    },
    {
        id: 4, name: 'Geeta Bai', age: 55, gender: 'Female', blood_group: 'B-', village: 'Ramgarh', phone: '9765432111',
        report_count: 1, risk: 42, riskHistory: [44, 43, 41, 40, 42], lastVisit: '2026-04-27', scheduledVisit: '2026-05-01',
        householdId: 'HH-RG-122', pendingReports: 0, followupStatus: 'scheduled', flags: []
    },
    {
        id: 5, name: 'Raju Singh', age: 28, gender: 'Male', blood_group: 'AB+', village: 'Devpur', phone: '9345678910',
        report_count: 1, risk: 15, riskHistory: [26, 22, 20, 17, 15], lastVisit: '2026-04-24', scheduledVisit: '2026-05-05',
        householdId: 'HH-DP-144', pendingReports: 0, followupStatus: 'scheduled', flags: []
    },
]

const villageOptions = ['All Villages', 'Chandpur', 'Ramgarh', 'Devpur']

const riskBand = (risk) => risk >= 60 ? 'high' : risk >= 30 ? 'medium' : 'low'
const riskColor = (risk) => risk >= 60 ? '#ef4444' : risk >= 30 ? '#f59e0b' : '#10b981'
const riskBorder = (risk) => `${riskColor(risk)}99`

const sparklinePoints = (values) => {
    if (!values || values.length === 0) return ''
    const min = Math.min(...values)
    const max = Math.max(...values)
    return values.map((v, i) => {
        const x = (i / (values.length - 1 || 1)) * 100
        const y = max === min ? 50 : ((max - v) / (max - min)) * 100
        return `${x},${y}`
    }).join(' ')
}

export default function RuralMode() {
    const [patients, setPatients] = useState(initialPatients)
    const [search, setSearch] = useState('')
    const [showAdd, setShowAdd] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [villageFilter, setVillageFilter] = useState('All Villages')
    const [mapVillage, setMapVillage] = useState(null)
    const [riskFilter, setRiskFilter] = useState('all')
    const [showAlerts, setShowAlerts] = useState(false)
    const [campMode, setCampMode] = useState(false)
    const [campMeta, setCampMeta] = useState({ location: 'Chandpur PHC', date: '2026-04-28' })
    const [toasts, setToasts] = useState([])
    const [syncPending, setSyncPending] = useState(0)
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : false)
    const [quickActionPatient, setQuickActionPatient] = useState(null)
    const [quickActionAnchor, setQuickActionAnchor] = useState({ x: 0, y: 0 })
    const [showSchedulePickerFor, setShowSchedulePickerFor] = useState(null)
    const fileInputRef = useRef(null)
    const longPressTimerRef = useRef(null)

    const [newPatient, setNewPatient] = useState({
        name: '', age: '', gender: 'male', blood_group: '', village: '', phone: '', householdId: ''
    })

    useEffect(() => {
        const onOnline = () => setIsOnline(true)
        const onOffline = () => setIsOnline(false)
        window.addEventListener('online', onOnline)
        window.addEventListener('offline', onOffline)
        return () => {
            window.removeEventListener('online', onOnline)
            window.removeEventListener('offline', onOffline)
        }
    }, [])

    const pushToast = (message, type = 'info') => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }

    const markPendingSync = (n = 1) => setSyncPending(prev => prev + n)

    const filtered = useMemo(() => {
        return patients.filter((p) => {
            const searchOk =
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.village.toLowerCase().includes(search.toLowerCase())
            const villageOk = villageFilter === 'All Villages' ? true : p.village === villageFilter
            const mapOk = mapVillage ? p.village === mapVillage : true
            const riskOk =
                riskFilter === 'all' ? true :
                    riskFilter === 'high' ? p.risk >= 60 :
                        riskFilter === 'medium' ? (p.risk >= 30 && p.risk < 60) :
                            p.risk < 30
            return searchOk && villageOk && mapOk && riskOk
        })
    }, [patients, search, villageFilter, mapVillage, riskFilter])

    const villageClusters = useMemo(() => {
        return villageOptions
            .filter(v => v !== 'All Villages')
            .map((v) => ({
                village: v,
                count: patients.filter(p => p.village === v).length,
                highRisk: patients.filter(p => p.village === v && p.risk >= 60).length
            }))
    }, [patients])

    const urgentAlerts = useMemo(() => {
        return patients.filter(p => p.risk >= 60 || p.flags.length > 0)
    }, [patients])

    const visitCalendar = useMemo(() => {
        return patients
            .filter(p => p.scheduledVisit)
            .sort((a, b) => a.scheduledVisit.localeCompare(b.scheduledVisit))
            .slice(0, 6)
    }, [patients])

    const handleAdd = async () => {
        if (!newPatient.name) return
        const payload = {
            ...newPatient,
            asha_worker_id: 'ASHA001',
            camp_tag: campMode ? `${campMeta.location} | ${campMeta.date}` : null
        }
        try {
            const res = await fetch('/api/patients/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            setPatients(prev => [{
                ...data,
                report_count: 0,
                risk: 0,
                riskHistory: [0, 0, 0, 0, 0],
                lastVisit: '',
                scheduledVisit: '',
                pendingReports: 0,
                followupStatus: 'scheduled',
                flags: [],
                householdId: newPatient.householdId || `HH-${newPatient.village || 'GEN'}-${Date.now().toString().slice(-3)}`
            }, ...prev])
        } catch {
            setPatients(prev => [{
                id: Date.now(),
                ...newPatient,
                age: +newPatient.age,
                gender: newPatient.gender === 'male' ? 'Male' : 'Female',
                report_count: 0,
                risk: 0,
                riskHistory: [0, 0, 0, 0, 0],
                lastVisit: '',
                scheduledVisit: '',
                pendingReports: 0,
                followupStatus: 'scheduled',
                flags: [],
                householdId: newPatient.householdId || `HH-${newPatient.village || 'GEN'}-${Date.now().toString().slice(-3)}`
            }, ...prev])
        }
        markPendingSync()
        pushToast('Patient added to local queue.', 'success')
        setNewPatient({ name: '', age: '', gender: 'male', blood_group: '', village: '', phone: '', householdId: '' })
        setShowAdd(false)
    }

    const openQuickActions = (patient, evt) => {
        setQuickActionPatient(patient)
        setQuickActionAnchor({ x: evt.clientX || window.innerWidth / 2, y: evt.clientY || window.innerHeight / 2 })
    }

    const handleLongPressStart = (patient, evt) => {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = setTimeout(() => {
            openQuickActions(patient, evt)
        }, 550)
    }

    const handleLongPressEnd = () => {
        clearTimeout(longPressTimerRef.current)
    }

    const handleSchedule = (id, dateValue) => {
        setPatients(prev => prev.map(p => p.id === id ? {
            ...p,
            scheduledVisit: dateValue,
            followupStatus: 'scheduled'
        } : p))
        markPendingSync()
        setShowSchedulePickerFor(null)
        pushToast(isOnline ? 'Follow-up scheduled. SMS reminder queued.' : 'Saved offline. Reminder will sync later.', 'info')
    }

    const handleReportUploadClick = (patient) => {
        setSelectedPatient(patient)
        if (fileInputRef.current) fileInputRef.current.click()
    }

    const handleReportUpload = (file) => {
        if (!selectedPatient || !file) return
        setPatients(prev => prev.map((p) => {
            if (p.id !== selectedPatient.id) return p
            const previousRisk = p.risk
            const nextRisk = Math.min(95, Math.max(5, p.risk + (Math.random() > 0.5 ? 8 : -6)))
            const next = {
                ...p,
                report_count: p.report_count + 1,
                pendingReports: Math.max(0, p.pendingReports - 1),
                risk: nextRisk,
                riskHistory: [...p.riskHistory.slice(-4), nextRisk]
            }
            if (previousRisk < 60 && nextRisk >= 60) {
                pushToast(`${p.name} moved to HIGH RISK`, 'danger')
            }
            return next
        }))
        markPendingSync()
        pushToast(`Report attached for ${selectedPatient.name} (${file.name})`, 'success')
    }

    const handleBulkCSV = (text) => {
        const rows = text.trim().split('\n')
        if (rows.length < 2) return
        const entries = rows.slice(1).map((line, i) => {
            const [name, age, gender, blood_group, village, phone, risk] = line.split(',')
            return {
                id: Date.now() + i,
                name: (name || '').trim(),
                age: +(age || 0),
                gender: ((gender || 'Male').trim() || 'Male'),
                blood_group: (blood_group || '').trim(),
                village: (village || '').trim(),
                phone: (phone || '').trim(),
                report_count: 0,
                risk: +(risk || 0),
                riskHistory: [+(risk || 0), +(risk || 0), +(risk || 0), +(risk || 0), +(risk || 0)],
                lastVisit: '',
                scheduledVisit: '',
                pendingReports: 0,
                followupStatus: 'scheduled',
                flags: [],
                householdId: `HH-CSV-${Date.now().toString().slice(-4)}`
            }
        }).filter(e => e.name)
        if (entries.length) {
            setPatients(prev => [...entries, ...prev])
            markPendingSync(entries.length)
            pushToast(`Imported ${entries.length} camp patients from CSV`, 'success')
        }
    }

    const manualSync = () => {
        if (!isOnline) {
            pushToast('Offline: sync will resume when connected.', 'info')
            return
        }
        setSyncPending(0)
        pushToast('All pending updates synced.', 'success')
    }

    const selectedFamily = selectedPatient
        ? patients.filter(p => p.householdId && p.householdId === selectedPatient.householdId)
        : []

    const stats = [
        { icon: '👥', label: 'Total Patients', value: patients.length, color: '#06b6d4' },
        { icon: '🏘️', label: 'Villages', value: [...new Set(patients.map(p => p.village))].length, color: '#10b981' },
        { icon: '📄', label: 'Total Reports', value: patients.reduce((a, p) => a + p.report_count, 0), color: '#8b5cf6' },
        {
            icon: '⚠️', label: 'High Risk', value: patients.filter(p => p.risk >= 60).length, color: '#ef4444', onClick: () => setRiskFilter('high')
        },
    ]

    return (
        <div>
            <div className="page-header">
                <h2>🏥 Rural ASHA Worker Mode</h2>
                <p>Interactive cards, village map filtering, visit reminders, and offline-first sync for field workflows.</p>
            </div>

            {/* Top controls */}
            <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 10, marginBottom: 14 }}>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                    <input
                        className="form-input"
                        placeholder="Search patient or village..."
                        style={{ paddingLeft: 36 }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select className="form-select" value={villageFilter} onChange={(e) => setVillageFilter(e.target.value)}>
                    {villageOptions.map(v => <option key={v}>{v}</option>)}
                </select>
                <button className={`btn ${campMode ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCampMode(prev => !prev)}>
                    🏕️ Camp Mode {campMode ? 'On' : 'Off'}
                </button>
                <button className="btn btn-primary" onClick={() => setShowAdd(prev => !prev)}>
                    <UserPlus size={16} /> Add Patient
                </button>
            </div>

            {/* Sync + Alerts */}
            <div className="animate-in" style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                <button className="btn btn-outline btn-sm" onClick={manualSync}>
                    {isOnline ? <Cloud size={14} /> : <CloudOff size={14} />}
                    {isOnline ? 'Synced' : 'Offline'} • Pending {syncPending}
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setShowAlerts(prev => !prev)}>
                    <Bell size={14} /> Priority Alerts ({urgentAlerts.length})
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setRiskFilter('all')}>Reset Filters</button>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {campMode ? `Camp tag: ${campMeta.location} • ${campMeta.date}` : 'Camp mode disabled'}
                </div>
            </div>

            {showAlerts && (
                <div className="glass-card animate-in" style={{ marginBottom: 16, borderLeft: '3px solid #ef4444' }}>
                    <h3 style={{ fontSize: 15, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShieldAlert size={16} color="#ef4444" /> Urgent Cases
                    </h3>
                    <div style={{ display: 'grid', gap: 8 }}>
                        {urgentAlerts.map(a => (
                            <div key={a.id} style={{ padding: 10, borderRadius: 10, background: 'rgba(239,68,68,0.08)', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{a.name} • {a.village}</span>
                                <span style={{ color: '#ef4444', fontWeight: 700 }}>{a.risk}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats clickable gauges */}
            <div className="grid-4 animate-in" style={{ marginBottom: 20 }}>
                {stats.map((s, i) => (
                    <button
                        key={i}
                        className="glass-card stat-card"
                        style={{ padding: 16, textAlign: 'left', border: '1px solid var(--border-glass)', background: 'var(--gradient-card)' }}
                        onClick={s.onClick || undefined}
                    >
                        <div style={{ fontSize: 18 }}>{s.icon}</div>
                        <div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </button>
                ))}
            </div>

            {/* Add Form + Camp import */}
            {showAdd && (
                <div className="glass-card animate-in" style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>➕ Register New Patient</h3>
                    <div className="grid-3" style={{ gap: 12, marginBottom: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Full Name *</label>
                            <input className="form-input" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Age</label>
                            <input type="number" className="form-input" value={newPatient.age} onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select className="form-select" value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Blood Group</label>
                            <input className="form-input" value={newPatient.blood_group} onChange={e => setNewPatient({ ...newPatient, blood_group: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Village</label>
                            <input className="form-input" value={newPatient.village} onChange={e => setNewPatient({ ...newPatient, village: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input className="form-input" value={newPatient.phone} onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid-2" style={{ gap: 10, marginBottom: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Household ID</label>
                            <input className="form-input" value={newPatient.householdId} onChange={e => setNewPatient({ ...newPatient, householdId: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Camp CSV Import</label>
                            <input
                                className="form-input"
                                type="file"
                                accept=".csv"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    const text = await file.text()
                                    handleBulkCSV(text)
                                }}
                            />
                        </div>
                    </div>
                    {campMode && (
                        <div className="grid-2" style={{ gap: 10, marginBottom: 12 }}>
                            <div className="form-group">
                                <label className="form-label">Camp Location</label>
                                <input className="form-input" value={campMeta.location} onChange={e => setCampMeta({ ...campMeta, location: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Camp Date</label>
                                <input type="date" className="form-input" value={campMeta.date} onChange={e => setCampMeta({ ...campMeta, date: e.target.value })} />
                            </div>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" onClick={handleAdd}>✅ Register Patient</button>
                        <button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Village map + calendar */}
            <div className="grid-2 animate-in" style={{ marginBottom: 16 }}>
                <div className="glass-card">
                    <h3 style={{ fontSize: 15, marginBottom: 12 }}>🗺️ Village Cluster Map</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(120px, 1fr))', gap: 10 }}>
                        {villageClusters.map((v) => (
                            <button
                                key={v.village}
                                onClick={() => setMapVillage(prev => prev === v.village ? null : v.village)}
                                className="btn btn-outline"
                                style={{
                                    justifyContent: 'space-between',
                                    borderColor: mapVillage === v.village ? 'var(--accent-teal)' : 'var(--border-glass)',
                                    background: mapVillage === v.village ? 'rgba(6,182,212,0.12)' : 'transparent'
                                }}
                            >
                                <span><MapPin size={14} style={{ verticalAlign: 'middle' }} /> {v.village}</span>
                                <span style={{ fontSize: 12, color: v.highRisk ? '#ef4444' : 'var(--text-secondary)' }}>{v.count}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="glass-card">
                    <h3 style={{ fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CalendarDays size={16} /> Visit Scheduler
                    </h3>
                    <div style={{ display: 'grid', gap: 8 }}>
                        {visitCalendar.map(v => (
                            <div key={v.id} style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{v.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.village} • {v.scheduledVisit || 'No date'}</div>
                                </div>
                                {v.followupStatus === 'overdue' && (
                                    <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 700 }}>Overdue</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Patient Cards */}
            <div className="animate-in">
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>🧑 Patient Cards ({filtered.length})</h3>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 14,
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory',
                        paddingBottom: 4
                    }}
                >
                    {filtered.map((p) => {
                        const trendDelta = p.riskHistory[p.riskHistory.length - 1] - p.riskHistory[0]
                        const trendUp = trendDelta >= 0
                        return (
                            <button
                                key={p.id}
                                className="glass-card"
                                onClick={() => setSelectedPatient(p)}
                                onMouseDown={(evt) => handleLongPressStart(p, evt)}
                                onMouseUp={handleLongPressEnd}
                                onMouseLeave={handleLongPressEnd}
                                onTouchStart={(evt) => handleLongPressStart(p, evt.touches[0])}
                                onTouchEnd={handleLongPressEnd}
                                style={{
                                    textAlign: 'left',
                                    border: `2px solid ${riskBorder(p.risk)}`,
                                    position: 'relative',
                                    scrollSnapAlign: 'start',
                                    padding: 16,
                                    minHeight: 220
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{p.name}</div>
                                    <div style={{ color: riskColor(p.risk), fontWeight: 700 }}>{p.risk}%</div>
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                    {p.village} • {p.age}/{p.gender[0]} • {p.blood_group}
                                </div>
                                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: 36, marginBottom: 8 }}>
                                    <polyline
                                        fill="none"
                                        stroke={riskColor(p.risk)}
                                        strokeWidth="4"
                                        points={sparklinePoints(p.riskHistory)}
                                    />
                                </svg>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        {trendUp ? <TrendingUp size={12} color="#ef4444" /> : <TrendingDown size={12} color="#10b981" />}
                                        Trend {trendUp ? '+' : ''}{trendDelta}
                                    </span>
                                    <span>Last visit: {p.lastVisit || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                                    {p.pendingReports > 0 && <span style={{ fontSize: 11, color: '#f59e0b' }}>📄 Pending {p.pendingReports}</span>}
                                    {p.followupStatus === 'overdue' && <span style={{ fontSize: 11, color: '#ef4444' }}>⏰ Overdue follow-up</span>}
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={(e) => { e.stopPropagation(); handleReportUploadClick(p) }}
                                    >
                                        <Camera size={12} /> Add Report
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={(e) => { e.stopPropagation(); setShowSchedulePickerFor(p.id) }}
                                    >
                                        <CalendarDays size={12} /> Follow-up
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={(e) => { e.stopPropagation(); setSelectedPatient(p) }}
                                    >
                                        <Users size={12} /> Family
                                    </button>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleReportUpload(file)
                    e.target.value = ''
                }}
            />

            {/* Schedule picker modal */}
            {showSchedulePickerFor && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.7)', zIndex: 240, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setShowSchedulePickerFor(null)}>
                    <div className="glass-card" style={{ width: '90%', maxWidth: 360 }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: 10, fontSize: 16 }}>Schedule Follow-up</h3>
                        <input
                            type="date"
                            className="form-input"
                            defaultValue={patients.find(p => p.id === showSchedulePickerFor)?.scheduledVisit || ''}
                            onChange={(e) => handleSchedule(showSchedulePickerFor, e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Long-press quick actions */}
            {quickActionPatient && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 250 }} onClick={() => setQuickActionPatient(null)}>
                    <div
                        className="glass-card"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            left: Math.min(quickActionAnchor.x, window.innerWidth - 220),
                            top: Math.min(quickActionAnchor.y, window.innerHeight - 220),
                            width: 210,
                            padding: 10
                        }}
                    >
                        <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 6 }} onClick={() => { setShowSchedulePickerFor(quickActionPatient.id); setQuickActionPatient(null) }}>
                            <CalendarDays size={12} /> Schedule Visit
                        </button>
                        <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 6 }} onClick={() => { handleReportUploadClick(quickActionPatient); setQuickActionPatient(null) }}>
                            <Upload size={12} /> Add Report
                        </button>
                        <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => { pushToast(`Emergency alert raised for ${quickActionPatient.name}`, 'danger'); setQuickActionPatient(null) }}>
                            <AlertTriangle size={12} color="#ef4444" /> Emergency Alert
                        </button>
                    </div>
                </div>
            )}

            {/* Patient profile modal */}
            {selectedPatient && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 220, padding: 16 }}
                    onClick={() => setSelectedPatient(null)}
                >
                    <div className="glass-card" style={{ maxWidth: 760, width: '100%', maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>👤 {selectedPatient.name}</h3>
                        <div className="grid-3" style={{ gap: 10, marginBottom: 14 }}>
                            <div><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Age:</span> {selectedPatient.age}</div>
                            <div><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Gender:</span> {selectedPatient.gender}</div>
                            <div><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Blood Group:</span> {selectedPatient.blood_group}</div>
                            <div><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Village:</span> {selectedPatient.village}</div>
                            <div><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Phone:</span> {selectedPatient.phone}</div>
                            <div><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Risk:</span> <span style={{ color: riskColor(selectedPatient.risk), fontWeight: 700 }}>{selectedPatient.risk}%</span></div>
                        </div>

                        <div className="glass-card" style={{ padding: 14, marginBottom: 12 }}>
                            <h4 style={{ fontSize: 14, marginBottom: 8 }}>📊 Risk Trend (last 5)</h4>
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: 70 }}>
                                <polyline fill="none" stroke={riskColor(selectedPatient.risk)} strokeWidth="3" points={sparklinePoints(selectedPatient.riskHistory)} />
                            </svg>
                        </div>

                        <div className="glass-card" style={{ padding: 14, marginBottom: 12 }}>
                            <h4 style={{ fontSize: 14, marginBottom: 8 }}>👨‍👩‍👧 Family (Household: {selectedPatient.householdId || 'N/A'})</h4>
                            <div style={{ display: 'grid', gap: 6 }}>
                                {selectedFamily.map(f => (
                                    <div key={f.id} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', fontSize: 13 }}>
                                        {f.name} • {f.age}/{f.gender[0]} • Risk {f.risk}%
                                    </div>
                                ))}
                            </div>
                            <button
                                className="btn btn-outline btn-sm"
                                style={{ marginTop: 10 }}
                                onClick={() => {
                                    setShowAdd(true)
                                    setNewPatient(prev => ({ ...prev, village: selectedPatient.village, householdId: selectedPatient.householdId }))
                                    setSelectedPatient(null)
                                }}
                            >
                                <Plus size={12} /> Add family member
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => handleReportUploadClick(selectedPatient)}>
                                <Camera size={12} /> One-tap Report Upload
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => setShowSchedulePickerFor(selectedPatient.id)}>
                                <CalendarDays size={12} /> Schedule Follow-up
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => pushToast(`Voice Q&A started for ${selectedPatient.name}`, 'info')}>
                                🎤 Start Voice Q&A
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => pushToast(`QR wristband prepared for ${selectedPatient.name}`, 'success')}>
                                <QrCode size={12} /> Generate QR Wristband
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => pushToast(`Reminder sent to ${selectedPatient.phone}`, 'success')}>
                                <Phone size={12} /> Send Reminder
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => setSelectedPatient(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toasts */}
            <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 300, display: 'grid', gap: 8 }}>
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className="glass-card"
                        style={{
                            padding: '10px 12px',
                            minWidth: 240,
                            borderLeft: `3px solid ${t.type === 'danger' ? '#ef4444' : t.type === 'success' ? '#10b981' : '#06b6d4'}`
                        }}
                    >
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.message}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
