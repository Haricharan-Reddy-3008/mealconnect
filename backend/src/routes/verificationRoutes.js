import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";
import { requireAdmin } from "../middlewares/adminMiddleware.js";
import {
  sendVerificationEmail,
  verifyEmail,
  uploadVerificationDocuments,
  getVerificationStatus,
  getUserRating,
  rateUser,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from "../controllers/verificationController.js";

const router = express.Router();

// Email verification routes
router.post("/send-verification-email", sendVerificationEmail);
router.get("/verify-email/:token", verifyEmail);

// Role verification routes (restaurant/NGO)
router.post(
  "/upload-verification-documents",
  authMiddleware,
  upload.array("documents", 5),
  uploadVerificationDocuments,
);
router.get("/verification-status", authMiddleware, getVerificationStatus);

// Rating and reputation
router.get("/user-rating/:userId", getUserRating);
router.post("/rate-user", authMiddleware, rateUser);

// Admin verification endpoints
router.get("/pending-verifications", authMiddleware, requireAdmin(["canVerifyRestaurants", "canVerifyNGOs"]), getPendingVerifications);
router.patch(
  "/approve-verification/:userId",
  authMiddleware,
  requireAdmin(["canVerifyRestaurants", "canVerifyNGOs"]),
  approveVerification,
);
router.patch(
  "/reject-verification/:userId",
  authMiddleware,
  requireAdmin(["canVerifyRestaurants", "canVerifyNGOs"]),
  rejectVerification,
);

export default router;
