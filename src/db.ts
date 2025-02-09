import { Pool } from "pg";

import dotenv from "dotenv";

dotenv.config();

console.log(process.env.POSTGRES_USER);

const pool = new Pool({
  user:  process.env.POSTGRES_USER,
  host:  process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD ,
  port: 5432, // Default to 5432
});

export default pool;
