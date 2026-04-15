const express = require("express");
const { registerUser,loginUser } = require("../../controllers/auth/authController");
const catchAsync = require("../../services/catchAsync");

const router = express.Router();

router.post("/register", catchAsync(registerUser));
router.post("/login", catchAsync(loginUser));

module.exports = router;