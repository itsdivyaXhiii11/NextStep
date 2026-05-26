import { useState } from 'react'
import { LayoutDashboard, PlusCircle, List, User } from 'lucide-react'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/student',          label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/student/new',      label: 'New Request', icon: PlusCircle },
  { to: '/student/requests', label: 'My Requests', icon: List },
  { to: '/student/profile',  label: 'Profile',     icon: User },
]

export default function StudentProfile() {
  const { user, fetchProfile } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
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
            <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center">
              <span className="font-display text-2xl text-primary font-semibold">{user?.name?.[0]}</span>
            </div>
            <div>
              <p className="font-display font-semibold text-gray-900 text-lg">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'USN',    value: user?.usn },
              { label: 'Branch', value: user?.branch },
              { label: 'Batch',  value: user?.batch },
              { label: 'Role',   value: user?.role },
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
            <div>
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
