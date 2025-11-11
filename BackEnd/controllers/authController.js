import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../config/db.js';
import crypto from 'crypto';

// Import OTP utilities
import { generateOTP, sendOTPEmail } from '../utils/emailService.js';

// Helper functions for validation
const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

const validatePassword = (password) => {
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return re.test(password);
};

// GLOBAL OTP STORE
const OTP_EXPIRY_MINUTES = 10;
let otpStore = {}; // { email: { code, expiresAt, type: 'verify' | 'reset' } }

//  REGISTER (New users must verify their email with OTP)
export const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  if (!validateEmail(email))
    return res.status(400).json({ message: "Invalid email format" });

  if (!validatePassword(password))
    return res.status(400).json({
      message: "Password must be at least 8 characters long and include at least 1 letter and 1 number"
    });

  try {
    const db = await connectToDatabase();
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0)
      return res.status(409).json({ message: "User already exists" });

    //  Hash password & store as UNVERIFIED
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users(username, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, role || 'student', 0]
    );

    //  Generate verification OTP
    const otp = generateOTP();
    otpStore[email] = {
      code: otp,
      expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
      type: "verify"
    };

    //  Send OTP email
    await sendOTPEmail(email, otp);

    return res.status(201).json({
      message: "User registered. Please verify your email to continue.",
      userId: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//  VERIFY EMAIL OTP (For new user verification)
export const verifyEmailOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore[email])
    return res.status(400).json({ message: "No OTP sent to this email" });

  if (otpStore[email].type !== "verify")
    return res.status(400).json({ message: "Invalid OTP type" });

  if (Date.now() > otpStore[email].expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (otpStore[email].code !== otp)
    return res.status(400).json({ message: "Incorrect OTP" });

  //  Mark user as verified
  try {
    const db = await connectToDatabase();
    await db.query("UPDATE users SET is_verified = 1 WHERE email = ?", [email]);
    delete otpStore[email];

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

//  LOGIN (Requires email verification)
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = rows[0];

    if (!user.is_verified)
      return res.status(403).json({ message: "Please verify your email before logging in" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//  FORGOT PASSWORD (Send OTP via utils)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const db = await connectToDatabase();
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0)
      return res.status(404).json({ message: "Email not registered" });

    //  generate OTP
    const otp = generateOTP();
    otpStore[email] = {
      code: otp,
      expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
      type: "reset"
    };

    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent to email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//  VERIFY RESET OTP
export const verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore[email])
    return res.status(400).json({ message: "No OTP for this email" });

  if (otpStore[email].type !== "reset")
    return res.status(400).json({ message: "Wrong OTP type" });

  if (Date.now() > otpStore[email].expiresAt)
    return res.status(400).json({ message: "OTP expired" });

  if (otpStore[email].code !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  otpStore[email].verified = true;

  res.json({ message: "OTP verified" });
};

//  RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!otpStore[email] || otpStore[email].verified !== true)
    return res.status(400).json({ message: "OTP verification required" });

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const db = await connectToDatabase();

    await db.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email
    ]);

    delete otpStore[email];
    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//  LOGOUT
export const logout = (req, res) => {
  try {
    res.clearCookie?.("auth_token");
    res.clearCookie?.("guest_id");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
