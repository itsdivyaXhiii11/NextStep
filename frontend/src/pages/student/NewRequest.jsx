import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, List, User, Upload, X } from 'lucide-react'
import Layout from '../../components/Layout'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/student',          label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/student/new',      label: 'New Request', icon: PlusCircle },
  { to: '/student/requests', label: 'My Requests', icon: List },
  { to: '/student/profile',  label: 'Profile',     icon: User },
]

export default function StudentNewRequest() {
  const navigate = useNavigate()
  const [faculty, setFaculty] = useState([])
  const [form, setForm] = useState({
    faculty_id: '', purpose: '', institution_name: '',
    program_name: '', deadline: '', additional_info: '',
  })
  const [sop, setSop] = useState(null)
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    api.get('/profile/faculty').then(r => setFaculty(r.data))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.faculty_id) return toast.error('Please select a faculty member')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v))
      if (sop) fd.append('sop', sop)
      if (resume) fd.append('resume', resume)

      await api.post('/lor', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('LOR request submitted successfully!')
      navigate('/student/requests')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  function FileInput({ label, file, setFile, accept = '.pdf,.doc,.docx' }) {
    return (
      <div>
        <label className="form-label">{label} <span className="text-gray-400 font-normal">(optional)</span></label>
        {file ? (
          <div className="flex items-center gap-2 p-3 bg-primary-soft rounded-xl">
            <Upload size={14} className="text-primary" />
            <span className="text-sm text-primary flex-1 truncate">{file.name}</span>
            <button type="button" onClick={() => setFile(null)} className="text-primary/60 hover:text-primary"><X size={14} /></button>
          </div>
        ) : (
          <label className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary/40 transition-colors group">
            <Upload size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
            <span className="text-sm text-gray-400 group-hover:text-primary transition-colors">Click to upload {label}</span>
            <input type="file" className="hidden" accept={accept} onChange={e => setFile(e.target.files[0])} />
          </label>
        )}
      </div>
    )
  }

  return (
    <Layout navItems={NAV} title="New LOR Request">
      <div className="max-w-xl">
        <p className="text-sm text-gray-500 mb-6">Fill in the details below. Your faculty will be notified immediately.</p>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="form-label">Select Faculty <span className="text-red-400">*</span></label>
            <select className="form-select" value={form.faculty_id} onChange={e => set('faculty_id', e.target.value)} required>
              <option value="">Choose a faculty member…</option>
              {faculty.map(f => (
                <option key={f.id} value={f.id}>{f.name} — {f.designation}, {f.department}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Purpose <span className="text-red-400">*</span></label>
            <select className="form-select" value={form.purpose} onChange={e => set('purpose', e.target.value)} required>
              <option value="">Select purpose…</option>
              <option>Higher Studies Abroad</option>
              <option>Higher Studies in India</option>
              <option>Job / Placement</option>
              <option>Internship</option>
              <option>Research Program</option>
              <option>Scholarship Application</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="form-label">Institution Name</label>
            <input className="form-input" placeholder="e.g. University of Toronto" value={form.institution_name}
              onChange={e => set('institution_name', e.target.value)} />
          </div>

          <div>
            <label className="form-label">Program / Position</label>
            <input className="form-input" placeholder="e.g. M.Tech Computer Science" value={form.program_name}
              onChange={e => set('program_name', e.target.value)} />
          </div>

          <div>
            <label className="form-label">Deadline</label>
            <input type="date" className="form-input" value={form.deadline}
              onChange={e => set('deadline', e.target.value)}
              min={new Date().toISOString().split('T')[0]} />
          </div>

          <div>
            <label className="form-label">Additional Information</label>
            <textarea className="form-input resize-none" rows={3}
              placeholder="Any specific points you'd like your faculty to mention…"
              value={form.additional_info} onChange={e => set('additional_info', e.target.value)} />
          </div>

          <FileInput label="Statement of Purpose (SOP)" file={sop} setFile={setSop} />
          <FileInput label="Resume / CV" file={resume} setFile={setResume} />

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => navigate('/student')} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
