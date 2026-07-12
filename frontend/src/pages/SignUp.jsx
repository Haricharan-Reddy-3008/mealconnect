import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Utensils, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Footer from "../components/Footer";

const Field = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  children,
}) => (
  <div>
    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
      {label}
    </label>
    <div className="mt-1.5 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 focus-within:border-orange-500/60 transition-colors flex items-center gap-2">
      {children}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600 w-full"
      />
    </div>
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "restaurant",
    password: "",
    confirmpassword: "",
    address: "",
    contactInfo: "",
    city: "",
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const CITIES = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Ahmedabad",
    "Chennai",
    "Kolkata",
    "Surat",
    "Pune",
    "Jaipur",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Pimpri-Chinchwad",
    "Patna",
    "Vadodara",
  ].sort();

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function validate() {
    const err = {};
    if (!form.name.trim()) err.name = "Organization name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Valid email required";
    if (!form.contactInfo.match(/^[\d+\s-]{10}$/))
      err.contactInfo = "Phone must be exactly 10 digits";
    if (!form.address.trim()) err.address = "Address is required";
    if (!form.city) err.city = "City is required";
    if (
      !form.password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      )
    )
      err.password = "Must include uppercase, lowercase, number & symbol";
    if (form.confirmpassword !== form.password)
      err.confirmpassword = "Passwords do not match";
    return err;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    try {
      await signup(form);
      navigate("/login");
      scrollTo(0, 0);
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] pt-20">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-orange-600/8 blur-[140px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
              <Utensils size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Meal<span className="text-orange-400">Connect</span>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Join MealConnect
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Register as a Restaurant or NGO and start making a difference today.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                I am joining as
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {["restaurant", "ngo"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, role: r }))}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer capitalize ${
                      form.role === r
                        ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                        : "bg-[#0f172a] border-white/10 text-slate-400 hover:border-orange-500/40"
                    }`}
                  >
                    {r === "restaurant" ? "🏪 Restaurant" : "🤝 NGO"}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <Field
              label="Organization Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Your organization name"
            />

            {/* Email */}
            <Field
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
            />

            {/* Contact */}
            <Field
              label="Contact Number"
              name="contactInfo"
              value={form.contactInfo}
              onChange={handleChange}
              error={errors.contactInfo}
              placeholder="10-digit phone number"
            />

            {/* Address */}
            <Field
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              error={errors.address}
              placeholder="Your full address"
            />

            {/* City */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                City *
              </label>
              <div className="mt-1.5 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 focus-within:border-orange-500/60 transition-colors">
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="bg-transparent outline-none text-white text-sm w-full cursor-pointer appearance-none"
                >
                  <option value="" className="bg-[#0f172a]">
                    Select your city
                  </option>
                  {CITIES.map((city) => (
                    <option key={city} value={city} className="bg-[#0f172a]">
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              {errors.city && (
                <p className="text-xs text-red-400 mt-1">{errors.city}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 focus-within:border-orange-500/60 transition-colors flex items-center gap-2">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 8 chars, uppercase, number, symbol"
                  className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="mt-1.5 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 focus-within:border-orange-500/60 transition-colors flex items-center gap-2">
                <input
                  name="confirmpassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmpassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmpassword && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.confirmpassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer mt-2"
            >
              Create Account
            </button>

            <p className="text-slate-400 text-sm text-center">
              Already a member?{" "}
              <a
                href="/login"
                onClick={() => scrollTo(0, 0)}
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
