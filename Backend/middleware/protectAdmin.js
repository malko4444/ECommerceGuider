import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";


export const protectAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.adminToken;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) return res.status(401).json({ error: "Admin not found" });

    req.admin = admin; // available in protected routes
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};