import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  Check,
  FileText,
  X,
  ShieldCheck,
  Clock,
  Layers,
  MapPin,
  Calendar,
  Mail,
  Phone,
  User,
  AlertTriangle
} from "lucide-react";
import Spinner from "../components/Spinner";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("organizations");
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "organizations") {
        const r = await api.get("/verification/pending-verifications");
        setUsers(r.data.users || []);
      } else if (activeTab === "claims") {
        const r = await api.get("/food/admin/claim-requests");
        setClaims(r.data.posts || []);
      } else if (activeTab === "foods") {
        const r = await api.get("/food/admin/all");
        setFoods(r.data.posts || []);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load admin dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleUserVerification = async (userId, actionType) => {
    if (actionType === "reject" && !reason[userId]?.trim()) {
      return toast.error("Provide a rejection reason");
    }
    try {
      await api.patch(
        `/verification/${actionType === "approve" ? "approve" : "reject"}-verification/${userId}`,
        actionType === "reject" ? { reason: reason[userId] } : {}
      );
      toast.success(`Verification ${actionType}d`);
      setReason(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    }
  };

  const handleClaimApproval = async (foodId, actionType) => {
    if (actionType === "reject" && !reason[foodId]?.trim()) {
      return toast.error("Provide a rejection reason");
    }
    try {
      if (actionType === "approve") {
        await api.patch(`/food/admin/claim-requests/${foodId}/approve`);
        toast.success("Collection request approved");
      } else {
        await api.patch(`/food/admin/claim-requests/${foodId}/reject`, { reason: reason[foodId] });
        toast.success("Collection request rejected");
      }
      setReason(prev => {
        const next = { ...prev };
        delete next[foodId];
        return next;
      });
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] pt-28 px-4 pb-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-orange-400 text-xs font-bold uppercase tracking-widest">
            Moderation Portal
          </p>
          <h1 className="text-3xl text-white font-extrabold mt-2">
            Admin Moderation Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Review organizations, manage collection claim workflows, and monitor all platform food posts.
          </p>
        </div>

        {/* Tab System */}
        <div className="flex gap-2 sm:gap-4 border-b border-white/10 pb-4 mb-8 flex-wrap">
          {[
            { id: "organizations", label: "Organization Verifications", icon: ShieldCheck },
            { id: "claims", label: "Collection Requests", icon: Clock },
            { id: "foods", label: "All Food Listings", icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-[#1e293b] text-slate-400 hover:text-white border border-white/5 hover:bg-slate-800"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Spinner />
          </div>
        ) : (
          <div>
            {/* Organizations Tab */}
            {activeTab === "organizations" && (
              <div>
                {!users.length ? (
                  <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-10 text-center">
                    <p className="text-slate-400">No pending verification requests.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {users.map((user) => (
                      <article key={user._id} className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h2 className="text-white font-bold text-lg">{user.name}</h2>
                              <p className="text-slate-400 text-sm">
                                {user.email} · <span className="text-orange-400 capitalize">{user.role}</span>
                              </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
                              Pending Review
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mt-3 flex items-center gap-1.5">
                            <MapPin size={13} className="text-sky-400" />
                            {user.address}, {user.city}
                          </p>

                          <div className="mt-4">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                              Submitted Documents
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {user.verificationDocuments?.map((doc, index) => (
                                <a
                                  key={index}
                                  target="_blank"
                                  rel="noreferrer"
                                  href={doc.url || doc.type}
                                  className="text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-sky-400 hover:bg-white/10 hover:text-sky-300 transition-all"
                                >
                                  <FileText size={13} /> Document {index + 1}
                                </a>
                              ))}
                              {!user.verificationDocuments?.length && (
                                <p className="text-slate-500 text-xs italic">No documents uploaded.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 border-t border-white/5 pt-4">
                          <input
                            value={reason[user._id] || ""}
                            onChange={(e) => setReason({ ...reason, [user._id]: e.target.value })}
                            placeholder="Rejection reason (only if rejecting)"
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-red-500/50 transition-colors"
                          />
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={() => handleUserVerification(user._id, "approve")}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer"
                            >
                              <Check size={16} /> Approve
                            </button>
                            <button
                              onClick={() => handleUserVerification(user._id, "reject")}
                              className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-all cursor-pointer"
                            >
                              <X size={16} /> Reject
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Claims Tab */}
            {activeTab === "claims" && (
              <div>
                {!claims.length ? (
                  <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-10 text-center">
                    <p className="text-slate-400">No pending claim collection requests.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {claims.map((claim) => (
                      <article key={claim._id} className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h2 className="text-white font-bold text-lg">{claim.food_name}</h2>
                              <p className="text-slate-400 text-xs mt-0.5">
                                Quantity: <span className="text-orange-400 font-bold">{claim.quantity}</span>
                              </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 flex-shrink-0">
                              Pending Approval
                            </span>
                          </div>

                          {/* Bidirectional Info Box */}
                          <div className="grid grid-cols-2 gap-4 mt-4 p-3.5 bg-[#0f172a]/60 rounded-xl border border-white/5">
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Donor Restaurant</p>
                              <p className="text-white font-semibold text-xs mt-1 truncate">{claim.restaurantId?.name || "Unknown"}</p>
                              <p className="text-slate-400 text-[11px] truncate flex items-center gap-1 mt-0.5">
                                <Mail size={10} /> {claim.restaurantId?.email}
                              </p>
                              <p className="text-slate-400 text-[11px] flex items-center gap-1">
                                <Phone size={10} /> {claim.restaurantId?.contactInfo}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Claiming NGO</p>
                              <p className="text-sky-400 font-semibold text-xs mt-1 truncate">{claim.claimedBy?.name || "Unknown"}</p>
                              <p className="text-slate-400 text-[11px] truncate flex items-center gap-1 mt-0.5">
                                <Mail size={10} /> {claim.claimedBy?.email}
                              </p>
                              <p className="text-slate-400 text-[11px] flex items-center gap-1">
                                <Phone size={10} /> {claim.claimedBy?.contactInfo}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 text-xs text-slate-400 space-y-1.5">
                            <p className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-500"/> City: {claim.city}</p>
                            {claim.address && <p className="flex items-start gap-1.5"><MapPin size={12} className="text-slate-500 mt-0.5"/> Pickup: {claim.address}</p>}
                            <p className="flex items-center gap-1.5"><Clock size={12} className="text-slate-500"/> Expiry: {new Date(claim.expiry_time).toLocaleString("en-IN")}</p>
                            <p className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-500"/> Claim Initiated: {new Date(claim.claimedAt).toLocaleString("en-IN")}</p>
                          </div>
                        </div>

                        <div className="mt-6 border-t border-white/5 pt-4">
                          <input
                            value={reason[claim._id] || ""}
                            onChange={(e) => setReason({ ...reason, [claim._id]: e.target.value })}
                            placeholder="Rejection reason (only if rejecting)"
                            className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-red-500/50 transition-colors"
                          />
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={() => handleClaimApproval(claim._id, "approve")}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer"
                            >
                              <Check size={16} /> Approve Claim
                            </button>
                            <button
                              onClick={() => handleClaimApproval(claim._id, "reject")}
                              className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-all cursor-pointer"
                            >
                              <X size={16} /> Reject Claim
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Food Listings Tab */}
            {activeTab === "foods" && (
              <div>
                {!foods.length ? (
                  <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-10 text-center">
                    <p className="text-slate-400">No food posts found in the system.</p>
                  </div>
                ) : (
                  <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-[#0f172a]/40 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <th className="py-4 px-6">Food Name</th>
                            <th className="py-4 px-6">Donor Restaurant</th>
                            <th className="py-4 px-6">Claimed By (NGO)</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6">Quantity</th>
                            <th className="py-4 px-6">Expiry</th>
                            <th className="py-4 px-6 text-right">Last Update</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                          {foods.map((food) => {
                            const statusColors = {
                              available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                              claim_requested: "bg-sky-500/10 text-sky-400 border-sky-500/20",
                              claimed: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                              in_transit: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                              collected: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                              expired: "bg-red-500/10 text-red-400 border-red-500/20",
                              rejected: "bg-slate-700/50 text-slate-400 border-slate-700"
                            };
                            const statusText = {
                              available: "Available",
                              claim_requested: "Claim Requested",
                              claimed: "Claim Approved",
                              in_transit: "In Transit",
                              collected: "Collected",
                              expired: "Expired",
                              rejected: "Rejected"
                            };
                            return (
                              <tr key={food._id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-4 px-6 font-semibold text-white">{food.food_name}</td>
                                <td className="py-4 px-6">
                                  <p className="font-medium text-slate-200">{food.restaurantId?.name || "Unknown"}</p>
                                  <p className="text-xs text-slate-400">{food.restaurantId?.email}</p>
                                </td>
                                <td className="py-4 px-6">
                                  {food.claimedBy ? (
                                    <>
                                      <p className="font-medium text-sky-400">{food.claimedBy.name}</p>
                                      <p className="text-xs text-slate-400">{food.claimedBy.email}</p>
                                    </>
                                  ) : (
                                    <span className="text-slate-500 italic text-xs">None</span>
                                  )}
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[food.status] || "bg-slate-500/15 text-slate-400"}`}>
                                    {statusText[food.status] || food.status}
                                  </span>
                                </td>
                                <td className="py-4 px-6 font-semibold text-slate-200">{food.quantity}</td>
                                <td className="py-4 px-6 text-xs">{new Date(food.expiry_time).toLocaleString("en-IN")}</td>
                                <td className="py-4 px-6 text-xs text-right">{new Date(food.updatedAt).toLocaleString("en-IN")}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
