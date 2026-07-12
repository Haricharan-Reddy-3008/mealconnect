import Admin from "../models/Admin.js";

// Admin privileges are stored separately from public account roles. Never use
// a client supplied role to authorize moderation actions.
export const requireAdmin = (permission) => async (req, res, next) => {
  const admin = await Admin.findOne({ userId: req.user?._id });
  const permitted = !permission || (Array.isArray(permission)
    ? permission.some((item) => admin?.[item])
    : admin?.[permission]);
  if (!admin || !permitted) {
    return res.status(403).json({ success: false, message: "Admin permission required" });
  }
  req.admin = admin;
  next();
};
