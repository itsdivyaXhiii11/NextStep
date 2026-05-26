import { useState } from 'react'
import { LayoutDashboard, List, User } from 'lucide-react'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/faculty',          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/faculty/requests', label: 'Requests',  icon: List },
  { to: '/faculty/profile',  label: 'Profile',   icon: User },
]

const BRANCHES = ['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'Civil', 'AI & ML', 'Data Science']

export default function FacultyProfile() {
  const { user, fetchProfile } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    designation: user?.designation || '',
    department: user?.department || '',
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch('/profile', form)
      await fetchProfile()
      toast.success('Profile updated')
    } catch { toast.error('Update failed') } finally { setLoading(false) }
  }

  return (
    <Layout navItems={NAV} title="Profile">
      <div className="max-w-md space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
              <span className="font-display text-2xl text-amber-600 font-semibold">{user?.name?.[0]}</span>
            </div>
            <div>
              <p className="font-display font-semibold text-gray-900 text-lg">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Designation', value: user?.designation },
              { label: 'Department',  value: user?.department },
              { label: 'Phone',       value: user?.phone },
              { label: 'Role',        value: user?.role },
            ].map(f => (
              <div key={f.label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-400">{f.label}</p>
                <p className="font-medium text-gray-800 mt-0.5">{f.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Edit Profile</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
            <div><label className="form-label">Designation</label>
              <input className="form-input" value={form.designation} onChange={e => set('designation', e.target.value)} /></div>
            <div><label className="form-label">Department</label>
              <select className="form-select" value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">Select</option>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select></div>
            <div><label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
