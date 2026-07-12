import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";
import { deleteProfile, updateProfile } from "../controllers/userController.js";
import Admin from "../models/Admin.js";

const router = express.Router();

// update profile & optional avatar upload (field 'avatar')
router.patch("/me", protect, upload.single("avatar"), updateProfile);
router.delete("/me", protect, deleteProfile);

// get current user (you can add more routes)
router.get("/me", protect, async (req, res) => {
  const { _id, name, email, role, address, city, contactInfo, avatar, location, emailVerified, verificationStatus, rejectionReason, rating, totalRatings, foodsPosted, foodsClaimed, foodsCollected } = req.user;
  const isAdmin = Boolean(await Admin.exists({ userId: _id }));
  res.json({ id: _id, name, email, role, address, city, contactInfo, avatar, location, emailVerified, verificationStatus, rejectionReason, rating, totalRatings, foodsPosted, foodsClaimed, foodsCollected, isAdmin });
});

export default router;
