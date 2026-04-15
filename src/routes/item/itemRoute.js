const express = require("express");
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
const {
  createItem,
  getMyItems,
  updateItem,
  deleteItem,
  sendLowStockAlert,
} = require("../../controllers/item/itemController");

const router = express.Router();

router.post("/create", isAuthenticated, catchAsync(createItem));
router.get("/my-items", isAuthenticated, catchAsync(getMyItems));
router.patch("/update/:id", isAuthenticated, catchAsync(updateItem));
router.delete("/delete/:id", isAuthenticated, catchAsync(deleteItem));
router.post("/send-low-stock-alert/:id", isAuthenticated, catchAsync(sendLowStockAlert));

module.exports = router;