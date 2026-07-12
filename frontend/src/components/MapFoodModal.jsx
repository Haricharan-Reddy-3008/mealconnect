import { claimFood } from "../api/food";
import { X, Clock, Package, MapPin, CheckCircle2 } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/useAuth";

const statusConfig = {
  available: { label: "Available", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  claimed:   { label: "Claimed",   cls: "bg-amber-500/15  text-amber-400  border-amber-500/30"   },
  collected: { label: "Collected", cls: "bg-sky-500/15    text-sky-400    border-sky-500/30"     },
  expired:   { label: "Expired",   cls: "bg-red-500/15    text-red-400    border-red-500/30"     },
};

const MapFoodModal = ({ food, onClose, refresh }) => {
  const { user } = useAuth();
  const isVerified = user?.verificationStatus === "verified";

  const handleClaim = async () => {
    try {
      await claimFood(food._id);
      toast.success(`"${food.food_name}" claimed successfully!`);
      refresh();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Claim failed");
    }
  };

  const formatToIST = (iso) => {
    if (!iso) return "Not specified";
    return new Date(iso).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata", day: "2-digit", month: "short",
      year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
    });
  };

  const status = food.status || "available";
  const cfg = statusConfig[status] || statusConfig.available;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

        {/* Image */}
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={food.food_image?.[0]?.url || "https://via.placeholder.com/400x300?text=Food+Image"}
            alt={food.food_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent" />

          {/* Status badge */}
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
            {cfg.label}
          </span>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h2 className="text-white font-bold text-xl">{food.food_name}</h2>

          <p className="text-slate-400 text-sm leading-relaxed">
            {food.description || "No description available"}
          </p>

          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Package size={14} className="text-orange-400 flex-shrink-0" />
              <span><span className="font-medium">Quantity:</span> {food.quantity}</span>
            </div>
            {food.city && (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <MapPin size={14} className="text-orange-400 flex-shrink-0" />
                <span><span className="font-medium">City:</span> {food.city}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Clock size={14} className="text-orange-400 flex-shrink-0" />
              <span><span className="font-medium">Expires:</span> {formatToIST(food.expiry_time)}</span>
            </div>
            {food.address && (
              <div className="flex items-start gap-2 text-sm text-slate-300">
                <MapPin size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
                <span><span className="font-medium">Pickup:</span> {food.address}</span>
              </div>
            )}
          </div>

          {/* Claim button */}
          <button
            disabled={food.status !== "available" || !isVerified}
            onClick={handleClaim}
            className={`w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all
              disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed
              ${isVerified ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 cursor-pointer" : ""}`}
          >
            <CheckCircle2 size={16} />
            {food.status !== "available" ? "Not Available" : !isVerified ? "Verify Account to Claim" : "Claim This Food"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapFoodModal;