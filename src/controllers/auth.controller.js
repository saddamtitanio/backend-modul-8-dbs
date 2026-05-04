const UserService = require('../services/user.service');
const jwt = require('jsonwebtoken');

class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);

      const token = jwt.sign(
        { userId: result.user.id, 
          email: result.user.email
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '24h'
        }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        payload: {
          user: result.user,
          token
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;