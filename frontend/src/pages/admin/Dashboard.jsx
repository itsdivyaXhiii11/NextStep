import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, Shield, FileText, Clock, CheckCircle, Activity } from 'lucide-react'
import Layout from '../../components/Layout'
import api from '../../utils/api'

const NAV = [
  { to: '/admin',       label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users',     icon: Users },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <Layout navItems={NAV} title="Admin Panel">
      <div className="space-y-6">
        <div className="card p-5 bg-gradient-to-r from-gray-800 to-gray-700 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-gray-300" />
            <p className="text-gray-300 text-sm">System Administration</p>
          </div>
          <h2 className="font-display text-2xl font-semibold">GSSS NextStep Admin</h2>
          <p className="text-gray-400 text-sm mt-1">Full system access · GSSS IETW</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="card p-4 h-24 animate-pulse bg-gray-50" />)}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Users',   value: stats?.users?.total || 0,       icon: Users,       color: 'text-primary bg-primary-soft' },
              { label: 'Students',      value: stats?.users?.students || 0,    icon: Activity,    color: 'text-blue-600 bg-blue-50' },
              { label: 'Total LORs',    value: stats?.lors?.total || 0,        icon: FileText,    color: 'text-emerald-600 bg-emerald-50' },
              { label: 'This Month',    value: stats?.lors?.thisMonth || 0,    icon: Clock,       color: 'text-amber-600 bg-amber-50' },
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

        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/admin/users" className="card p-5 hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center mb-3">
              <Users size={18} className="text-primary" />
            </div>
            <h3 className="font-display font-semibold text-gray-900 mb-1">Manage Users</h3>
            <p className="text-sm text-gray-500">Activate, deactivate, or change roles for any user in the system.</p>
          </Link>
          <div className="card p-5 bg-gray-50/50">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
              <CheckCircle size={18} className="text-gray-400" />
            </div>
            <h3 className="font-display font-semibold text-gray-400 mb-1">System Health</h3>
            <p className="text-sm text-gray-400">All systems operational · Supabase connected</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
