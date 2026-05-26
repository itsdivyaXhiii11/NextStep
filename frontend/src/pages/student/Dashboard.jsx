import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, List, User, FileText, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const NAV = [
  { to: '/student',          label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/student/new',      label: 'New Request',  icon: PlusCircle },
  { to: '/student/requests', label: 'My Requests',  icon: List },
  { to: '/student/profile',  label: 'Profile',      icon: User },
]

const STATUS_BADGE = {
  pending:  <span className="badge-pending">Pending</span>,
  approved: <span className="badge-approved">Approved</span>,
  rejected: <span className="badge-rejected">Rejected</span>,
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <Layout navItems={NAV} title="Dashboard">
      <div className="space-y-6">

        {/* Welcome */}
        <div className="card p-5 bg-gradient-to-r from-primary to-primary-light text-white">
          <p className="text-primary-soft/70 text-sm mb-1">Good day,</p>
          <h2 className="font-display text-2xl font-semibold">{user?.name} 👋</h2>
          <p className="text-primary-soft/80 text-sm mt-1">{user?.usn} · {user?.branch} · Batch {user?.batch}</p>
          <Link to="/student/new" className="inline-flex items-center gap-2 mt-4 bg-white text-primary text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary-soft transition-colors">
            <PlusCircle size={15} /> New LOR Request
          </Link>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="card p-4 h-24 animate-pulse bg-gray-50" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Requests', value: stats?.total || 0, icon: FileText, color: 'text-primary bg-primary-soft' },
              { label: 'Pending',        value: stats?.pending || 0, icon: Clock, color: 'text-amber-600 bg-amber-50' },
              { label: 'Approved',       value: stats?.approved || 0, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Rejected',       value: stats?.rejected || 0, icon: XCircle, color: 'text-red-500 bg-red-50' },
            ].map(card => (
              <div key={card.label} className="card p-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                  <card.icon size={17} />
                </div>
                <p className="text-2xl font-display font-semibold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent requests */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900">Recent Requests</h3>
            <Link to="/student/requests" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {!stats?.requests?.length ? (
            <div className="text-center py-8">
              <FileText size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No requests yet</p>
              <Link to="/student/new" className="btn-primary text-sm mt-3 inline-flex items-center gap-1.5">
                <PlusCircle size={14} /> Submit your first LOR
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.requests.slice(0, 5).map(r => (
                <div key={r.id || Math.random()} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.institution_name || r.purpose}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  {STATUS_BADGE[r.status]}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
