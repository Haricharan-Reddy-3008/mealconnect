import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/useAuth";
import api from "../api/axios";
import upload from "../assets/upload_area.png";
import Spinner from "../components/Spinner";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import { SaveAll, Trash2, Camera, Utensils } from "lucide-react";
import DeleteModal from "../components/DeleteModal";

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

const PROFILE_FIELDS = [
  {
    label: "Organization Name",
    name: "name",
    placeholder: "Your organization name",
  },
  { label: "Address", name: "address", placeholder: "Your full address" },
  {
    label: "Contact Number",
    name: "contactInfo",
    placeholder: "10-digit phone number",
  },
];

const UpdateProfile = () => {
  const { user, loading, hardLogout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    address: user?.address || "",
    contactInfo: user?.contactInfo || "",
    city: user?.city || "",
  });
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        address: user.address || "",
        contactInfo: user.contactInfo || "",
        city: user.city || "",
      });
    }
  }, [user]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Session expired. Please login again.");
      return;
    }
    if (form.contactInfo && !/^\d{10}$/.test(form.contactInfo)) {
      toast.error("Contact number must be exactly 10 digits");
      return;
    }
    const formData = new FormData();
    if (form.name.trim()) formData.append("name", form.name.trim());
    if (form.address.trim()) formData.append("address", form.address.trim());
    if (form.contactInfo.trim())
      formData.append("contactInfo", form.contactInfo.trim());
    if (form.city.trim()) formData.append("city", form.city.trim());
    if (avatar) formData.append("avatar", avatar);

    setSubmitting(true);
    try {
      const res = await api.patch("/users/me", formData, {
        withCredentials: true,
      });
      if (!res.data.success) {
        toast.error(res.data.message || "Update failed");
        return;
      }
      toast.success("Profile updated successfully!");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete("/users/me", { withCredentials: true });
      toast.success("Account deleted permanently");
      setShowDeleteModal(false);
      hardLogout();
      setTimeout(() => {
        window.location.replace("/");
      }, 800);
    } catch {
      toast.error("Failed to delete account");
    }
  };

  if (loading) return <Spinner />;

  const avatarSrc = previewUrl || user?.avatar?.url || upload;
  const roleLabel = user?.role === "restaurant" ? "🏪 Restaurant" : "🤝 NGO";

  return (
    <div className="min-h-screen bg-[#0f172a] pt-20">
      {/* Glow */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-orange-600/8 blur-[140px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 py-12">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
              <Utensils size={17} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Meal<span className="text-orange-400">Connect</span>
            </span>
          </div>
          <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest">
            Account
          </p>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Edit Profile
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {user?.role === "restaurant"
              ? "Good food deserves a second chance — update your details below."
              : "Food is more than nourishment — it's hope. Keep your info up to date."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
          {/* Avatar section */}
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <img
                src={avatarSrc}
                alt="avatar"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-orange-500/40"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors cursor-pointer"
              >
                <Camera size={13} className="text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-white font-semibold">{user?.name}</p>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <span className="inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25">
                {roleLabel}
              </span>
            </div>
          </div>

          <div className="h-px bg-white/8" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* City */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                City
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
            </div>

            {PROFILE_FIELDS.map(({ label, name, placeholder }) => (
              <div key={name}>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {label}
                </label>
                <input
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="mt-1.5 w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 outline-none focus:border-orange-500/60 transition-colors"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 cursor-pointer mt-2"
            >
              <SaveAll size={15} />
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </form>

          <div className="h-px bg-white/8" />

          {/* Danger zone */}
          <div>
            <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-3">
              Danger Zone
            </p>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(true);
                scrollTo(0, 0);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <Trash2 size={15} />
              Delete Account Permanently
            </button>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />

      <Footer />
    </div>
  );
};

export default UpdateProfile;
