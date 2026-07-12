import User from "../models/User.js";
import Rating from "../models/Rating.js";
import AuditLog from "../models/AuditLog.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { uploadBufferToCloudinary } from "../utils/cloudUpload.js";
import FoodPost from "../models/foodPost.js";

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send verification email
export const sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.emailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already verified" });
    }

    // Generate verification token (valid for 24 hours)
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const emailContent = `
      <h2>Email Verification - ResQFood</h2>
      <p>Hi ${user.name},</p>
      <p>Please verify your email address to complete your registration.</p>
      <p><a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verify Email</a></p>
      <p>Or copy this link: ${verificationLink}</p>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't register, please ignore this email.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Email Verification - ResQFood",
      html: emailContent,
    });

    res.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify email with token
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Verification token is required" });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or expired verification token",
        });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Log this verification
    await AuditLog.create({
      userId: user._id,
      action: "email_verified",
      resource: "User",
      status: "success",
    });

    res.json({
      success: true,
      message: "Email verified successfully. You can now use all features.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload verification documents (for restaurant/NGO)
export const uploadVerificationDocuments = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No documents provided" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Only restaurants and NGOs can upload verification documents
    if (user.role !== "restaurant" && user.role !== "ngo") {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Only restaurants and NGOs need to upload verification documents",
        });
    }

    const documentUrls = await Promise.all(req.files.map(async (file) => {
      const uploaded = await uploadBufferToCloudinary(file.buffer, file.originalname);
      return { url: uploaded.secure_url, public_id: uploaded.public_id, uploadedAt: new Date() };
    }));

    user.verificationDocuments = documentUrls;
    user.verificationStatus = "pending";
    await user.save();

    // Log this action
    await AuditLog.create({
      userId: user._id,
      action: "verification_documents_uploaded",
      resource: "User",
      resourceId: user._id,
      status: "success",
    });

    res.json({
      success: true,
      message:
        "Verification documents uploaded successfully. Admin will review within 24-48 hours.",
      verificationStatus: "pending",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get verification status
export const getVerificationStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      emailVerified: user.emailVerified,
      verificationStatus: user.verificationStatus,
      hasDocuments:
        user.verificationDocuments && user.verificationDocuments.length > 0,
      rejectionReason: user.rejectionReason,
      isBanned: user.isBanned,
      banReason: user.banReason,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user rating and reputation
export const getUserRating = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const ratings = await Rating.find({ ratedUserId: userId });
    const averageRating =
      ratings.length > 0
        ? (
            ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          ).toFixed(2)
        : user.rating;

    res.json({
      success: true,
      userId,
      name: user.name,
      role: user.role,
      averageRating,
      totalRatings: ratings.length,
      foodsPosted: user.foodsPosted,
      foodsClaimed: user.foodsClaimed,
      foodsCollected: user.foodsCollected,
      verified: user.verificationStatus === "verified",
      ratings: ratings.map((r) => ({
        rating: r.rating,
        review: r.review,
        criteria: {
          foodQuality: r.foodQuality,
          timeliness: r.timeliness,
          behavior: r.behavior,
        },
        date: r.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Rate a user (after successful food collection)
export const rateUser = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const {
      userId,
      foodPostId,
      rating,
      review,
      foodQuality,
      timeliness,
      behavior,
    } = req.body;

    if (!userId || !foodPostId || !rating) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // Check if rater and ratee are different
    if (req.user.id === userId) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot rate yourself" });
    }

    const food = await FoodPost.findById(foodPostId);
    if (!food || food.status !== "collected") {
      return res.status(400).json({ success: false, message: "Ratings are available after a completed collection" });
    }
    const isRestaurant = food.restaurantId.toString() === req.user.id;
    const isClaimingNgo = food.claimedBy?.toString() === req.user.id;
    const expectedRatee = isRestaurant ? food.claimedBy?.toString() : food.restaurantId.toString();
    if ((!isRestaurant && !isClaimingNgo) || expectedRatee !== userId) {
      return res.status(403).json({ success: false, message: "You can only rate the other party in this collection" });
    }
    const alreadyRated = await Rating.exists({ raterUserId: req.user.id, foodPostId });
    if (alreadyRated) {
      return res.status(409).json({ success: false, message: "You have already rated this collection" });
    }

    // Create rating
    const newRating = new Rating({
      ratedUserId: userId,
      raterUserId: req.user.id,
      foodPostId,
      rating,
      review,
      foodQuality,
      timeliness,
      behavior,
      transactionType: "food_collection",
    });

    await newRating.save();

    // Update user's average rating
    const ratings = await Rating.find({ ratedUserId: userId });
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 5;

    const ratedUser = await User.findById(userId);
    ratedUser.rating = Math.round(averageRating * 10) / 10;
    ratedUser.totalRatings = ratings.length;
    await ratedUser.save();

    // Log this action
    await AuditLog.create({
      userId: req.user.id,
      action: "user_rated",
      resource: "Rating",
      resourceId: newRating._id,
      status: "success",
    });

    res.json({
      success: true,
      message: "Rating submitted successfully",
      rating: newRating,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// View pending verifications (Admin only)
export const getPendingVerifications = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    // Check if user is admin (you'll need to implement admin check)
    const pendingUsers = await User.find({
      verificationStatus: "pending",
      $or: [{ role: "restaurant" }, { role: "ngo" }],
    }).select("name email role address city verificationDocuments createdAt");

    res.json({
      success: true,
      count: pendingUsers.length,
      users: pendingUsers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve user verification (Admin only)
export const approveVerification = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.verificationStatus = "verified";
    user.rejectionReason = null;
    await user.save();

    // Send approval email
    await sendEmail({
      to: user.email,
      subject: "Account Verified - ResQFood",
      html: `<h2>Account Verified</h2><p>Hi ${user.name},</p><p>Your ${user.role} account has been verified and approved. You can now create and claim food posts on ResQFood.</p>`,
    });

    // Log this action
    await AuditLog.create({
      userId: req.user.id,
      action: "verification_approved",
      resource: "User",
      resourceId: userId,
      status: "success",
    });

    res.json({
      success: true,
      message: "User verification approved",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject user verification (Admin only)
export const rejectVerification = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res
        .status(400)
        .json({ success: false, message: "Rejection reason is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.verificationStatus = "rejected";
    user.rejectionReason = reason;
    await user.save();

    // Send rejection email
    await sendEmail({
      to: user.email,
      subject: "Account Verification Rejected - ResQFood",
      html: `<h2>Verification Rejected</h2><p>Hi ${user.name},</p><p>Your ${user.role} account verification was rejected for the following reason:</p><p><strong>${reason}</strong></p><p>You can reapply with correct documents.</p>`,
    });

    // Log this action
    await AuditLog.create({
      userId: req.user.id,
      action: "verification_rejected",
      resource: "User",
      resourceId: userId,
      details: { reason },
    });

    res.json({
      success: true,
      message: "User verification rejected",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
