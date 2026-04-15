const express = require("express");
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
const {
  getDashboardStats,
  getLowStockItems,
} = require("../../controllers/dashboard/dashboardController");

const router = express.Router();

router.get("/stats", isAuthenticated, catchAsync(getDashboardStats));
router.get("/low-stock", isAuthenticated, catchAsync(getLowStockItems));

module.exports = router;