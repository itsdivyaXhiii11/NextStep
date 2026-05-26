const cron = require('node-cron');
const https = require('https');

module.exports = function startCron(supabase, logger) {
  // Keep-alive ping every 14 minutes (prevents Render sleep)
  cron.schedule('*/14 * * * *', () => {
    const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;
    try {
      if (url.startsWith('https')) {
        https.get(`${url}/health`, () => logger.info('Keep-alive ping OK'));
      }
    } catch (e) { /* ignore */ }
  });

  // Daily reminder for pending LORs older than 3 days
  cron.schedule('0 9 * * *', async () => {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const { data: pending } = await supabase
        .from('lor_requests')
        .select('faculty:users!lor_requests_faculty_id_fkey(id, name), id')
        .eq('status', 'pending')
        .lt('created_at', threeDaysAgo);

      if (pending?.length > 0) {
        logger.info(`${pending.length} pending LOR(s) older than 3 days`);
      }
    } catch (err) {
      logger.error('Cron reminder error', { err: err.message });
    }
  });
};
