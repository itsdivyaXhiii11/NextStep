const router = require('express').Router();
const multer = require('multer');
const { authMiddleware, requireRole } = require('../middleware/auth');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Student: submit new LOR request
router.post('/', authMiddleware, requireRole('student'), upload.fields([
  { name: 'sop', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  const { faculty_id, purpose, institution_name, program_name, deadline, additional_info } = req.body;
  const sb = req.supabase;

  try {
    let sop_url = null, resume_url = null;

    if (req.files?.sop) {
      const file = req.files.sop[0];
      const path = `sops/${req.user.id}/${Date.now()}_${file.originalname}`;
      await sb.storage.from('nextstep-files').upload(path, file.buffer, { contentType: file.mimetype });
      const { data } = sb.storage.from('nextstep-files').getPublicUrl(path);
      sop_url = data.publicUrl;
    }

    if (req.files?.resume) {
      const file = req.files.resume[0];
      const path = `resumes/${req.user.id}/${Date.now()}_${file.originalname}`;
      await sb.storage.from('nextstep-files').upload(path, file.buffer, { contentType: file.mimetype });
      const { data } = sb.storage.from('nextstep-files').getPublicUrl(path);
      resume_url = data.publicUrl;
    }

    const { data: lor, error } = await sb.from('lor_requests').insert({
      student_id: req.user.id,
      faculty_id,
      purpose,
      institution_name,
      program_name,
      deadline: deadline || null,
      additional_info: additional_info || null,
      sop_url,
      resume_url,
      status: 'pending'
    }).select().single();

    if (error) return res.status(400).json({ error: error.message });

    // Notify faculty
    const { data: faculty } = await sb.from('users').select('email, name').eq('id', faculty_id).single();
    const { data: student } = await sb.from('users').select('name, usn, branch').eq('id', req.user.id).single();

    if (faculty?.email) {
      await emailService.sendLORRequest(faculty.email, faculty.name, student, lor);
    }

    res.status(201).json({ message: 'LOR request submitted successfully', lor });
  } catch (err) {
    req.logger.error('LOR submit error', { err: err.message });
    res.status(500).json({ error: 'Failed to submit LOR request' });
  }
});

// Get LOR requests (role-based)
router.get('/', authMiddleware, async (req, res) => {
  const sb = req.supabase;
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let query = sb.from('lor_requests')
      .select(`*, student:users!lor_requests_student_id_fkey(name,email,usn,branch,batch), faculty:users!lor_requests_faculty_id_fkey(name,email,designation,department)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (req.user.role === 'student') query = query.eq('student_id', req.user.id);
    else if (req.user.role === 'faculty') query = query.eq('faculty_id', req.user.id);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });

    res.json({ requests: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch LOR requests' });
  }
});

// Get single LOR
router.get('/:id', authMiddleware, async (req, res) => {
  const { data, error } = await req.supabase.from('lor_requests')
    .select(`*, student:users!lor_requests_student_id_fkey(*), faculty:users!lor_requests_faculty_id_fkey(name,email,designation,department)`)
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'LOR request not found' });
  res.json(data);
});

// Faculty: approve or reject
router.patch('/:id/decision', authMiddleware, requireRole('faculty', 'coordinator', 'admin'), async (req, res) => {
  const { decision, remarks } = req.body;
  if (!['approved', 'rejected'].includes(decision)) return res.status(400).json({ error: 'Invalid decision' });

  const sb = req.supabase;

  try {
    const updates = {
      status: decision,
      faculty_remarks: remarks || null,
      decision_at: new Date()
    };

    if (decision === 'approved') updates.approved_at = new Date();

    const { data: lor, error } = await sb.from('lor_requests')
      .update(updates)
      .eq('id', req.params.id)
      .select(`*, student:users!lor_requests_student_id_fkey(*), faculty:users!lor_requests_faculty_id_fkey(*)`)
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Generate PDF if approved
    if (decision === 'approved') {
      try {
        const pdfBuffer = await pdfService.generateLOR(lor);
        const path = `lors/${lor.id}/lor_${Date.now()}.pdf`;
        await sb.storage.from('nextstep-files').upload(path, pdfBuffer, { contentType: 'application/pdf' });
        const { data: urlData } = sb.storage.from('nextstep-files').getPublicUrl(path);

        await sb.from('lor_requests').update({ pdf_url: urlData.publicUrl }).eq('id', lor.id);
        lor.pdf_url = urlData.publicUrl;

        // Email student
        if (lor.student?.email) {
          await emailService.sendLORApproved(lor.student.email, lor.student.name, lor, urlData.publicUrl);
        }
      } catch (pdfErr) {
        req.logger.error('PDF generation error', { err: pdfErr.message });
      }
    } else {
      // Email student about rejection
      if (lor.student?.email) {
        await emailService.sendLORRejected(lor.student.email, lor.student.name, lor, remarks);
      }
    }

    res.json({ message: `LOR ${decision} successfully`, lor });
  } catch (err) {
    req.logger.error('Decision error', { err: err.message });
    res.status(500).json({ error: 'Failed to process decision' });
  }
});

// Student: update placement outcome
router.patch('/:id/outcome', authMiddleware, requireRole('student'), async (req, res) => {
  const { placement_status, company_name, offer_type, package_lpa, program_admitted } = req.body;
  const { data, error } = await req.supabase.from('lor_requests')
    .update({ placement_status, company_name, offer_type, package_lpa, program_admitted, outcome_updated_at: new Date() })
    .eq('id', req.params.id)
    .eq('student_id', req.user.id)
    .select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Outcome updated', data });
});

// Download PDF
router.get('/:id/download', authMiddleware, async (req, res) => {
  const { data } = await req.supabase.from('lor_requests').select('pdf_url, status').eq('id', req.params.id).single();
  if (!data?.pdf_url) return res.status(404).json({ error: 'PDF not available' });
  res.json({ url: data.pdf_url });
});

module.exports = router;
