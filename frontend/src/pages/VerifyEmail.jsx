import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, message: "Verifying your email…" });
  useEffect(() => {
    api.get(`/verification/verify-email/${token}`)
      .then((res) => setState({ success: true, message: res.data.message }))
      .catch((err) => setState({ success: false, message: err.response?.data?.message || "We couldn't verify this link." }));
  }, [token]);
  return <main className="min-h-screen bg-[#0f172a] pt-32 px-4 flex justify-center">
    <section className="w-full max-w-md bg-[#1e293b] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
      {state.loading ? <Loader2 className="animate-spin text-orange-400 mx-auto mb-5" size={42} /> : state.success ? <CheckCircle2 className="text-emerald-400 mx-auto mb-5" size={42} /> : <CircleAlert className="text-red-400 mx-auto mb-5" size={42} />}
      <h1 className="text-2xl font-bold text-white">{state.loading ? "Verifying email" : state.success ? "Email verified" : "Verification failed"}</h1>
      <p className="mt-3 text-sm text-slate-400">{state.message}</p>
      {!state.loading && <Link to="/login" className="inline-block mt-7 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm">Continue to sign in</Link>}
    </section>
  </main>;
}
