import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  checkRoleVerified,
  checkEmailVerified,
  checkNotBanned,
  onlyRestaurant,
  onlyNGO,
} from "../middlewares/verificationMiddleware.js";
import { upload } from "../middlewares/upload.js";
import { requireAdmin } from "../middlewares/adminMiddleware.js";
import {
  createFood,
  getAllFood,
  requestClaimFood,
  markInTransit,
  markCollected,
  getFoodPostsByRestaurant,
  getClaimedFoodPosts,
  getNearbyFoods,
  getFoodById,
  deleteFood,
  rejectClaim,
  uploadDistributionProof,
  getAdminFoodPosts,
  getPendingClaimRequests,
  approveClaimRequest,
  rejectClaimRequestByAdmin,
} from "../controllers/foodController.js";

const router = express.Router();

// Public routes
router.get("/", getAllFood);
router.get("/mine/claimed", authMiddleware, checkNotBanned, onlyNGO, getClaimedFoodPosts);
router.get("/admin/all", authMiddleware, requireAdmin("canViewAuditLogs"), getAdminFoodPosts);
router.get("/admin/claim-requests", authMiddleware, requireAdmin(["canVerifyRestaurants", "canVerifyNGOs"]), getPendingClaimRequests);
router.patch("/admin/claim-requests/:foodId/approve", authMiddleware, requireAdmin(["canVerifyRestaurants", "canVerifyNGOs"]), approveClaimRequest);
router.patch("/admin/claim-requests/:foodId/reject", authMiddleware, requireAdmin(["canVerifyRestaurants", "canVerifyNGOs"]), rejectClaimRequestByAdmin);

// Restaurant routes
router.post(
  "/createfood",
  authMiddleware,
  checkEmailVerified,
  checkRoleVerified,
  checkNotBanned,
  onlyRestaurant,
  upload.single("food_image"),
  createFood,
);
router.get(
  "/restaurant/:restaurantId",
  authMiddleware,
  getFoodPostsByRestaurant,
);
router.delete(
  "/:id",
  authMiddleware,
  checkRoleVerified,
  checkNotBanned,
  onlyRestaurant,
  deleteFood,
);

// NGO routes
router.get(
  "/nearby/search",
  authMiddleware,
  checkEmailVerified,
  checkRoleVerified,
  checkNotBanned,
  onlyNGO,
  getNearbyFoods,
);
router.patch(
  "/:id/claim",
  authMiddleware,
  checkEmailVerified,
  checkRoleVerified,
  checkNotBanned,
  onlyNGO,
  requestClaimFood,
);
router.patch(
  "/:foodId/in-transit",
  authMiddleware,
  checkRoleVerified,
  checkNotBanned,
  onlyRestaurant,
  markInTransit,
);
router.patch(
  "/:foodId/collected",
  authMiddleware,
  checkRoleVerified,
  checkNotBanned,
  onlyNGO,
  markCollected,
);
router.get("/:id", getFoodById);
router.post(
  "/:foodId/distribution-proof",
  authMiddleware,
  checkEmailVerified,
  checkRoleVerified,
  checkNotBanned,
  onlyNGO,
  upload.array("photos", 5),
  uploadDistributionProof,
);
router.patch(
  "/:foodId/reject",
  authMiddleware,
  checkNotBanned,
  onlyRestaurant,
  rejectClaim,
);

export default router;
