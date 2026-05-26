const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  const { data, error } = await req.supabase
    .from('notifications')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.patch('/:id/read', authMiddleware, async (req, res) => {
  await req.supabase.from('notifications').update({ read: true }).eq('id', req.params.id).eq('user_id', req.user.id);
  res.json({ message: 'Marked as read' });
});

router.patch('/read-all', authMiddleware, async (req, res) => {
  await req.supabase.from('notifications').update({ read: true }).eq('user_id', req.user.id);
  res.json({ message: 'All marked as read' });
});

module.exports = router;
