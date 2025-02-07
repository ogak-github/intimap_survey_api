import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "192.168.0.138",
  database: "merauke",
  password: "1GW0cUMyOLwotZhWLd4bK",
  port: 5433, // or the port you are using for PostgreSQL
});

export default pool;
