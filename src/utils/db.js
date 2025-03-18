const pg = require("pg");
const { Pool } = pg;

console.log(
  process.env.DB_USER,
  process.env.DB_HOST,
  process.env.DB_DATABASE,
  process.env.DB_PASSWORD
);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

const connectDB = () => {
  pool.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err);
    } else {
      
      console.log("Connected to the database...");
    }
  });
};
module.exports = connectDB;
