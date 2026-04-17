const express = require("express");
const { registerUser,verifyEmailOTP,resendOTP,loginUser,logoutUser,getMe,forgotPassword,verifyForgotPasswordOTP,resetPassword} = require("../../controllers/auth/authController");
const catchAsync = require("../../services/catchAsync");

const router = express.Router();

router.post("/register", catchAsync(registerUser));
router.post("/verify-otp", catchAsync(verifyEmailOTP));
router.post("/resend-otp", catchAsync(resendOTP));
router.post("/login", catchAsync(loginUser));
router.post("/logout", catchAsync(logoutUser));
router.get("/me", catchAsync(getMe));
router.post("/forgot-password", catchAsync(forgotPassword));
router.post("/verify-forgot-password-otp", catchAsync(verifyForgotPasswordOTP));
router.post("/reset-password", catchAsync(resetPassword));

module.exports = router;