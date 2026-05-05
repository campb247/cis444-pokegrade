// postgres connection pool
// env vars loaded by server.js via dotenv before this module runs

const { Pool } = require('pg');
require('dotenv').config();

// pool defaults are fine for course-scale traffic
// no explicit max/idleTimeout, pg defaults apply
const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	// 5432 is postgres default if DB_PORT unset
	port: process.env.DB_PORT || 5432
});

module.exports = pool;
