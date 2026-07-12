import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import validator from "validator";
import axios from "axios";
import AuditLog from "../models/AuditLog.js";

// Generate a authToken for new users
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// helper to geocode address using Mapbox (if address provided)
const geocodeAddress = async (address) => {
  if (!address) {
    return null;
  }
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1`;
  const res = await axios.get(url);
  const feat = res.data.features?.[0];
  if (!feat) return null;
  const [lng, lat] = feat.geometry.coordinates;
  return { type: "Point", coordinates: [lng, lat] };
};

// SignUp for new user - No Log in required
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmpassword,
      role,
      address,
      contactInfo,
      city,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !confirmpassword ||
      !role ||
      !address ||
      !contactInfo ||
      !city
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Fields are missing" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid Email" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Password is not strong enough" });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(contactInfo)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashed,
      role,
      address,
      contactInfo,
      city,
      // Email confirmation is intentionally disabled. Organization approval
      // still controls access to posting and claiming food.
      emailVerified: true,
      verificationStatus:
        role === "restaurant" || role === "ngo" ? "pending" : "verified",
    });

    // geocode address to location (non-blocking — fails silently if Mapbox token is invalid)
    if (address) {
      try {
        const geo = await geocodeAddress(`${address}, ${city}`);
        if (geo) {
          user.location = geo;
        }
      } catch (geoErr) {
        console.warn(
          "Mapbox geocoding failed during registration (skipped):",
          geoErr.message,
        );
      }
    }

    await user.save();

    // Log registration
    await AuditLog.create({
      userId: user._id,
      action: "user_registered",
      resource: "User",
      status: "success",
    });

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Upload organization documents for admin approval.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        city: user.city,
        location: user.location,
        contactInfo: user.contactInfo,
        emailVerified: true,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Log in for already Signed up users
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Fields are missing" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User Not Found" });
    }

    // Check if account is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Your account has been banned. Reason: ${user.banReason || "Violating terms"}`,
      });
    }

    // Check for account lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        success: false,
        message: "Account temporarily locked. Try again later.",
      });
    }

    // Check password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account after 5 failed attempts for 30 minutes
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        await user.save();
        return res.status(423).json({
          success: false,
          message:
            "Too many failed login attempts. Account locked for 30 minutes.",
        });
      }

      await user.save();
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Pending users may sign in only to submit/review their verification.
    // All food operations remain guarded by verification middleware.

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Log login
    await AuditLog.create({
      userId: user._id,
      action: "user_login",
      status: "success",
    });

    res.json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        emailVerified: user.emailVerified,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout for Logged in users
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.json({ success: true, message: "Logged out successfully" });
};
