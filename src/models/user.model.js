const db = require('../config/database');

class User {
  static async create({ name, username, email, phone, password }) {
    const result = await db.query(
      'INSERT INTO users (name, username, email, phone, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, username, email, phone, balance, created_at',
      [name, username, email, phone, password]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT id, name, username, email, phone, balance, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, { name, username, email, phone, password, balance }) {
    const result = await db.query(
      `UPDATE users SET 
        name = COALESCE($1, name), 
        username = COALESCE($2, username), 
        email = COALESCE($3, email), 
        phone = COALESCE($4, phone), 
        password = COALESCE($5, password), 
        balance = COALESCE($6, balance) 
      WHERE id = $7 
      RETURNING id, name, username, email, phone, balance`,
      [name, username, email, phone, password, balance, id]
    );
    return result.rows[0];
  }

  static async getTransactions(userId) {
    const result = await db.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async getTransactionHistory(userId) {
    const result = await db.query(`
      SELECT t.id, t.user_id, t.item_id, t.quantity, t.total, t.description, t.status, t.created_at, 
      i.name AS item_name, i.price AS item_price
      FROM transactions t
      JOIN items i ON t.item_id = i.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC`, [userId]);
    
    return result.rows;
  }
  static async getTotalSpent(userId) {
    const result = await db.query(`
      SELECT SUM(t.total) AS total_spent
      FROM transactions t
      WHERE t.user_id = $1 AND t.status = 'paid'
    `, [userId]);

    return result.rows[0].total_spent || 0;
  }

  static async updateBalance(id, newBalance) {
    const result = await db.query(
      'UPDATE users SET balance = $1 WHERE id = $2 RETURNING balance',
      [newBalance, id]
    );
    return result.rows[0].balance;
  }
}

module.exports = User;