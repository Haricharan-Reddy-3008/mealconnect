import toast from "react-hot-toast";
import { collectFood } from "../api/food";
import { Clock, Package, CheckCircle2, MapPin, ImagePlus, Star } from "lucide-react";
import { useState } from "react";
import DistributionProofModal from "./DistributionProofModal";
import RatingModal from "./RatingModal";

const labels = { claim_requested: "Pending Admin Approval", claimed: "Claimed", in_transit: "Pickup in progress", collected: "Collected" };
export default function ClaimedCard({ food = {}, refresh }) {
  const [proof, setProof] = useState(false); const [rating, setRating] = useState(false);
  const collect = async () => { try { await collectFood(food._id); toast.success("Collection complete"); refresh(); } catch (e) { toast.error(e.response?.data?.message || "Collection failed"); } };
  const restaurant = food.restaurantId;
  const getButtonLabel = () => {
    if (food.status === "claim_requested") return "Awaiting Admin Approval";
    if (food.status === "claimed") return "Awaiting Restaurant Transit Start";
    if (food.status === "collected") return "Collected";
    if (food.status === "in_transit" && !food.distributionProof?.length) return "Upload photos to complete";
    return "Mark as collected";
  };
  return <article className="bg-[#1e293b] border border-white/8 rounded-2xl overflow-hidden shadow-xl flex flex-col"><img className="h-44 w-full object-cover" src={food.food_image?.[0]?.url} alt={food.food_name}/><div className="p-4 flex-1"><div className="flex justify-between gap-3"><h3 className="text-white font-bold">{food.food_name}</h3><span className="text-[11px] text-sky-300">{labels[food.status] || food.status}</span></div><p className="text-slate-400 text-xs mt-2 line-clamp-2">{food.description}</p><div className="mt-3 text-xs text-slate-400 space-y-1"><p className="flex gap-1.5"><Package size={13} className="text-sky-400"/>{food.quantity}</p><p className="flex gap-1.5"><MapPin size={13} className="text-sky-400"/>{food.city}</p><p className="flex gap-1.5"><Clock size={13} className="text-sky-400"/>Expires {new Date(food.expiry_time).toLocaleString("en-IN")}</p></div>{restaurant && <div className="mt-3 border-t border-white/8 pt-3 text-xs text-slate-300"><span className="font-medium text-white">Restaurant: </span>{restaurant.name} {restaurant.verificationStatus === "verified" && <span className="text-emerald-400">• Verified</span>}</div>}{food.status === "in_transit" && !food.distributionProof?.length && <button onClick={() => setProof(true)} className="mt-3 w-full py-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-sm font-semibold flex justify-center gap-2"><ImagePlus size={15}/> Upload distribution photos</button>}<button disabled={food.status !== "in_transit" || !food.distributionProof?.length} onClick={collect} className="mt-3 w-full py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold disabled:bg-slate-700 disabled:text-slate-500 flex justify-center gap-2"><CheckCircle2 size={15}/>{getButtonLabel()}</button>{food.status === "collected" && restaurant && <button onClick={() => setRating(true)} className="mt-2 w-full text-amber-300 text-sm flex justify-center gap-2"><Star size={15}/> Rate restaurant</button>}</div>{proof && <DistributionProofModal food={food} onClose={() => setProof(false)} onDone={refresh}/>} {rating && <RatingModal food={food} user={restaurant} onClose={() => setRating(false)} onDone={refresh}/>}</article>;
}
