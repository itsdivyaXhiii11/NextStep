const router = require('express').Router();
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get all users
router.get('/users', authMiddleware, requireRole('admin', 'coordinator'), async (req, res) => {
  const { role, status, page = 1, limit = 30 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = req.supabase.from('users').select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (role) query = query.eq('role', role);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ users: data, total: count });
});

// Activate / deactivate user
router.patch('/users/:id/status', authMiddleware, requireRole('admin'), async (req, res) => {
  const { status } = req.body;
  if (!['active', 'deactivated', 'readonly'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const { data, error } = await req.supabase.from('users').update({ status }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'User status updated', user: data });
});

// Change user role
router.patch('/users/:id/role', authMiddleware, requireRole('admin'), async (req, res) => {
  const { role } = req.body;
  if (!['student', 'faculty', 'coordinator', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

  const { data, error } = await req.supabase.from('users').update({ role }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Role updated', user: data });
});

// System stats
router.get('/stats', authMiddleware, requireRole('admin', 'coordinator'), async (req, res) => {
  const sb = req.supabase;
  const [users, lors] = await Promise.all([
    sb.from('users').select('role, status'),
    sb.from('lor_requests').select('status, created_at')
  ]);

  const thisMonth = new Date();
  thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);

  res.json({
    users: {
      total: users.data?.length || 0,
      students: users.data?.filter(u => u.role === 'student').length || 0,
      faculty: users.data?.filter(u => u.role === 'faculty').length || 0,
      active: users.data?.filter(u => u.status === 'active').length || 0,
    },
    lors: {
      total: lors.data?.length || 0,
      pending: lors.data?.filter(l => l.status === 'pending').length || 0,
      approved: lors.data?.filter(l => l.status === 'approved').length || 0,
      thisMonth: lors.data?.filter(l => new Date(l.created_at) >= thisMonth).length || 0,
    }
  });
});

module.exports = router;
