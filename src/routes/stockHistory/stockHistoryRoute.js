const express = require("express");
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
const {
  getMyStockHistory,
} = require("../../controllers/stockHistory/stockHistoryController");

const router = express.Router();

router.get("/my-history", isAuthenticated, catchAsync(getMyStockHistory));

module.exports = router;