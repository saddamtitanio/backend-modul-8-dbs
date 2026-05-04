const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');

// Report endpoints (not yet implemented)
router.get('/top-users', ReportController.getTopUsers);
router.get('/items-sold', ReportController.getItemsSold);
router.get('/monthly-sales', ReportController.getMonthlySales);

module.exports = router;