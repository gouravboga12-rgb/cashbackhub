const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'perkfy_db',
  user: process.env.DB_USER || 'perkfy_admin',
  password: process.env.DB_PASSWORD || 'PerkfySecure2026!',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Test initial connection
pool.query('SELECT current_database(), current_user, version();')
  .then(res => {
    if (res && res.rows && res.rows.length > 0) {
      console.log(`✅ AWS PostgreSQL Connected! DB: ${res.rows[0].current_database}, User: ${res.rows[0].current_user}`);
    }
  })
  .catch(err => {
    console.warn('⚠️ PostgreSQL connection deferred or offline:', err.message);
  });

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
