import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const BRANCHES = ['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'Civil', 'AI & ML', 'Data Science']
const YEAR = new Date().getFullYear()
const BATCHES = Array.from({ length: 8 }, (_, i) => YEAR + 2 - i)

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', usn: '', branch: '', batch: '',
    designation: '', department: '', phone: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-gray-900">NextStep</span>
          </Link>
          <h1 className="font-display text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">GSSS Institute of Engineering & Technology for Women</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role selector */}
            <div>
              <label className="form-label">I am a</label>
              <div className="flex gap-2">
                {['student', 'faculty'].map(r => (
                  <button key={r} type="button" onClick={() => set('role', r)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-all
                      ${form.role === r ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary/50'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Your full name" value={form.name}
                onChange={e => set('name', e.target.value)} required />
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@gsss.edu" value={form.email}
                onChange={e => set('email', e.target.value)} required />
            </div>

            {/* Student fields */}
            {form.role === 'student' && (
              <>
                <div>
                  <label className="form-label">USN</label>
                  <input className="form-input" placeholder="1XX21CS001" value={form.usn}
                    onChange={e => set('usn', e.target.value.toUpperCase())} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Branch</label>
                    <select className="form-select" value={form.branch} onChange={e => set('branch', e.target.value)} required>
                      <option value="">Select</option>
                      {BRANCHES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Batch (Grad. Year)</label>
                    <select className="form-select" value={form.batch} onChange={e => set('batch', e.target.value)} required>
                      <option value="">Select</option>
                      {BATCHES.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Faculty fields */}
            {form.role === 'faculty' && (
              <>
                <div>
                  <label className="form-label">Designation</label>
                  <input className="form-input" placeholder="Assistant Professor" value={form.designation}
                    onChange={e => set('designation', e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Department</label>
                  <select className="form-select" value={form.department} onChange={e => set('department', e.target.value)} required>
                    <option value="">Select department</option>
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Phone (optional)</label>
                  <input className="form-input" placeholder="+91 9876543210" value={form.phone}
                    onChange={e => set('phone', e.target.value)} />
                </div>
              </>
            )}

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="form-input pr-10"
                  placeholder="Min. 8 characters" value={form.password}
                  onChange={e => set('password', e.target.value)} required minLength={8} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" placeholder="Repeat password"
                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-1">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
