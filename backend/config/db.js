// postgres connection pool
// env vars are loaded locally from .env and in AWS Lambda from Lambda environment variables

const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT || 5432,
	ssl: isProduction
		? {
				rejectUnauthorized: false
			}
		: false
});

module.exports = pool;