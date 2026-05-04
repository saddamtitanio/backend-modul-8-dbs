
const db = require('../config/database');

class ReportController {
  static async getTopUsers(req, res, next) {
    try {
      // GET /reports/top-users?limit=10
      // Query: rank users by total spending (use window function RANK())
      const { limit = 10 } = req.query;

      const query = `
        SELECT u.id, u.name, u.email,SUM(t.total) AS total_spent,
        RANK() OVER (ORDER BY SUM(t.total) DESC) AS rank
        FROM 
        users u
        JOIN transactions t ON u.id = t.user_id
        GROUP BY u.id
        ORDER BY total_spent DESC
        LIMIT $1
      `;

      const result = await db.query(query, [limit]);

      res.status(200).json({
        success: true,
        message: 'Top users retrieved successfully',
        payload: result.rows,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getItemsSold(req, res, next) {
    try {
      // GET /reports/items-sold
      // Query: total quantity sold and total revenue per item (use JOIN and SUM)
      const query = `
        SELECT i.id, i.name, SUM(t.quantity) AS total_quantity_sold,
        SUM(t.total) AS total_revenue
        FROM items i
        JOIN transactions t ON i.id = t.item_id
        WHERE t.status = 'paid'
        GROUP BY i.id
        ORDER BY total_revenue DESC
      `;

      const result = await db.query(query);

      res.status(200).json({
        success: true,
        message: 'Items sold report retrieved successfully',
        payload: result.rows,
      });
    } catch (error) {
      next(error);
    }
  }

  // 3. Get Monthly Sales Summary (using date_trunc and GROUP BY)
  static async getMonthlySales(req, res, next) {
    try {
      // GET /reports/monthly-sales?year=2026
      // Query: monthly sales summary (use date_trunc and GROUP BY)
      const { year = new Date().getFullYear() } = req.query;

      const query = `
        SELECT date_trunc('month', t.created_at) AS month, 
        SUM(t.total) AS total_sales
        FROM transactions t
        WHERE EXTRACT(YEAR FROM t.created_at) = $1
        GROUP BY month
        ORDER BY month
      `;

      const result = await db.query(query, [year]);

      res.status(200).json({
        success: true,
        message: 'Monthly sales summary retrieved successfully',
        payload: result.rows,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;