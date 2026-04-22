import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
// import Admin from "../models/admin.model.js"; // adjust path

export const adminRouter = express.Router();

// helper: sign token and set cookie
const sendTokenCookie = (res, admin) => {
  const token = jwt.sign(
    { id: admin._id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("adminToken", token, {
    httpOnly: true,                                   // not accessible via JS
    secure: process.env.NODE_ENV === "production",    // https only in prod
    sameSite: "strict",                               // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,                  // 7 days
  });
};

// Signup
adminRouter.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error("Email and password required");

    const existing = await Admin.findOne({ email });
    if (existing) throw new Error("Admin already exists");

    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ email, password: hashed });

    sendTokenCookie(res, admin);
    res.status(201).json({
      message: "Admin signup successful",
      admin: { id: admin._id, email: admin.email },
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Login
adminRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error("Email and password required");

    const admin = await Admin.findOne({ email });
    if (!admin) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, admin.password);
    if (!match) throw new Error("Invalid credentials");

    sendTokenCookie(res, admin);
    res.status(200).json({
      message: "Admin login successful",
      admin: { id: admin._id, email: admin.email },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Logout
adminRouter.post("/logout", (req, res) => {
  res.clearCookie("adminToken");
  res.status(200).json({ message: "Logged out" });
});