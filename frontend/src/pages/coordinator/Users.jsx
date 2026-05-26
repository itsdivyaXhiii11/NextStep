import { useEffect, useState } from 'react'
import { LayoutDashboard, BarChart2, Users, Search } from 'lucide-react'
import Layout from '../../components/Layout'
import api from '../../utils/api'

const NAV = [
  { to: '/coordinator',         label: 'Dashboard', icon: LayoutDashboard },
  { to: '/coordinator/reports', label: 'Reports',   icon: BarChart2 },
  { to: '/coordinator/users',   label: 'Users',     icon: Users },
]

export default function CoordUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('student')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/admin/users?role=${filter}&limit=100`)
      .then(r => setUsers(r.data.users || []))
      .finally(() => setLoading(false))
  }, [filter])

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.usn?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout navItems={NAV} title="Users">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            {['student', 'faculty'].map(r => (
              <button key={r} onClick={() => setFilter(r)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize transition-all
                  ${filter === r ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary/50'}`}>
                {r}s
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="form-input pl-8 text-sm py-1.5" placeholder="Search name, USN, email…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="card p-3 h-16 animate-pulse bg-gray-50" />)}</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {filter === 'student'
                    ? ['Name', 'USN', 'Branch', 'Batch', 'Email', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>)
                    : ['Name', 'Designation', 'Department', 'Email', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>)
                  }
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                    {filter === 'student' ? <>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{u.usn || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{u.branch || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{u.batch || '—'}</td>
                    </> : <>
                      <td className="px-4 py-3 text-gray-500">{u.designation || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{u.department || '—'}</td>
                    </>}
                    <td className="px-4 py-3 text-gray-400 text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.status === 'active' ? 'badge-approved' : 'badge-rejected'}`}>{u.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No users found</p>}
          </div>
        )}
      </div>
    </Layout>
  )
}
