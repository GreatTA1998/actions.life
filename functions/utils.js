function getRandomID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let autoId = '';
  for (let i = 0; i < 20; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return autoId;
}

function getPeriodFromCrontab (crontab)  {
  if (crontab === '') return 'quick';
  const parts = crontab.split(' ');
  if (parts.length !== 5) throw new Error('Invalid crontab format', crontab, parts);
  if(crontab === '0 0 * * ') return 'broken';
  if(crontab === '0 0 * * 0') return 'pre-weekly';
  if(crontab === '0 0 0 0 *') return 'pre-yearly';
  if(crontab === '0 0 0 * *') return 'pre-monthly';
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  if (dayOfMonth !== '*' && month !== '*' && dayOfWeek === '*') return 'yearly';
  if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') return 'monthly';
  if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') return 'weekly';
  functions.logger.info('Invalid crontab format', crontab);
  return 'unknown';
}

exports.getRandomID = getRandomID;
exports.getPeriodFromCrontab = getPeriodFromCrontab;