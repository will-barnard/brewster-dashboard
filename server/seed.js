require('dotenv/config');
const bcrypt = require('bcrypt');
const db = require('./db');

async function seed() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@will-barnard.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'changeme123';

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    console.log(`Super admin (${email}) already exists — skipping seed.`);
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  db.prepare(
    'INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)'
  ).run(email, 'Will', hash, 'super_admin');

  console.log(`Super admin created: ${email}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
