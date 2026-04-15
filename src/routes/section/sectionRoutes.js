const express = require("express");
const isAuthenticated = require("../../middleware/isAuthenticated");
const catchAsync = require("../../services/catchAsync");

const {
  createSection,
  getMySections,
  updateSection,
  deleteSection,
} = require("../../controllers/section/sectionController");

const router = express.Router();

router.post("/create", isAuthenticated, catchAsync(createSection));
router.get("/my-sections", isAuthenticated, catchAsync(getMySections));
router.patch("/update/:id", isAuthenticated, catchAsync(updateSection));
router.delete("/delete/:id", isAuthenticated, catchAsync(deleteSection));

module.exports = router;