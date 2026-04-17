const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const sendEmail = require("../../services/sendEmail");

const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*()+-])[A-Za-z\d@#$%&*()+-]{9,}$/;

  return passwordRegex.test(password);
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerUser = async (req, res) => {
  const { businessName, adminName, email, password, confirmPassword } =
    req.body;

  if (!businessName || !adminName || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 9 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Business email is already registered",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 8);
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  const newUser = await User.create({
    businessName,
    adminName,
    email,
    password: hashedPassword,
    isEmailVerified: false,
    otp,
    otpExpires,
  });

  try {
    await sendEmail({
      to: email,
      subject: "Verify your SmartStock business email",
      text: `Your SmartStock OTP is ${otp}. It will expire in 5 minutes.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "User registered, but failed to send OTP email. Please try resend OTP.",
    });
  }

  return res.status(201).json({
    success: true,
    message: "Registration successful. OTP sent to your business email.",
    email: newUser.email,
  });
};

const verifyEmailOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: "Email is already verified",
    });
  }

  if (!user.otp || !user.otpExpires) {
    return res.status(400).json({
      success: false,
      message: "No OTP found for this email",
    });
  }

  if (user.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  if (new Date() > new Date(user.otpExpires)) {
    return res.status(400).json({
      success: false,
      message: "OTP has expired",
    });
  }

  user.isEmailVerified = true;
  user.otp = null;
  user.otpExpires = null;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Email verified successfully. You can now login.",
  });
};

const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: "Email is already verified",
    });
  }

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  user.otp = otp;
  user.otpExpires = otpExpires;

  await user.save();

  try {
    await sendEmail({
      to: email,
      subject: "Your new SmartStock OTP",
      text: `Your new SmartStock OTP is ${otp}. It will expire in 5 minutes.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP email",
    });
  }

  return res.status(200).json({
    success: true,
    message: "OTP resent successfully",
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Business email and password are required",
    });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid business email or password",
    });
  }

  if (!user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your business email before logging in",
    });
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    return res.status(401).json({
      success: false,
      message: "Invalid business email or password",
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: user.id,
      businessName: user.businessName,
      adminName: user.adminName,
      email: user.email,
      role: user.role,
    },
  });
};

const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      businessName: req.user.businessName,
      adminName: req.user.adminName,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Business email is required",
    });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (!user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your business email first",
    });
  }

  const resetOtp = generateOTP();
  const resetOtpExpires = new Date(Date.now() + 5 * 60 * 1000);

  user.resetOtp = resetOtp;
  user.resetOtpExpires = resetOtpExpires;
  await user.save();

  try {
    await sendEmail({
      to: email,
      subject: "SmartStock Password Reset OTP",
      text: `Your SmartStock password reset OTP is ${resetOtp}. It will expire in 5 minutes.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send password reset OTP email",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Password reset OTP sent to your business email",
  });
};

const verifyForgotPasswordOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (!user.resetOtp || !user.resetOtpExpires) {
    return res.status(400).json({
      success: false,
      message: "No password reset OTP found",
    });
  }

  if (user.resetOtp !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  if (new Date() > new Date(user.resetOtpExpires)) {
    return res.status(400).json({
      success: false,
      message: "OTP has expired",
    });
  }

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully. You can now reset your password.",
  });
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  if (!email || !otp || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 9 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (!user.resetOtp || !user.resetOtpExpires) {
    return res.status(400).json({
      success: false,
      message: "No password reset OTP found",
    });
  }

  if (user.resetOtp !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  if (new Date() > new Date(user.resetOtpExpires)) {
    return res.status(400).json({
      success: false,
      message: "OTP has expired",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetOtp = null;
  user.resetOtpExpires = null;

  await user.save();

  return res.status(200).json({
    success: true,
    message:
      "Password reset successfully. You can now login with your new password.",
  });
};
module.exports = {
  registerUser,
  verifyEmailOTP,
  resendOTP,
  loginUser,
  logoutUser,
  getMe,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword,
};
