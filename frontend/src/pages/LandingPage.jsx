import { Link } from 'react-router-dom'
import { GraduationCap, FileText, CheckCircle, Users, ArrowRight, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

const STATS = [
  { label: 'Letters Generated', end: 1284, suffix: '+' },
  { label: 'Students Helped',   end: 847,  suffix: '+' },
  { label: 'Approval Rate',     end: 96,   suffix: '%' },
]

function useCount(end, duration = 1800) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const step = ts => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(ease * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    const timeout = setTimeout(() => requestAnimationFrame(step), 400)
    return () => clearTimeout(timeout)
  }, [end, duration])
  return val
}

function StatCard({ label, end, suffix, delay = 0 }) {
  const val = useCount(end)
  return (
    <div className="text-center">
      <p className="text-3xl font-display font-semibold text-primary">{val.toLocaleString()}{suffix}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

export default function LandingPage() {
  const [online] = useState(Math.floor(Math.random() * 15) + 8)

  return (
    <div className="min-h-screen bg-white font-body">

      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
            <GraduationCap size={16} className="text-white" />
          </div>
          <span className="font-display font-semibold text-gray-900">NextStep</span>
          <span className="text-xs text-gray-400 hidden sm:block">by GSSS</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            {online} online
          </div>
          <Link to="/login" className="text-sm text-gray-600 hover:text-primary transition-colors font-medium">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm px-4 py-2">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-soft text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Sparkles size={12} />
          GSSS Institute of Engineering & Technology for Women
        </div>
        <h1 className="font-display text-5xl sm:text-6xl font-semibold text-gray-900 leading-[1.1] mb-5">
          Your recommendation<br />
          <em className="text-primary not-italic">letter, sorted.</em>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-8">
          Request LORs, track approvals, generate professional PDFs — all in one place for students, faculty and coordinators.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/register" className="btn-primary flex items-center gap-2 px-6 py-3 text-base">
            Request your LOR <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-ghost flex items-center gap-2 px-6 py-3 text-base">
            Sign in
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-2xl mx-auto px-6 py-10">
        <div className="card p-6 grid grid-cols-3 divide-x divide-gray-100">
          {STATS.map((s, i) => <StatCard key={s.label} {...s} delay={i * 200} />)}
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-xs text-center text-gray-400 uppercase tracking-widest mb-6">Choose your role</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { role: 'Student', icon: GraduationCap, color: 'bg-violet-50 text-violet-600', desc: 'Request LORs, track status, download PDFs', count: '342 students', to: '/register' },
            { role: 'Faculty', icon: FileText, color: 'bg-amber-50 text-amber-600', desc: 'Review requests and approve with one click', count: '58 faculty', to: '/register', featured: true },
            { role: 'Coordinator', icon: Users, color: 'bg-emerald-50 text-emerald-700', desc: 'Full analytics, reports, and oversight', count: '6 coordinators', to: '/login' },
          ].map(item => (
            <Link key={item.role} to={item.to}
              className={`card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group
                ${item.featured ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
              {item.featured && (
                <span className="inline-block text-[10px] bg-primary text-white px-2 py-0.5 rounded-full mb-3 font-medium">Most active</span>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                <item.icon size={18} />
              </div>
              <h3 className="font-display font-semibold text-gray-900 mb-1">{item.role}</h3>
              <p className="text-sm text-gray-500 mb-3 leading-relaxed">{item.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{item.count}</span>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-xs text-center text-gray-400 uppercase tracking-widest mb-6">How it works</p>
        <div className="relative">
          <div className="absolute left-5 top-6 bottom-6 w-px bg-gray-100" />
          {[
            { n: '01', title: 'Submit your request', desc: 'Pick your faculty, upload SOP & resume, and submit in under 3 minutes.' },
            { n: '02', title: 'Faculty reviews',     desc: 'Your faculty gets notified instantly and can approve or decline with remarks.' },
            { n: '03', title: 'PDF is generated',    desc: 'On approval, a professional LOR PDF is auto-generated and emailed to you.' },
            { n: '04', title: 'Update your outcome', desc: 'Got placed or admitted? Update your outcome — it helps the college track success.' },
          ].map(step => (
            <div key={step.n} className="flex gap-5 mb-6 last:mb-0">
              <div className="w-10 h-10 shrink-0 rounded-full bg-primary-soft text-primary text-sm font-display font-semibold flex items-center justify-center z-10">
                {step.n}
              </div>
              <div className="pt-1.5">
                <h4 className="font-medium text-gray-900 mb-0.5">{step.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-5 text-center text-xs text-gray-400">
        © 2026 GSSS NextStep · GSSS Institute of Engineering & Technology for Women, Mysuru
      </footer>
    </div>
  )
}
