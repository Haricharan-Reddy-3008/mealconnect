import FoodPost from "../models/foodPost.js";
import { getIO } from "../socket/socketHandler.js";
import axios from "axios";
import User from "../models/User.js";
import Rating from "../models/Rating.js";
import AuditLog from "../models/AuditLog.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  foodClaimedOwnerTemplate,
  foodClaimedNgoTemplate,
  foodCollectedNgoTemplate,
  foodCollectedOwnerTemplate,
} from "../utils/emailTemplates.js";
import { uploadBufferToCloudinary } from "../utils/cloudUpload.js";

const geocodeAddress = async (address) => {
  if (!address) return null;
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) return null;
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1`;
    const response = await axios.get(url);
    const feature = response.data.features?.[0];
    if (!feature?.geometry?.coordinates) return null;
    const [lng, lat] = feature.geometry.coordinates;
    return { type: "Point", coordinates: [lng, lat] };
  } catch (error) {
    console.warn("Geocoding failed:", error.message);
    return null;
  }
};

// Create a new food post (Only restaurants)
export const createFood = async (req, res) => {
  try {
    // Verify user is restaurant
    const user = await User.findById(req.user._id);
    if (!user || user.role !== "restaurant") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only restaurants can create food posts",
        });
    }

    // Check if role verified
    if (user.verificationStatus !== "verified") {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Restaurant verification required. Admin must approve your documents.",
        });
    }

    // Check if banned
    if (user.isBanned) {
      return res
        .status(403)
        .json({ success: false, message: "Your account has been banned" });
    }

    const { food_name, quantity, description, expiry_time, address } = req.body;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "Food image is required" });
    }

    const uploadedImage = await uploadBufferToCloudinary(
      file.buffer,
      file.originalname,
    );
    const images = uploadedImage
      ? [{ url: uploadedImage.secure_url, public_id: uploadedImage.public_id }]
      : [];

    let geoPoint = null;
    if (address) {
      const g = await geocodeAddress(address);
      if (g) geoPoint = g;
    }

    if (!geoPoint && user?.location?.coordinates) {
      geoPoint = user.location;
    }

    if (!geoPoint) {
      return res.status(400).json({
        success: false,
        message: "Location required (address or restaurant profile location)",
      });
    }

    const postCity = user.city || "";
    if (!postCity) {
      return res.status(400).json({
        success: false,
        message:
          "Please update your profile to include a city before posting food.",
      });
    }

    if (!expiry_time) {
      return res
        .status(400)
        .json({ success: false, message: "expiry_time is required" });
    }

    // Validate expiry time is in future
    const expiryDate = new Date(expiry_time);
    if (expiryDate <= new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Expiry time must be in the future" });
    }

    const post = await FoodPost.create({
      restaurantId: req.user._id,
      food_name,
      quantity,
      description,
      expiry_time: expiryDate,
      location: geoPoint,
      city: postCity,
      food_image: images,
      status: "available",
      isVerified: true, // Since restaurant is verified
    });

    // Update restaurant's food count
    user.foodsPosted = (user.foodsPosted || 0) + 1;
    await user.save();

    // Log action
    await AuditLog.create({
      userId: req.user._id,
      action: "food_post_created",
      resource: "FoodPost",
      resourceId: post._id,
      status: "success",
    });

    const io = getIO();
    io.emit("new_food_post", {
      _id: post._id,
      food_name: post.food_name,
      quantity: post.quantity,
      description: post.description,
      expiry_time: post.expiry_time,
      location: post.location,
      city: post.city,
      food_image: post.food_image,
      restaurantId: post.restaurantId,
    });

    res
      .status(200)
      .json({ success: true, message: "Food post created successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all food posts by restaurant
export const getFoodPostsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const foodPosts = await FoodPost.find({ restaurantId })
      .populate("restaurantId", "name address contactInfo")
      .populate("claimedBy", "name email address contactInfo rating totalRatings verificationStatus foodsCollected")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foodPosts.length,
      data: foodPosts,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch food posts" });
  }
};

// Get all available food posts
export const getAllFood = async (req, res) => {
  try {
    const posts = await FoodPost.find({ status: "available" })
      .populate("restaurantId", "name city address rating verificationStatus")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Request to claim food (NGO initiates claim)
export const requestClaimFood = async (req, res) => {
  try {
    // Verify user is NGO
    const user = await User.findById(req.user._id);
    if (!user || user.role !== "ngo") {
      return res
        .status(403)
        .json({ success: false, message: "Only NGOs can claim food" });
    }

    // Check if role verified
    if (user.verificationStatus !== "verified") {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "NGO verification required. Admin must approve your documents.",
        });
    }

    // Check if banned
    if (user.isBanned) {
      return res
        .status(403)
        .json({ success: false, message: "Your account has been banned" });
    }

    const post = await FoodPost.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Food post not found" });
    }

    if (post.status !== "available") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Food is not available for claiming",
        });
    }

    // Check if expiry time has passed
    if (new Date() > new Date(post.expiry_time)) {
      return res
        .status(400)
        .json({ success: false, message: "Food has expired" });
    }

    // A collection request must be approved by an admin before pickup.
    post.status = "claim_requested";
    post.claimedBy = req.user._id;
    post.claimedAt = new Date();

    // Add to claim history
    post.claimHistory.push({
      ngoId: req.user._id,
      action: "claim_requested",
      timestamp: new Date(),
    });

    await post.save();

    // Send notifications
    const restaurant = await User.findById(post.restaurantId);
    const ngo = user;

    try {
      if (restaurant?.email) {
        await sendEmail({
          to: restaurant.email,
          subject: "🌱 Your food donation was claimed",
          html: `
            <h2>Food Donation Claimed</h2>
            <p>Hi ${restaurant.name},</p>
            <p>Your food post "${post.food_name}" has been claimed by <strong>${ngo.name}</strong></p>
            <p><strong>NGO Details:</strong></p>
            <ul>
              <li>Name: ${ngo.name}</li>
              <li>Email: ${ngo.email}</li>
              <li>Phone: ${ngo.contactInfo}</li>
              <li>Address: ${ngo.address}</li>
            </ul>
            <p>Please arrange pickup. Contact the NGO directly for collection details.</p>
          `,
        });
      }
      if (ngo?.email) {
        await sendEmail({
          to: ngo.email,
          subject: "🍽 Food Claimed Successfully",
          html: `
            <h2>Claim Confirmed</h2>
            <p>Hi ${ngo.name},</p>
            <p>You have successfully claimed <strong>${post.food_name}</strong> from <strong>${restaurant.name}</strong></p>
            <p><strong>Restaurant Details:</strong></p>
            <ul>
              <li>Name: ${restaurant.name}</li>
              <li>Email: ${restaurant.email}</li>
              <li>Phone: ${restaurant.contactInfo}</li>
              <li>Address: ${restaurant.address}</li>
            </ul>
            <p>Please coordinate pickup at your earliest convenience.</p>
          `,
        });
      }
    } catch (error) {
      console.error("Email sending failed:", error.message);
    }

    // Log action
    await AuditLog.create({
      userId: req.user._id,
      action: "food_claim_review_requested",
      resource: "FoodPost",
      resourceId: post._id,
      status: "success",
    });

    const io = getIO();
    io.emit("food_claimed_owner", {
      foodId: post._id,
      foodName: post.food_name,
      ngoName: ngo.name,
      ngoId: ngo._id,
      restaurantId: restaurant._id,
    });

    io.emit("food_claimed_ngo", {
      foodId: post._id,
      foodName: post.food_name,
      ngoId: ngo._id,
      restaurantName: restaurant.name,
      restaurantId: restaurant._id,
    });

    res.json({ success: true, message: "Collection request sent for admin approval", post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark food as in-transit (restaurant confirms pickup started)
export const markInTransit = async (req, res) => {
  try {
    const { foodId } = req.params;
    const food = await FoodPost.findById(foodId);

    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    }

    // Only restaurant can mark as in-transit
    if (food.restaurantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (food.status !== "claimed") {
      return res
        .status(400)
        .json({ success: false, message: "Food must be claimed first" });
    }

    food.status = "in_transit";
    food.collectionStartedAt = new Date();
    food.claimHistory.push({
      ngoId: food.claimedBy,
      action: "in_transit",
      timestamp: new Date(),
    });
    await food.save();

    // Notify NGO
    const ngo = await User.findById(food.claimedBy);
    if (ngo?.email) {
      await sendEmail({
        to: ngo.email,
        subject: "🚗 Your food donation is in transit",
        html: `<h2>Collection Started</h2><p>Hi ${ngo.name},</p><p>Your claimed food "${food.food_name}" is now in transit. Please prepare to receive it.</p>`,
      });
    }

    await AuditLog.create({
      userId: req.user._id,
      action: "food_in_transit",
      resource: "FoodPost",
      resourceId: foodId,
      status: "success",
    });

    const io = getIO();
    io.emit("food_in_transit", { foodId, ngoId: food.claimedBy });

    res.json({ success: true, message: "Marked as in-transit", post: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark food as collected
export const markCollected = async (req, res) => {
  try {
    const { foodId } = req.params;
    const ngoId = req.user._id;
    const food = await FoodPost.findById(foodId);

    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    }

    // Only NGO who claimed can mark as collected
    if (!food.claimedBy || food.claimedBy.toString() !== ngoId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (food.status !== "in_transit") {
      return res
        .status(400)
        .json({ success: false, message: "Food must be in-transit first" });
    }

    if (!food.distributionProof?.length) {
      return res.status(400).json({
        success: false,
        message: "Upload at least one distribution photo before completing collection",
      });
    }

    food.status = "collected";
    food.collectedAt = new Date();
    food.claimHistory.push({
      ngoId: ngoId,
      action: "collected",
      timestamp: new Date(),
    });
    await food.save();

    // Update NGO's collected count
    const ngo = await User.findById(ngoId);
    ngo.foodsCollected = (ngo.foodsCollected || 0) + 1;
    await ngo.save();

    // Send emails
    const restaurant = await User.findById(food.restaurantId);
    try {
      if (restaurant?.email) {
        await sendEmail({
          to: restaurant.email,
          subject: "✅ Your food donation has been collected",
          html: `<h2>Collection Complete</h2><p>Hi ${restaurant.name},</p><p>Your food donation "${food.food_name}" has been successfully collected by ${ngo.name}.</p><p>Thank you for your contribution!</p>`,
        });
      }
      if (ngo?.email) {
        await sendEmail({
          to: ngo.email,
          subject: "✅ Food received successfully",
          html: `<h2>Collection Confirmed</h2><p>Hi ${ngo.name},</p><p>You have successfully received "${food.food_name}" from ${restaurant.name}.</p><p>Thank you for helping reduce food waste!</p>`,
        });
      }
    } catch (error) {
      console.error("Email sending failed:", error.message);
    }

    await AuditLog.create({
      userId: ngoId,
      action: "food_collected",
      resource: "FoodPost",
      resourceId: foodId,
      status: "success",
    });

    const io = getIO();
    io.emit("food_collected", { foodId, ngoId });

    res.json({
      success: true,
      message: "Food marked as collected",
      post: food,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClaimedFoodPosts = async (req, res) => {
  try {
    const foodPosts = await FoodPost.find({ claimedBy: req.user._id })
      .populate("restaurantId", "name email address contactInfo rating totalRatings verificationStatus foodsPosted")
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: foodPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminFoodPosts = async (req, res) => {
  try {
    const posts = await FoodPost.find()
      .populate("restaurantId", "name email role verificationStatus")
      .populate("claimedBy", "name email role verificationStatus")
      .sort({ updatedAt: -1 });
    res.json({ success: true, posts });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getPendingClaimRequests = async (req, res) => {
  try {
    const posts = await FoodPost.find({ status: "claim_requested" })
      .populate("restaurantId", "name email address contactInfo verificationStatus")
      .populate("claimedBy", "name email address contactInfo rating totalRatings verificationStatus foodsCollected")
      .sort({ claimedAt: 1 });
    res.json({ success: true, posts });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const approveClaimRequest = async (req, res) => {
  try {
    const food = await FoodPost.findById(req.params.foodId);
    if (!food || food.status !== "claim_requested") return res.status(400).json({ success: false, message: "Collection request is no longer pending" });
    food.status = "claimed";
    food.claimApprovedAt = new Date();
    food.claimApprovedBy = req.user._id;
    food.claimHistory.push({ ngoId: food.claimedBy, action: "claim_approved", timestamp: new Date() });
    await food.save();
    await User.findByIdAndUpdate(food.claimedBy, { $inc: { foodsClaimed: 1 } });
    await AuditLog.create({ userId: req.user._id, action: "food_claim_approved", resource: "FoodPost", resourceId: food._id, status: "success" });
    res.json({ success: true, message: "Collection request approved", post: food });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const rejectClaimRequestByAdmin = async (req, res) => {
  try {
    const food = await FoodPost.findById(req.params.foodId);
    const { reason } = req.body;
    if (!food || food.status !== "claim_requested") return res.status(400).json({ success: false, message: "Collection request is no longer pending" });
    food.claimHistory.push({ ngoId: food.claimedBy, action: "claim_rejected_by_admin", timestamp: new Date(), reason: reason || "Not approved" });
    food.claimRejectReason = reason || "Not approved by admin";
    food.status = "available";
    food.claimedBy = null;
    food.claimedAt = null;
    await food.save();
    await AuditLog.create({ userId: req.user._id, action: "food_claim_rejected_by_admin", resource: "FoodPost", resourceId: food._id, details: { reason }, status: "success" });
    res.json({ success: true, message: "Collection request rejected", post: food });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// NGO uploads distribution evidence after receiving the food.
export const uploadDistributionProof = async (req, res) => {
  try {
    const food = await FoodPost.findById(req.params.foodId);
    if (!food) return res.status(404).json({ success: false, message: "Food not found" });
    if (!food.claimedBy || food.claimedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the claiming NGO can upload proof" });
    }
    if (food.status !== "in_transit") {
      return res.status(400).json({ success: false, message: "Distribution photos can be added after pickup starts" });
    }
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: "Upload at least one distribution photo" });
    }

    const uploads = await Promise.all(
      req.files.map(async (file) => {
        const uploaded = await uploadBufferToCloudinary(file.buffer, file.originalname);
        return { url: uploaded.secure_url, public_id: uploaded.public_id, uploadedAt: new Date() };
      }),
    );
    food.distributionProof.push(...uploads);
    food.claimHistory.push({ ngoId: req.user._id, action: "distribution_proof_uploaded", timestamp: new Date() });
    await food.save();

    await AuditLog.create({
      userId: req.user._id,
      action: "distribution_proof_uploaded",
      resource: "FoodPost",
      resourceId: food._id,
      details: { photoCount: uploads.length },
      status: "success",
    });
    res.json({ success: true, message: "Distribution photos uploaded", post: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject claim request
export const rejectClaim = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { reason } = req.body;
    const food = await FoodPost.findById(foodId);

    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    }

    // Only restaurant can reject
    if (food.restaurantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (food.status !== "claimed") {
      return res
        .status(400)
        .json({ success: false, message: "Only claimed food can be rejected" });
    }

    food.status = "available";
    food.claimedBy = null;
    food.claimedAt = null;
    food.claimRejectReason = reason;
    food.claimHistory.push({
      ngoId: null,
      action: "rejected",
      timestamp: new Date(),
      reason,
    });
    await food.save();

    // Notify NGO
    const ngo = await User.findById(
      food.claimHistory[food.claimHistory.length - 2]?.ngoId,
    );
    if (ngo?.email) {
      await sendEmail({
        to: ngo.email,
        subject: "❌ Your claim was rejected",
        html: `<h2>Claim Rejected</h2><p>Hi ${ngo.name},</p><p>Your claim for "${food.food_name}" was rejected.</p><p>Reason: ${reason || "Not specified"}</p>`,
      });
    }

    await AuditLog.create({
      userId: req.user._id,
      action: "claim_rejected",
      resource: "FoodPost",
      resourceId: foodId,
      details: { reason },
    });

    const io = getIO();
    io.emit("claim_rejected", { foodId });

    res.json({ success: true, message: "Claim rejected", post: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get nearby foods
export const getNearbyFoods = async (req, res) => {
  try {
    let { radius_km } = req.query;
    radius_km = parseFloat(radius_km || "5");

    if (!req.user || !req.user.location?.coordinates) {
      return res.status(400).json({
        success: false,
        message: "Provide coordinates or set user profile location",
      });
    }

    const [lng, lat] = req.user.location.coordinates;
    const userCity = req.user.city?.trim();
    if (!userCity) {
      return res.json({ success: true, foods: [] });
    }

    const meters = radius_km * 1000;

    const foods = await FoodPost.find({
      status: "available",
      city: { $regex: new RegExp(`^${userCity}$`, "i") },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: meters,
        },
      },
    })
      .populate("restaurantId", "name rating verificationStatus")
      .sort({ createdAt: -1 });

    res.json({ success: true, foods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get food by ID
export const getFoodById = async (req, res) => {
  try {
    const food = await FoodPost.findById(req.params.id)
      .populate(
        "restaurantId",
        "name email address contactInfo rating verificationStatus",
      )
      .populate("claimedBy", "name email address contactInfo");

    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    }

    res.json({ success: true, food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete food post (only restaurant owner)
export const deleteFood = async (req, res) => {
  try {
    const food = await FoodPost.findById(req.params.id);

    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    }

    if (food.restaurantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await FoodPost.deleteOne({ _id: req.params.id });

    await AuditLog.create({
      userId: req.user._id,
      action: "food_post_deleted",
      resource: "FoodPost",
      resourceId: req.params.id,
    });

    res.json({ success: true, message: "Food post deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
