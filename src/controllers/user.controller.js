const UserService = require('../services/user.service');
const { AppError } = require('../middleware/errorHandler');
const redis = require('../database/redis');

class UserController {
  static async register(req, res, next) {
    try {
      const { name, username, email, phone, password } = req.body;
      const user = await UserService.register({ name, username, email, phone, password });
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      console.log(email);
      console.log(password);
      const result = await UserService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        payload: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { name, username, email, phone, password, balance } = req.body;
      const userId = req.query.user_id;
      const updatedUser = await UserService.updateProfile(userId, { name, username, email, phone, password, balance });
      await redis.del(`user:${email}`);
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        payload: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionHistory(req, res, next) {
    try {
      // For simplicity, use user_id from query param (insecure)
      const userId = req.query.user_id || 1;
      const history = await UserService.getTransactionHistory(userId);
      res.status(200).json({
        success: true,
        message: 'Transaction history retrieved',
        payload: history,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTotalSpent(req, res, next) {
    try {
      const userId = req.query.user_id || 1;
      const totalSpent = await UserService.getTotalSpent(userId);
      res.status(200).json({
        success: true,
        message: 'Total spent retrieved',
        payload: { total_spent: totalSpent },
      });
    } catch (error) {
      next(error);
    }
  };

  static async getUserByEmail(req, res, next) {
    try {
      const { email } = req.params;
      const keyTarget = `user:${email}`;
      const keyRes = await redis.keys(keyTarget);
      console.log(keyRes);
      if (keyRes.length === 0) {
        console.log("TRUE");
        const user = await UserService.getUserByEmail(email);
        if (!user) {
          throw new AppError('User not found', 404);
        }

        await redis.set(
          keyTarget,
          JSON.stringify(user),
          "EX",
          60
        );
        
        return res.status(200).json({
          success: true,
          message: 'User data retrieved from database',
          payload: user,
        });

      }
      const chachedData = await redis.get(keyTarget);
      const userData = JSON.parse(chachedData);
      res.status(200).json({
        success: true,
        message: 'User data retrieved from cache',
        payload: userData,
      });

    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;