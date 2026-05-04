const TransactionService = require('../services/transaction.service');
const redis = require('../database/redis');

class TransactionController {
  static async createTransaction(req, res, next) {
    try {
      const { user_id, item_id, quantity, description } = req.body;

      const transaction = await TransactionService.createTransaction({ user_id, item_id, quantity, description });

      const redisMessage = {
        userId: String(user_id),
        itemId: String(item_id),
        total: String(transaction.total || 0)
      };

      await redis.xadd(
        'transaction-logs',
        '*',
        ...Object.entries(redisMessage).flat()
      );

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        payload: transaction,
      });

    } catch (error) {
      next(error);
    }
  }

  static async getTransactionById(req, res, next) {
    try {
      const { id } = req.params;
      const transaction = await TransactionService.getTransactionById(id);
      res.status(200).json({
        success: true,
        message: 'Transaction retrieved successfully',
        payload: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async payTransaction(req, res, next) {
    try {
      const { id } = req.params;
      // No user authentication, just update status to paid
      const result = await TransactionService.payTransaction(id);
      res.status(200).json({
        success: true,
        message: 'Payment successful',
        payload: {
          transaction_id: id,
          status: 'paid',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTransaction(req, res, next) {
    try {
      const { id } = req.params;
      await TransactionService.deleteTransaction(id);
      res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully',
        payload: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TransactionController;