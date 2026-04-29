import { useState } from 'react'
import { AlertTriangle, ChevronDown, CircleHelp, HeartPulse, Shield, Wind, X } from 'lucide-react'

const faqItems = [
    {
        question: 'What causes shortness of breath?',
        answer: 'Shortness of breath can happen with asthma, chest infection, pneumonia, COPD, anxiety, anemia, heart problems, or low oxygen. If it is sudden, severe, or getting worse, it needs urgent medical attention.',
    },
    {
        question: 'When is breathing trouble an emergency?',
        answer: 'Treat it as urgent if you have blue lips, chest pain, confusion, fainting, very fast breathing, cannot speak full sentences, or oxygen saturation below 92 percent if you have an oximeter. Get emergency care immediately.',
    },
    {
        question: 'Why do I keep coughing for many days?',
        answer: 'A cough can last because of viral infection, asthma, allergies, acid reflux, smoking, or tuberculosis. If it lasts more than 2 to 3 weeks, has blood, fever, weight loss, or breathing trouble, see a doctor.',
    },
    {
        question: 'How do I know if wheezing is serious?',
        answer: 'Wheezing is a whistling sound from narrowed airways and is common in asthma, allergy, and infection. It is more serious if it comes with chest tightness, fast breathing, exhaustion, or poor relief from your inhaler.',
    },
    {
        question: 'Can asthma start in adults too?',
        answer: 'Yes. Adult-onset asthma can happen after repeated allergies, pollution exposure, smoke exposure, workplace irritants, or respiratory infections. A doctor may confirm it with history, examination, and breathing tests.',
    },
    {
        question: 'What is the difference between asthma and COPD?',
        answer: 'Asthma often starts earlier, varies from day to day, and is commonly linked with allergy. COPD is more common in older adults, smokers, or people exposed to biomass smoke, and symptoms are usually more persistent.',
    },
    {
        question: 'What are common signs of pneumonia?',
        answer: 'Pneumonia may cause fever, cough with phlegm, chest pain, fast breathing, weakness, and low oxygen. Older adults may also show confusion, sleepiness, or reduced appetite.',
    },
    {
        question: 'Can pollution and smoke worsen lung problems?',
        answer: 'Yes. Cigarette smoke, kitchen smoke, dust, crop burning, and city pollution can trigger cough, asthma flare, COPD symptoms, and repeated chest infections. Reducing exposure helps a lot.',
    },
    {
        question: 'How should I use an inhaler properly?',
        answer: 'Breathe out fully first, seal your lips around the inhaler or spacer, press once as you start breathing in slowly, then hold your breath for about 10 seconds if possible. If you use a steroid inhaler, rinse your mouth after use.',
    },
    {
        question: 'What can I do at home for mild breathing symptoms?',
        answer: 'Rest, drink fluids, avoid smoke and dust, use prescribed inhalers exactly as advised, and monitor fever or oxygen if possible. Do not delay medical review if symptoms worsen or last longer than expected.',
    },
    {
        question: 'Can TB cause cough and breathing issues?',
        answer: 'Yes. Tuberculosis can cause cough lasting more than 2 weeks, fever, night sweats, weight loss, weakness, and sometimes blood in sputum. It needs testing and proper treatment from a doctor or TB clinic.',
    },
    {
        question: 'When should I check oxygen saturation?',
        answer: 'Check it if you have chest infection, pneumonia, asthma flare, COVID-like illness, or ongoing breathlessness. Repeated low readings, especially below 92 percent, should be discussed urgently with a clinician.',
    },
]

const quickTips = [
    'Avoid smoking, vaping, and second-hand smoke.',
    'Keep rooms ventilated and reduce dust exposure.',
    'Use masks in heavy pollution, smoke, or dusty work areas.',
    'Take vaccines on time, especially flu and pneumonia vaccines if advised.',
]

