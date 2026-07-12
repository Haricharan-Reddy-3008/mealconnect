import { Star, X } from "lucide-react";
import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function RatingModal({ food, user, onClose, onDone }) {
  const [rating, setRating] = useState(5); const [review, setReview] = useState(""); const [saving, setSaving] = useState(false);
  const submit = async () => { setSaving(true); try { await api.post("/verification/rate-user", { userId: user._id || user.id, foodPostId: food._id, rating, review, foodQuality: rating, timeliness: rating, behavior: rating }); toast.success("Rating submitted"); onDone?.(); onClose(); } catch (e) { toast.error(e.response?.data?.message || "Rating could not be submitted"); } finally { setSaving(false); } };
  return <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"><div className="w-full max-w-md rounded-2xl bg-[#1e293b] border border-white/10 p-6 relative"><button onClick={onClose} className="absolute right-4 top-4 text-slate-400"><X size={18}/></button><h2 className="text-xl font-bold text-white">Rate {user.name}</h2><p className="text-sm text-slate-400 mt-1">How did the {food.food_name} handoff go?</p><div className="flex gap-2 mt-6">{[1,2,3,4,5].map((n) => <button key={n} onClick={() => setRating(n)}><Star size={28} className={n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-600"}/></button>)}</div><textarea value={review} onChange={(e) => setReview(e.target.value)} maxLength="600" placeholder="Optional review" className="mt-5 w-full min-h-24 rounded-xl bg-[#0f172a] border border-white/10 p-3 text-sm text-white outline-none"/><button disabled={saving} onClick={submit} className="mt-4 w-full py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50">{saving ? "Submitting…" : "Submit rating"}</button></div></div>;
}
