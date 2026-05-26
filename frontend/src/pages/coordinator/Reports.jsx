import { useEffect, useState } from 'react'
import { LayoutDashboard, BarChart2, Users, Download, Filter } from 'lucide-react'
import Layout from '../../components/Layout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/coordinator',         label: 'Dashboard', icon: LayoutDashboard },
  { to: '/coordinator/reports', label: 'Reports',   icon: BarChart2 },
  { to: '/coordinator/users',   label: 'Users',     icon: Users },
]

const BRANCHES = ['', 'CSE', 'ISE', 'ECE', 'EEE', 'ME', 'Civil', 'AI & ML', 'Data Science']

export default function CoordReports() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ status: '', branch: '', from: '', to: '' })
  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  async function fetchReport() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v))
      const r = await api.get('/reports/export?' + params.toString())
      setData(r.data.data || [])
      toast.success(`${r.data.count} records loaded`)
    } catch { toast.error('Failed to load report') } finally { setLoading(false) }
  }

  function exportCSV() {
    if (!data.length) return
    const headers = ['Student', 'USN', 'Branch', 'Faculty', 'Purpose', 'Institution', 'Status', 'Date', 'Placement']
    const rows = data.map(r => [
      r.student?.name, r.student?.usn, r.student?.branch,
      r.faculty?.name, r.purpose, r.institution_name,
      r.status, new Date(r.created_at).toLocaleDateString('en-IN'),
      r.placement_status || ''
    ])
    const csv = [headers, ...rows].map(row => row.map(v => `"${v || ''}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'nextstep_report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout navItems={NAV} title="Reports">
      <div className="space-y-5">
        <div className="card p-5">
          <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Filter size={15} /> Filter Report
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="form-label">Status</label>
              <select className="form-select" value={filters.status} onChange={e => set('status', e.target.value)}>
                <option value="">All</option>
                <option>pending</option><option>approved</option><option>rejected</option>
              </select>
            </div>
            <div>
              <label className="form-label">Branch</label>
              <select className="form-select" value={filters.branch} onChange={e => set('branch', e.target.value)}>
                {BRANCHES.map(b => <option key={b} value={b}>{b || 'All'}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">From</label>
              <input type="date" className="form-input" value={filters.from} onChange={e => set('from', e.target.value)} />
            </div>
            <div>
              <label className="form-label">To</label>
              <input type="date" className="form-input" value={filters.to} onChange={e => set('to', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchReport} disabled={loading} className="btn-primary flex items-center gap-1.5">
              {loading ? 'Loading…' : 'Generate Report'}
            </button>
            {data.length > 0 && (
              <button onClick={exportCSV} className="btn-ghost flex items-center gap-1.5">
                <Download size={14} /> Export CSV
              </button>
            )}
          </div>
        </div>

        {data.length > 0 && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Student', 'USN', 'Branch', 'Faculty', 'Purpose', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{r.student?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{r.student?.usn}</td>
                    <td className="px-4 py-3 text-gray-500">{r.student?.branch}</td>
                    <td className="px-4 py-3 text-gray-600">{r.faculty?.name}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{r.purpose}</td>
                    <td className="px-4 py-3">
                      <span className={r.status === 'pending' ? 'badge-pending' : r.status === 'approved' ? 'badge-approved' : 'badge-rejected'}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
