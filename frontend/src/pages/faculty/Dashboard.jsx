import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, List, User, Clock, CheckCircle, XCircle, FileText, ArrowRight } from 'lucide-react'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const NAV = [
  { to: '/faculty',          label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/faculty/requests', label: 'Requests',   icon: List },
  { to: '/faculty/profile',  label: 'Profile',    icon: User },
]

export default function FacultyDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <Layout navItems={NAV} title="Dashboard">
      <div className="space-y-6">
        <div className="card p-5 bg-gradient-to-r from-amber-500 to-amber-400 text-white">
          <p className="text-amber-100 text-sm mb-1">Welcome,</p>
          <h2 className="font-display text-2xl font-semibold">{user?.name}</h2>
          <p className="text-amber-100 text-sm mt-1">{user?.designation} · {user?.department}</p>
          {stats?.pending > 0 && (
            <Link to="/faculty/requests?status=pending"
              className="inline-flex items-center gap-2 mt-4 bg-white text-amber-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-amber-50 transition-colors">
              <Clock size={14} /> {stats.pending} pending review
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="card p-4 h-24 animate-pulse bg-gray-50" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total',    value: stats?.total || 0,    icon: FileText,     color: 'text-primary bg-primary-soft' },
              { label: 'Pending',  value: stats?.pending || 0,  icon: Clock,        color: 'text-amber-600 bg-amber-50' },
              { label: 'Approved', value: stats?.approved || 0, icon: CheckCircle,  color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Rejected', value: stats?.rejected || 0, icon: XCircle,      color: 'text-red-500 bg-red-50' },
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

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900">Recent Activity</h3>
            <Link to="/faculty/requests" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {!stats?.requests?.length ? (
            <p className="text-sm text-gray-400 text-center py-6">No requests yet</p>
          ) : (
            <div className="space-y-2.5">
              {stats.requests.slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <p className="text-sm text-gray-700">{r.purpose}</p>
                  <span className={r.status === 'pending' ? 'badge-pending' : r.status === 'approved' ? 'badge-approved' : 'badge-rejected'}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
