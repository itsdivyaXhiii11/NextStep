import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, BarChart2, Users, FileText, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import Layout from '../../components/Layout'
import api from '../../utils/api'

const NAV = [
  { to: '/coordinator',         label: 'Dashboard', icon: LayoutDashboard },
  { to: '/coordinator/reports', label: 'Reports',   icon: BarChart2 },
  { to: '/coordinator/users',   label: 'Users',     icon: Users },
]

export default function CoordDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/admin/stats'),
    ]).then(([a, s]) => setStats({ ...a.data, ...s.data })).finally(() => setLoading(false))
  }, [])

  return (
    <Layout navItems={NAV} title="Coordinator Overview">
      <div className="space-y-6">

        <div className="card p-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
          <p className="text-emerald-100 text-sm mb-1">Overview</p>
          <h2 className="font-display text-2xl font-semibold">GSSS NextStep</h2>
          <p className="text-emerald-100 text-sm mt-1">All departments · Current academic year</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="card p-4 h-24 animate-pulse bg-gray-50" />)}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total LORs',  value: stats?.total || 0,    icon: FileText,    color: 'text-primary bg-primary-soft' },
                { label: 'Pending',     value: stats?.pending || 0,  icon: Clock,       color: 'text-amber-600 bg-amber-50' },
                { label: 'Approved',    value: stats?.approved || 0, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Students',    value: stats?.users?.students || stats?.students || 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
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

            {/* Branch breakdown */}
            {stats?.branchStats && Object.keys(stats.branchStats).length > 0 && (
              <div className="card p-5">
                <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" /> Branch-wise LORs
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.branchStats).slice(0, 6).map(([branch, data]) => (
                    <div key={branch}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">{branch}</span>
                        <span className="text-gray-500">{data.approved}/{data.total}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${data.total ? (data.approved / data.total) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
