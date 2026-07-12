import { BadgeCheck, Mail, Phone, MapPin, Star } from "lucide-react";

export default function ClaimantDetails({ ngo }) {
  if (!ngo) return null;
  return <div className="mt-3 rounded-xl bg-sky-500/10 border border-sky-500/20 p-3 text-xs text-slate-300 space-y-1.5"><div className="flex items-center justify-between gap-2"><span className="font-semibold text-white truncate">{ngo.name}</span>{ngo.verificationStatus === "verified" && <span className="flex items-center gap-1 text-emerald-400"><BadgeCheck size={14}/> Verified NGO</span>}</div><p className="flex gap-1.5"><Star size={13} className="text-amber-400"/> {ngo.rating?.toFixed?.(1) || ngo.rating || "New"} {ngo.totalRatings ? `(${ngo.totalRatings})` : ""}</p>{ngo.contactInfo && <p className="flex gap-1.5"><Phone size={13}/> {ngo.contactInfo}</p>}{ngo.email && <p className="flex gap-1.5"><Mail size={13}/> {ngo.email}</p>}{ngo.address && <p className="flex gap-1.5"><MapPin size={13}/> {ngo.address}</p>}</div>;
}
