require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const winston = require('winston');

// Logger
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

// Validate env
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  logger.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Supabase admin client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
logger.info('Supabase connected successfully');

// Attach supabase + logger to every request
app.use((req, res, next) => {
  req.supabase = supabase;
  req.logger = logger;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lor', require('./routes/lor'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

// Health check + keep-alive
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Start cron
require('./services/cronService')(supabase, logger);
logger.info('Cron jobs started');

app.listen(PORT, () => logger.info(`NextStep API running on port ${PORT}`));