export default function RespiratoryFaqs() {
    const [activeFaqIndex, setActiveFaqIndex] = useState(null)

    return (
        <div>
            <div className="page-header">
                <h2>Breathing And Lung FAQs</h2>
                <p>Common questions and simple answers about cough, wheezing, asthma, pneumonia, COPD, TB, and breathlessness.</p>
            </div>

            <div className="grid-3 animate-in" style={{ marginBottom: 20 }}>
                <div className="glass-card stat-card" style={{ padding: 18 }}>
                    <div style={{ color: '#06b6d4' }}><Wind size={22} /></div>
                    <div className="stat-value" style={{ fontSize: 22, color: '#06b6d4' }}>12</div>
                    <div className="stat-label">Most Asked Questions</div>
                </div>
                <div className="glass-card stat-card" style={{ padding: 18 }}>
                    <div style={{ color: '#f59e0b' }}><AlertTriangle size={22} /></div>
                    <div className="stat-value" style={{ fontSize: 22, color: '#f59e0b' }}>Red Flags</div>
                    <div className="stat-label">Seek urgent help for severe symptoms</div>
                </div>
                <div className="glass-card stat-card" style={{ padding: 18 }}>
                    <div style={{ color: '#10b981' }}><Shield size={22} /></div>
                    <div className="stat-value" style={{ fontSize: 22, color: '#10b981' }}>Prevention</div>
                    <div className="stat-label">Smoke avoidance, masks, vaccines</div>
                </div>
            </div>

            <div className="glass-card animate-in" style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HeartPulse size={18} color="#ef4444" /> Go To A Doctor Urgently If
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                    {[
                        'Severe shortness of breath or inability to speak normally',
                        'Blue lips, confusion, fainting, or drowsiness',
                        'Chest pain with breathing trouble',
                        'Oxygen saturation repeatedly below 92 percent',
                    ].map((item) => (
                        <div key={item} className="glass-card glow-red" style={{ padding: 16, borderLeft: '3px solid #ef4444' }}>
                            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="animate-in" style={{ display: 'grid', gap: 16 }}>
                {faqItems.map((item, index) => (
                    <div key={item.question} className="glass-card">
                        <button
                            type="button"
                            onClick={() => setActiveFaqIndex(index)}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 12,
                                width: '100%',
                                textAlign: 'left',
                                background: 'transparent',
                                border: 'none',
                                color: 'inherit',
                                padding: 0
                            }}
                        >
                            <div style={{
                                width: 34,
                                height: 34,
                                borderRadius: 10,
                                background: 'rgba(6, 182, 212, 0.12)',
                                color: '#06b6d4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <CircleHelp size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                                        {index + 1}. {item.question}
                                    </h3>
                                    <ChevronDown
                                        size={18}
                                        style={{
                                            color: 'var(--text-muted)',
                                            transition: 'transform 200ms ease'
                                        }}
                                    />
                                </div>
                            </div>
                        </button>
                    </div>
                ))}
            </div>

            <div className="glass-card animate-in" style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Daily Lung Care Tips</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                    {quickTips.map((tip) => (
                        <div key={tip} style={{
                            padding: 14,
                            borderRadius: 12,
                            background: 'rgba(16, 185, 129, 0.08)',
                            border: '1px solid rgba(16, 185, 129, 0.16)',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.6
                        }}>
                            {tip}
                        </div>
                    ))}
                </div>
                <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    This page is for education only and does not replace a qualified doctor. If symptoms are severe, worsening, or unusual, get medical help promptly.
                </p>
            </div>

            {activeFaqIndex !== null && (
                <div
                    onClick={() => setActiveFaqIndex(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(2, 6, 23, 0.65)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 20,
                        zIndex: 1200
                    }}
                >
                    <div
                        className="glass-card"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: 720,
                            padding: 24,
                            border: '1px solid var(--border-glass)',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                            <h3 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4 }}>
                                {activeFaqIndex + 1}. {faqItems[activeFaqIndex].question}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setActiveFaqIndex(null)}
                                style={{
                                    border: '1px solid var(--border-glass)',
                                    background: 'var(--bg-glass)',
                                    color: 'var(--text-secondary)',
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                aria-label="Close FAQ popup"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <p style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--text-secondary)' }}>
                            {faqItems[activeFaqIndex].answer}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
