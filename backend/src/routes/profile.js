const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');

// Get own profile
router.get('/', authMiddleware, async (req, res) => {
  const { data, error } = await req.supabase.from('users').select('*').eq('id', req.user.id).single();
  if (error) return res.status(404).json({ error: 'Profile not found' });
  res.json(data);
});

// Update own profile
router.patch('/', authMiddleware, async (req, res) => {
  const { name, phone, designation, department, branch } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (designation) updates.designation = designation;
  if (department) updates.department = department;
  if (branch) updates.branch = branch;
  updates.updated_at = new Date();

  const { data, error } = await req.supabase.from('users').update(updates).eq('id', req.user.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Profile updated', user: data });
});

// Get faculty list (for student dropdown)
router.get('/faculty', authMiddleware, async (req, res) => {
  const { data, error } = await req.supabase
    .from('users')
    .select('id, name, email, designation, department')
    .eq('role', 'faculty')
    .eq('status', 'active')
    .order('name');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
