import React, { useCallback, useEffect, useState } from "react";
import { claimedFoodPosts, getNearbyFoods } from "../api/food";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/useAuth";
import ClaimedCard from "../components/ClaimedCard";
import MapFoodModal from "../components/MapFoodModal"; // Added to show food from list
import FoodCard from "../components/FoodCard"; // For the list view
import socket from "../socket/socket";
import toast from "react-hot-toast";
import { PackageOpen, MapPin, Search, Package } from "lucide-react";

const NgoDashboard = () => {
  const { user } = useAuth();
  const [claimedFoods, setClaimedFoods] = useState([]);
  const [nearbyFoods, setNearbyFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);

  const fetchClaimed = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await claimedFoodPosts();
      setClaimedFoods(res.data.data || []);
    } catch {
      setClaimedFoods([]);
    }
  }, [user?.id]);

  const fetchNearby = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getNearbyFoods(15); // Use 15km radius for "Nearby Section"
      setNearbyFoods(data.foods || []);
    } catch (err) {
      console.error("Failed to fetch nearby foods:", err);
      setNearbyFoods([]);
    }
  }, [user?.id]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchClaimed(), fetchNearby()]);
    setLoading(false);
  }, [fetchClaimed, fetchNearby]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user?.id) return;
      await refreshAll();
      if (!active) return;
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [refreshAll, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const handleRefresh = () => {
      fetchNearby();
      fetchClaimed();
    };

    socket.on("new_food_post", fetchNearby);
    socket.on("food_claimed_ngo", ({ ngoId, foodName }) => {
      if (ngoId === user.id) {
        toast.success(`You claimed "${foodName}" successfully`);
        handleRefresh();
      }
    });
    socket.on("food_collected_ngo", ({ ngoId, foodName }) => {
      if (ngoId === user.id) {
        toast.success(`You collected "${foodName}" successfully`);
        handleRefresh();
      }
    });
    socket.on("food_unavailable", handleRefresh);
    socket.on("food_expired", handleRefresh);

    return () => {
      socket.off("new_food_post", fetchNearby);
      socket.off("food_claimed_ngo");
      socket.off("food_collected_ngo");
      socket.off("food_unavailable", handleRefresh);
      socket.off("food_expired", handleRefresh);
    };
  }, [user?.id]);

  const isVerified = user?.verificationStatus === "verified";

  const handleFoodClick = (food) => {
    if (!isVerified) {
      toast.error("Verification required to view and claim food.");
      return;
    }
    setSelectedFood(food);
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-[#0f172a] pt-24 px-4 sm:px-8 md:px-16 pb-20">
      {/* Verification warning banner */}
      {!isVerified && (
        <div className="mb-8 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-sky-500/5">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>Your NGO account is pending verification. Admin must approve your documents before you can claim or collect food.</span>
          </div>
          <a href="/verification" className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition-colors flex-shrink-0">
            Go to Verification Center
          </a>
        </div>
      )}

      {/* Welcome Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-orange-400 text-sm font-semibold uppercase tracking-widest mb-1">
          <MapPin size={14} />
          <span>{user?.city || "Your City"}</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white">
          NGO <span className="text-sky-400">Dashboard</span>
        </h1>
        <p className="text-slate-400 mt-2 text-sm max-w-xl">
          Manage your claimed meals and discover available surplus food in your
          city.
        </p>
      </div>

      {/* Nearby Food Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Search size={20} className="text-orange-500" />
            Discover Food in {user?.city || "Nearby"}
          </h2>
          {isVerified ? (
            <a
              href="/mapview"
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 underline transition-colors"
            >
              View on Map
            </a>
          ) : (
            <span className="text-xs font-semibold text-slate-500 cursor-not-allowed">
              Map View (Verification Required)
            </span>
          )}
        </div>

        {nearbyFoods.length === 0 ? (
          <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-10 text-center">
            <p className="text-slate-500 text-sm italic">
              No available food posts in your city right now. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nearbyFoods.map((food) => (
              <div
                key={food._id}
                onClick={() => handleFoodClick(food)}
                className="cursor-pointer"
              >
                {/* We use a simplified preview card or the FoodCard itself but without owner actions */}
                <div className="bg-[#1e293b] border border-white/8 rounded-2xl overflow-hidden shadow-xl hover:border-orange-500/25 hover:shadow-orange-500/5 transition-all duration-300">
                  <div className="h-40 relative">
                    <img
                      src={food.food_image?.[0]?.url}
                      alt={food.food_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent" />
                    <span className="absolute bottom-3 left-3 text-white font-bold">
                      {food.food_name}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Package size={12} className="text-orange-400" />
                      <span>Qty: {food.quantity}</span>
                    </div>
                    {food.city && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin size={12} className="text-orange-400" />
                        <span>{food.city}</span>
                      </div>
                    )}
                    <div className="text-[10px] text-orange-400/80 font-semibold uppercase tracking-tighter">
                      Tap to View & Claim
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-white/5 mb-16" />

      {/* Claimed Food Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <PackageOpen size={20} className="text-sky-500" />
          Your Claimed Meals
        </h2>

        {claimedFoods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-5 text-center bg-[#1e293b]/20 rounded-3xl border border-dashed border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-[#1e293b] border border-white/8 flex items-center justify-center">
              <PackageOpen size={28} className="text-slate-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                No claimed food posts yet
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Browse the section above or the map to find food near you.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {claimedFoods.map((food) => (
              <ClaimedCard key={food._id} food={food} refresh={refreshAll} />
            ))}
          </div>
        )}
      </div>

      {selectedFood && (
        <MapFoodModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
          refresh={refreshAll}
        />
      )}
    </div>
  );
};

export default NgoDashboard;
