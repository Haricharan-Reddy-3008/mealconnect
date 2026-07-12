import React, { useState } from "react";
import { Utensils, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const LogIn = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch {
      toast.error("Login failed. Please try again.");
    }
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 pt-20">
      {/* Glow blob */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
              <Utensils size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Meal<span className="text-orange-400">Connect</span>
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1 mb-8">
            {adminMode ? "Sign in to the protected administration dashboard." : "Sign in to manage your food posts and partnerships."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email address
              </label>
              <div className="mt-1.5 flex items-center gap-3 bg-[#0f172a] border border-white/10 rounded-xl px-4 h-12 focus-within:border-orange-500/60 transition-colors">
                <Mail size={15} className="text-slate-500 flex-shrink-0" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5 flex items-center gap-3 bg-[#0f172a] border border-white/10 rounded-xl px-4 h-12 focus-within:border-orange-500/60 transition-colors">
                <Lock size={15} className="text-slate-500 flex-shrink-0" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Your password"
                  className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setAdminMode((value) => !value)}
            className="mt-5 w-full flex items-center justify-center gap-2 text-sm text-sky-300 hover:text-sky-200"
          >
            <ShieldCheck size={16} /> {adminMode ? "Use member login" : "Admin login"}
          </button>

          {!adminMode && <p className="text-slate-400 text-sm text-center mt-6">
            New to MealConnect?{" "}
            <Link
              to="/signup"
              onClick={() => scrollTo(0, 0)}
              className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              Create an account
            </Link>
          </p>}
        </div>
      </div>
    </div>
  );
};

export default LogIn;
