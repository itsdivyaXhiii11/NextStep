import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, Search, ShieldCheck, UserX, UserCheck } from 'lucide-react'
import Layout from '../../components/Layout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/admin',       label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users',     icon: Users },
]

const ROLES = ['student', 'faculty', 'coordinator', 'admin']

export default function AdminUsers() {
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('')
  const [search, setSearch]   = useState('')
  const [acting, setActing]   = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get(`/admin/users?limit=200${filter ? `&role=${filter}` : ''}`)
      .then(r => setUsers(r.data.users || []))
      .finally(() => setLoading(false))
  }, [filter])

  async function setStatus(id, status) {
    setActing(id + status)
    try {
      await api.patch(`/admin/users/${id}/status`, { status })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
      toast.success('User status updated')
    } catch { toast.error('Failed') } finally { setActing(null) }
  }

  async function setRole(id, role) {
    setActing(id + role)
    try {
      await api.patch(`/admin/users/${id}/role`, { role })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
      toast.success('Role updated')
    } catch { toast.error('Failed') } finally { setActing(null) }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.usn?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout navItems={NAV} title="Manage Users">
      <div className="space-y-4">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2 flex-wrap">
            {['', ...ROLES].map(r => (
              <button key={r} onClick={() => setFilter(r)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize transition-all
                  ${filter === r ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary/50'}`}>
                {r || 'All'}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="form-input pl-8 text-sm py-1.5" placeholder="Search name, email, USN…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="card p-3 h-16 animate-pulse bg-gray-50" />)}</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(u => (
              <div key={u.id} className="card p-4 flex items-center gap-4 flex-wrap">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                  <span className="font-display font-semibold text-primary text-sm">{u.name?.[0]}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email} {u.usn ? `· ${u.usn}` : ''}</p>
                </div>

                {/* Status badge */}
                <span className={`badge shrink-0 ${u.status === 'active' ? 'badge-approved' : 'badge-rejected'}`}>
                  {u.status}
                </span>

                {/* Role select */}
                <select value={u.role}
                  onChange={e => setRole(u.id, e.target.value)}
                  disabled={!!acting}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white shrink-0">
                  {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                </select>

                {/* Action buttons */}
                <div className="flex gap-1.5 shrink-0">
                  {u.status !== 'active' ? (
                    <button onClick={() => setStatus(u.id, 'active')}
                      disabled={!!acting}
                      className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors font-medium">
                      <UserCheck size={12} /> Activate
                    </button>
                  ) : (
                    <button onClick={() => setStatus(u.id, 'deactivated')}
                      disabled={!!acting}
                      className="flex items-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors font-medium">
                      <UserX size={12} /> Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="card p-10 text-center text-gray-400 text-sm">No users found</div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
