import React, { useCallback, useEffect, useState } from "react";
import { Plus, UtensilsCrossed } from "lucide-react";
import CreateFood from "../components/CreateFood";
import FoodCard from "../components/FoodCard";
import { getFoodPosts, deleteFood } from "../api/food";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";
import { useAuth } from "../context/useAuth";
import EditFood from "../components/EditFood";
import socket from "../socket/socket";

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editFood, setEditFood] = useState(null);

  const fetchFoods = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await getFoodPosts(user.id);
      setFoods(res.data.data || []);
    } catch {
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  useEffect(() => {
    const handleFoodClaimed = ({ foodName, ngoName }) => {
      toast.success(`"${foodName}" was claimed by ${ngoName}`);
      fetchFoods();
    };
    const handleFoodCollected = ({ foodName, ngoName }) => {
      toast.success(`"${foodName}" was collected by ${ngoName}`);
      fetchFoods();
    };
    const handleFoodExpired = () => fetchFoods();

    socket.on("food_claimed_owner", handleFoodClaimed);
    socket.on("food_collected_owner", handleFoodCollected);
    socket.on("food_expired", handleFoodExpired);
    return () => {
      socket.off("food_claimed_owner", handleFoodClaimed);
      socket.off("food_collected_owner", handleFoodCollected);
      socket.off("food_expired", handleFoodExpired);
    };
  }, [fetchFoods, user?.id]);

  const handleDelete = async (id) => {
    try {
      await deleteFood(id);
      toast.success("Food post deleted");
      setFoods((prev) => prev.filter((f) => f._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const isVerified = user?.verificationStatus === "verified";

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-[#0f172a] pt-24 px-4 sm:px-8 md:px-16 pb-14">
      {/* Verification warning banner */}
      {!isVerified && (
        <div className="mb-8 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-orange-500/5">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>Your restaurant account is pending verification. Admin must approve your documents before you can publish food posts.</span>
          </div>
          <a href="/verification" className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors flex-shrink-0">
            Go to Verification Center
          </a>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
        <div>
          <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest">
            Restaurant Dashboard
          </p>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Your <span className="text-orange-400">Food Posts</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Manage your surplus food listings and track their status.
          </p>
        </div>
        <button
          disabled={!isVerified}
          onClick={() => setShowCreate(true)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${
            isVerified
              ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 cursor-pointer"
              : "bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
          } flex-shrink-0`}
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {foods.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[55vh] gap-5 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#1e293b] border border-white/8 flex items-center justify-center">
            <UtensilsCrossed size={36} className="text-slate-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">No food posts yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Create your first post to start sharing surplus meals with nearby
              NGOs.
            </p>
          </div>
          <button
            disabled={!isVerified}
            onClick={() => setShowCreate(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-colors ${
              isVerified
                ? "bg-orange-500 hover:bg-orange-600 cursor-pointer"
                : "bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
            }`}
          >
            <Plus size={16} /> Create First Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {foods.map((food) => (
            <FoodCard
              key={food._id}
              food={food}
              onDelete={handleDelete}
              onEdit={(food) => setEditFood(food)}
              refresh={fetchFoods}
            />
          ))}
        </div>
      )}

      <CreateFood
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchFoods}
      />
      <EditFood
        open={!!editFood}
        food={editFood}
        onClose={() => setEditFood(null)}
        onUpdated={fetchFoods}
      />
    </div>
  );
};

export default RestaurantDashboard;
