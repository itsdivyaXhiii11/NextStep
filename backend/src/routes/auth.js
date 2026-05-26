const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { createClient } = require('@supabase/supabase-js');
const { authMiddleware } = require('../middleware/auth');

// Register
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('name').notEmpty(),
  body('role').isIn(['student', 'faculty', 'coordinator', 'admin']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { email, password, name, role, usn, branch, batch, designation, department, phone } = req.body;
  const sb = req.supabase;

  try {
    // Create auth user
    const { data: authData, error: authError } = await sb.auth.admin.createUser({
      email, password, email_confirm: true
    });
    if (authError) return res.status(400).json({ error: authError.message });

    // Insert profile
    const { error: profileError } = await sb.from('users').insert({
      id: authData.user.id,
      email, name, role,
      usn: usn || null,
      branch: branch || null,
      batch: batch ? parseInt(batch) : null,
      designation: designation || null,
      department: department || null,
      phone: phone || null,
      status: 'active'
    });

    if (profileError) {
      await sb.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ error: profileError.message });
    }

    res.status(201).json({ message: 'Registration successful. You can now log in.' });
  } catch (err) {
    req.logger.error('Register error', { err: err.message });
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { email, password } = req.body;

  try {
    // Use anon key for login
    const anonClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: 'Invalid email or password' });

    // Get profile
    const { data: profile } = await req.supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile) return res.status(401).json({ error: 'Profile not found' });
    if (profile.status === 'deactivated') return res.status(403).json({ error: 'Account deactivated. Contact admin.' });

    // Update last_login
    await req.supabase.from('users').update({ last_login: new Date() }).eq('id', data.user.id);

    res.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: { id: profile.id, name: profile.name, email: profile.email, role: profile.role, ...profile }
    });
  } catch (err) {
    req.logger.error('Login error', { err: err.message });
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Refresh token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const anonClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await anonClient.auth.refreshSession({ refresh_token: refreshToken });
    if (error) return res.status(401).json({ error: 'Session expired' });
    res.json({ token: data.session.access_token, refreshToken: data.session.refresh_token });
  } catch (err) {
    res.status(500).json({ error: 'Refresh failed' });
  }
});

module.exports = router;
