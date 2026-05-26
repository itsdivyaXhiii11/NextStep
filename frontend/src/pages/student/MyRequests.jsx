import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, List, User, Download, Filter } from 'lucide-react'
import Layout from '../../components/Layout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/student',          label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/student/new',      label: 'New Request', icon: PlusCircle },
  { to: '/student/requests', label: 'My Requests', icon: List },
  { to: '/student/profile',  label: 'Profile',     icon: User },
]

const STATUS_COLOR = {
  pending:  'badge-pending',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
}

export default function StudentMyRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.get('/lor' + (filter ? `?status=${filter}` : ''))
      .then(r => setRequests(r.data.requests || []))
      .finally(() => setLoading(false))
  }, [filter])

  async function downloadPDF(req) {
    if (!req.pdf_url) return toast.error('PDF not ready yet')
    window.open(req.pdf_url, '_blank')
  }

  return (
    <Layout navItems={NAV} title="My Requests">
      <div className="space-y-4">

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-gray-400" />
          {['', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all
                ${filter === s ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary/50'}`}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="card p-4 h-20 animate-pulse bg-gray-50" />)}
          </div>
        ) : requests.length === 0 ? (
          <div className="card p-10 text-center">
            <List size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No requests found</p>
            <Link to="/student/new" className="btn-primary text-sm mt-3 inline-flex items-center gap-1.5">
              <PlusCircle size={14} /> New request
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={STATUS_COLOR[req.status]}>{req.status}</span>
                      <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p className="font-medium text-gray-900 text-sm truncate">{req.institution_name || req.purpose}</p>
                    {req.program_name && <p className="text-xs text-gray-500 mt-0.5">{req.program_name}</p>}
                    {req.faculty && <p className="text-xs text-gray-400 mt-1">Faculty: {req.faculty.name}</p>}
                    {req.faculty_remarks && (
                      <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 italic">"{req.faculty_remarks}"</p>
                    )}
                  </div>
                  {req.status === 'approved' && req.pdf_url && (
                    <button onClick={() => downloadPDF(req)}
                      className="shrink-0 flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-colors font-medium">
                      <Download size={13} /> PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
