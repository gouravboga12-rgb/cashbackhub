const { Pool, types } = require('pg');

// Parse PostgreSQL BIGINT (20) and NUMERIC (1700) as JS Numbers
types.setTypeParser(20, (val) => (val === null ? 0 : parseInt(val, 10)));
types.setTypeParser(1700, (val) => (val === null ? 0 : parseFloat(val)));

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

let isConnected = false;
let isOffline = false;

// Test initial connection
function probeConnection() {
  pool.query('SELECT current_database(), current_user, version();')
    .then(res => {
      if (res && res.rows && res.rows.length > 0) {
        isConnected = true;
        isOffline = false;
        console.log(`✅ AWS PostgreSQL Connected! DB: ${res.rows[0].current_database}, User: ${res.rows[0].current_user}`);
      }
    })
    .catch(err => {
      isConnected = false;
      isOffline = true;
      console.warn('⚠️ PostgreSQL connection deferred or offline (using fail-fast mode):', err.message);
    });
}

probeConnection();
// Periodic background check if offline
setInterval(() => {
  if (isOffline) {
    probeConnection();
  }
}, 30000).unref();

module.exports = {
  pool,
  isConnected: () => isConnected,
  query: (text, params) => {
    if (isOffline && !isConnected) {
      return Promise.reject(new Error('PostgreSQL is offline (fail-fast)'));
    }
    return pool.query(text, params);
  },
};
