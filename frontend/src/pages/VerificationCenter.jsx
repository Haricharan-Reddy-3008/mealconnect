import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/useAuth";
import api from "../api/axios";
import toast from "react-hot-toast";
import { CheckCircle2, Clock3, FileUp, Mail, ShieldAlert, Upload } from "lucide-react";

export default function VerificationCenter() {
  const { user } = useAuth();
  const fileInput = useRef();
  const [status, setStatus] = useState(null);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const load = () => {
    api.get("/verification/verification-status")
      .then((r) => setStatus(r.data))
      .catch(() => {});
  };
  useEffect(() => {
    load();
  }, []);
  const upload = async () => {
    if (!files.length) return toast.error("Choose at least one JPG or PNG document");
    const body = new FormData(); files.forEach((file) => body.append("documents", file));
    setSaving(true);
    try { const r = await api.post("/verification/upload-verification-documents", body); toast.success(r.data.message); setFiles([]); load(); }
    catch (err) { toast.error(err.response?.data?.message || "Document upload failed"); }
    finally { setSaving(false); }
  };
  const resend = async () => { try { await api.post("/verification/send-verification-email", { email: user.email }); toast.success("Verification email sent"); } catch (err) { toast.error(err.response?.data?.message || "Could not send email"); } };
  const verified = status?.verificationStatus === "verified";
  const getStatusText = () => {
    if (!status) return "Loading...";
    if (verified) return "Approved";
    if (status.verificationStatus === "rejected") return `Rejected: ${status.rejectionReason || "Invalid files"}`;
    if (status.hasDocuments) return "Pending review";
    return "Action required: Upload documents";
  };
  return <main className="min-h-screen bg-[#0f172a] pt-28 px-4 pb-16"><div className="max-w-3xl mx-auto">
    <p className="text-orange-400 text-xs font-bold tracking-widest uppercase">Trust & safety</p><h1 className="text-3xl font-extrabold text-white mt-2">Verify your organization</h1>
    <p className="text-slate-400 text-sm mt-2">Complete both steps before you can {user?.role === "ngo" ? "claim food" : "post food"}.</p>
    <div className="grid md:grid-cols-2 gap-5 mt-8">
      <section className="bg-[#1e293b] border border-white/10 rounded-2xl p-6"><Mail className={status?.emailVerified ? "text-emerald-400" : "text-orange-400"}/><h2 className="text-white font-bold mt-4">1. Confirm email</h2><p className="text-slate-400 text-sm mt-2">Use the link sent to {user?.email}.</p>
      {status?.emailVerified ? <p className="mt-4 text-emerald-400 text-sm flex gap-2"><CheckCircle2 size={18}/> Verified</p> : <button onClick={resend} className="mt-4 text-sm font-semibold text-orange-400">Resend email</button>}</section>
      <section className="bg-[#1e293b] border border-white/10 rounded-2xl p-6"><FileUp className={verified ? "text-emerald-400" : "text-orange-400"}/><h2 className="text-white font-bold mt-4">2. Organization review</h2><p className="text-slate-400 text-sm mt-2">Upload registration or business documents for an admin review.</p>
      <p className={`mt-4 text-sm flex gap-2 ${verified ? "text-emerald-400" : status?.verificationStatus === "rejected" ? "text-red-400" : "text-amber-400"}`}>{verified ? <CheckCircle2 size={18}/> : status?.verificationStatus === "rejected" ? <ShieldAlert size={18}/> : <Clock3 size={18}/>} {getStatusText()}</p></section>
    </div>
    {!verified && <section className="mt-5 bg-[#1e293b] border border-white/10 rounded-2xl p-6"><h2 className="text-white font-bold">Upload documents</h2><p className="text-slate-400 text-sm mt-1">JPG or PNG, up to five files and 5 MB each.</p><input ref={fileInput} type="file" multiple accept="image/jpeg,image/png" onChange={(e) => setFiles(Array.from(e.target.files || []))} className="hidden"/><div className="mt-4 flex flex-wrap gap-3"><button onClick={() => fileInput.current?.click()} className="px-4 py-2 rounded-xl border border-white/15 text-slate-200 text-sm"><Upload size={15} className="inline mr-2"/>Choose files</button><span className="text-slate-400 self-center text-sm">{files.length ? `${files.length} file(s) selected` : "No files selected"}</span></div><button disabled={saving} onClick={upload} className="mt-4 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50">{saving ? "Uploading…" : "Submit for review"}</button></section>}
  </div></main>;
}
