const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.query(`SET search_path TO public`).catch(err => {
  console.error('Erro ao definir search_path:', err);
});

module.exports = db;
