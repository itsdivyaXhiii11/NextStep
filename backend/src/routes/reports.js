const router = require('express').Router();
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/export', authMiddleware, requireRole('coordinator', 'admin'), async (req, res) => {
  const sb = req.supabase;
  const { branch, status, from, to } = req.query;

  try {
    let query = sb.from('lor_requests').select(
      `id, status, purpose, institution_name, program_name, deadline, created_at, approved_at, pdf_url,
       placement_status, company_name, package_lpa,
       student:users!lor_requests_student_id_fkey(name,email,usn,branch,batch),
       faculty:users!lor_requests_faculty_id_fkey(name,email,designation,department)`
    ).order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    let filtered = data;
    if (branch) filtered = data.filter(r => r.student?.branch === branch);

    res.json({ count: filtered.length, data: filtered });
  } catch (err) {
    req.logger.error('Report export error', { err: err.message });
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
