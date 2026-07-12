import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

// Check if user is email verified
export const checkEmailVerified = async (req, res, next) => {
  // Kept as a compatibility middleware; email confirmation is not required.
  next();
};

// Check if user is role verified (restaurant/NGO approved by admin)
export const checkRoleVerified = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.verificationStatus !== "verified") {
      return res.status(403).json({
        success: false,
        message: `Your ${user.role} account is pending verification. Admin will review your documents.`,
        verificationStatus: user.verificationStatus,
      });
    }

    next();
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Role verification check failed" });
  }
};

// Check if user is not banned
export const checkNotBanned = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Your account has been banned. Reason: ${user.banReason || "Violating terms of service"}`,
        isBanned: true,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Ban check failed" });
  }
};

// Only restaurants can create food
export const onlyRestaurant = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== "restaurant") {
      return res.status(403).json({
        success: false,
        message: "Only restaurants can create food posts",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Role check failed" });
  }
};

// Only NGOs can claim food
export const onlyNGO = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== "ngo") {
      return res.status(403).json({
        success: false,
        message: "Only NGOs can claim food",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Role check failed" });
  }
};

// Log all actions for audit trail
export const auditLog = (action, resource = null) => {
  return async (req, res, next) => {
    // Capture original res.json to log responses
    const originalJson = res.json;

    res.json = function (data) {
      // Log the action after response
      AuditLog.create({
        userId: req.user?.id,
        action,
        resource,
        resourceId: req.params.id || req.body._id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        status: data.success !== false ? "success" : "failure",
        errorMessage: data.message,
      }).catch((err) => console.error("Audit log error:", err));

      return originalJson.call(this, data);
    };

    next();
  };
};
