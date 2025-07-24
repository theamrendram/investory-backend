const { get } = require("../routes/user.route");
const pool = require("../utils/db");
const { successResponse, errorResponse } = require("../utils/response");

const createStockTables = async () => {
  const createQuery = `
  Create table if not exists stocks (
      id serial primary key,
      stock_name varchar(50) not null,  
      period_start Date not null,
      period_end Date not null,
      fiscal_year decimal(5,2),
      fiscal_half decimal(5,2),
      exchange varchar(50),
      current_price decimal(10,2),
      marketcap decimal(10,2),
      roe decimal(5,2),
      high_week_52 decimal(10,2),
      low_week_52 decimal(10,2),
      pe_ratio decimal(10,2),
      dividend_yield decimal(10,2),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

  );`;

  try {
    await pool.query(createQuery);
    console.log("Stocks table created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

const addStock = async (req, res) => {
  const {
    stock_name,
    period_start,
    period_end,
    fiscal_year,
    fiscal_half,
    exchange,
    current_price,
    marketcap,
    roe,
    high_52_week,
    low_52_week,
    pe_ratio,
    dividend_yield,
  } = req.body;

  const existingStockQuery = ` select * from stocks where stock_name = $1;`;
  const insertStockQuery = ` INSERT INTO stocks (
          stock_name,
          period_start,
          period_end,
          fiscal_year,
          fiscal_half,
          exchange,
          current_price,
          marketcap,
          roe,
          high_52_week,
          low_52_week,
          pe_ratio,
          dividend_yield
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning *; `;

  try {
    const existingStock = await pool.query(existingStockQuery, [stock_name]);
    if (existingStockQuery.rows.length > 0) {
      return res.status(200).json(successResponse(res, existingStockQuery.rows[0], "Stock already exists"));
    }
    const result = await pool.query(insertStockQuery, [
      stock_name,
      period_start,
      period_end,
      fiscal_year,
      fiscal_half,
      exchange,
      current_price,
      marketcap,
      roe,
      high_52_week,
      low_52_week,
      pe_ratio,
      dividend_yield,
    ]);
    if (result.rows.length === 0) {
      return res.status(500).json(errorResponse(res, "Failed to create stock", 500));
    }

    console.log("Stock created:", result.rows[0]);
    res.status(201).json(successResponse(res, result.rows[0], "Stock created successfully"));
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

const getAllStock = async (req, res) => {
  const query = ` select * from stocks;`;
  const r = await createStockTables();
  console.log("r", r);
  try {
    const result = await pool.query(query);
    res.status(200).json(successResponse(res, result.rows, "Stocks fetched successfully"));
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

const getStockById = async (req, res) => {
  const { id } = req.params;
  const query = ` select * from stocks where id = $1;`;
  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse(res, "Stock not found", 404));
    }
    res.status(200).json(successResponse(res, result.rows[0], "Stock fetched successfully"));
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

const getStockByInstrumentId = async (req, res) => {
  const { stock_id: insturment_id } = req.params;
  const query = ` select * from stocks where stock_id = $1;`;
  try {
    const result = await pool.query(query, [stock_id]);
    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse(res, "Stock not found for the given instrument id", 404));
    }
    res.status(200).json(successResponse(res, result.rows[0], "Stock fetched successfully"));
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json(errorResponse(res, error.message, 500));
  }
};

createStockTables();

module.exports = {
  addStock,
  getStockById,
  getStockByInstrumentId,
  getAllStock,
  createStockTables,
};
