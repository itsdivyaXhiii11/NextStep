const router = require('express').Router();
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/dashboard', authMiddleware, async (req, res) => {
  const sb = req.supabase;
  const role = req.user.role;

  try {
    if (role === 'student') {
      const { data: requests } = await sb.from('lor_requests').select('status, created_at, institution_name').eq('student_id', req.user.id);
      return res.json({
        total: requests?.length || 0,
        pending: requests?.filter(r => r.status === 'pending').length || 0,
        approved: requests?.filter(r => r.status === 'approved').length || 0,
        rejected: requests?.filter(r => r.status === 'rejected').length || 0,
        requests: requests || []
      });
    }

    if (role === 'faculty') {
      const { data: requests } = await sb.from('lor_requests').select('status, created_at, purpose').eq('faculty_id', req.user.id);
      return res.json({
        total: requests?.length || 0,
        pending: requests?.filter(r => r.status === 'pending').length || 0,
        approved: requests?.filter(r => r.status === 'approved').length || 0,
        rejected: requests?.filter(r => r.status === 'rejected').length || 0,
        requests: requests || []
      });
    }

    // Coordinator / Admin - full stats
    const { data: allRequests } = await sb.from('lor_requests').select('status, created_at, purpose, student:users!lor_requests_student_id_fkey(branch)');
    const { data: userCounts } = await sb.from('users').select('role');

    const branchStats = {};
    allRequests?.forEach(r => {
      const branch = r.student?.branch || 'Unknown';
      if (!branchStats[branch]) branchStats[branch] = { total: 0, approved: 0 };
      branchStats[branch].total++;
      if (r.status === 'approved') branchStats[branch].approved++;
    });

    res.json({
      total: allRequests?.length || 0,
      pending: allRequests?.filter(r => r.status === 'pending').length || 0,
      approved: allRequests?.filter(r => r.status === 'approved').length || 0,
      rejected: allRequests?.filter(r => r.status === 'rejected').length || 0,
      students: userCounts?.filter(u => u.role === 'student').length || 0,
      faculty: userCounts?.filter(u => u.role === 'faculty').length || 0,
      branchStats,
      recentRequests: allRequests?.slice(0, 10) || []
    });
  } catch (err) {
    req.logger.error('Analytics error', { err: err.message });
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
