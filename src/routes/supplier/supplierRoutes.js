const express = require("express");
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");
const {
  createSupplier,
  getMySuppliers,
  updateSupplier,
  deleteSupplier,
} = require("../../controllers/supplier/supplierController");

const router = express.Router();

router.post("/create", isAuthenticated, catchAsync(createSupplier));
router.get("/my-suppliers", isAuthenticated, catchAsync(getMySuppliers));
router.patch("/update/:id", isAuthenticated, catchAsync(updateSupplier));
router.delete("/delete/:id", isAuthenticated, catchAsync(deleteSupplier));

module.exports = router;