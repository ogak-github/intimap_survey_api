import { Pool } from "pg";

const pool = new Pool({
  user: "<Postgres user>",
  host: "<host>",
  database: "<Database>",
  password: "<PASSWORD>",
  port: 5432, // or the port you are using for PostgreSQL
});

export default pool;
