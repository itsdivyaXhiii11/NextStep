import { useEffect, useState } from 'react'
import { LayoutDashboard, List, User, CheckCircle, XCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import Layout from '../../components/Layout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/faculty',          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/faculty/requests', label: 'Requests',  icon: List },
  { to: '/faculty/profile',  label: 'Profile',   icon: User },
]

export default function FacultyRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [expanded, setExpanded] = useState(null)
  const [remarks, setRemarks] = useState({})
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get('/lor' + (filter ? `?status=${filter}` : ''))
      .then(r => setRequests(r.data.requests || []))
      .finally(() => setLoading(false))
  }, [filter])

  async function decide(id, decision) {
    setProcessing(id + decision)
    try {
      await api.patch(`/lor/${id}/decision`, { decision, remarks: remarks[id] || '' })
      toast.success(`LOR ${decision} successfully`)
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <Layout navItems={NAV} title="LOR Requests">
      <div className="space-y-4">
        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            { val: 'pending', label: 'Pending' },
            { val: 'approved', label: 'Approved' },
            { val: 'rejected', label: 'Rejected' },
            { val: '', label: 'All' },
          ].map(f => (
            <button key={f.val} onClick={() => setFilter(f.val)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all
                ${filter === f.val ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:border-primary/50'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card p-4 h-24 animate-pulse bg-gray-50" />)}</div>
        ) : requests.length === 0 ? (
          <div className="card p-10 text-center text-gray-400 text-sm">No {filter} requests</div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="card overflow-hidden">
                {/* Header */}
                <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={req.status === 'pending' ? 'badge-pending' : req.status === 'approved' ? 'badge-approved' : 'badge-rejected'}>
                          {req.status}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{req.student?.name || 'Student'}</p>
                      <p className="text-xs text-gray-500">{req.student?.usn} · {req.student?.branch} · Batch {req.student?.batch}</p>
                    </div>
                    {expanded === req.id ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                  </div>
                </div>

                {/* Expanded */}
                {expanded === req.id && (
                  <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-3 bg-gray-50/50">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        { label: 'Purpose', value: req.purpose },
                        { label: 'Institution', value: req.institution_name || '—' },
                        { label: 'Program', value: req.program_name || '—' },
                        { label: 'Deadline', value: req.deadline ? new Date(req.deadline).toLocaleDateString('en-IN') : '—' },
                      ].map(f => (
                        <div key={f.label}>
                          <p className="text-xs text-gray-400">{f.label}</p>
                          <p className="font-medium text-gray-800">{f.value}</p>
                        </div>
                      ))}
                    </div>

                    {req.additional_info && (
                      <div className="bg-white rounded-xl p-3 text-sm text-gray-600 border border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">Additional notes</p>
                        {req.additional_info}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {req.sop_url && (
                        <a href={req.sop_url} target="_blank" rel="noreferrer"
                          className="text-xs flex items-center gap-1 text-primary bg-primary-soft px-3 py-1.5 rounded-lg">
                          <ExternalLink size={11} /> SOP
                        </a>
                      )}
                      {req.resume_url && (
                        <a href={req.resume_url} target="_blank" rel="noreferrer"
                          className="text-xs flex items-center gap-1 text-primary bg-primary-soft px-3 py-1.5 rounded-lg">
                          <ExternalLink size={11} /> Resume
                        </a>
                      )}
                    </div>

                    {req.status === 'pending' && (
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Remarks (optional)</label>
                          <textarea className="form-input text-sm resize-none" rows={2}
                            placeholder="Add remarks for the student…"
                            value={remarks[req.id] || ''}
                            onChange={e => setRemarks(p => ({ ...p, [req.id]: e.target.value }))} />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => decide(req.id, 'rejected')}
                            disabled={!!processing}
                            className="btn-danger flex-1 flex items-center justify-center gap-1.5 py-2 text-sm">
                            <XCircle size={14} />
                            {processing === req.id + 'rejected' ? 'Processing…' : 'Reject'}
                          </button>
                          <button onClick={() => decide(req.id, 'approved')}
                            disabled={!!processing}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors">
                            <CheckCircle size={14} />
                            {processing === req.id + 'approved' ? 'Generating PDF…' : 'Approve & Generate LOR'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
