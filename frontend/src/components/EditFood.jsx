import { X, ImagePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { updateFood } from "../api/food";
import toast from "react-hot-toast";

const inputClass =
  "w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 outline-none focus:border-orange-500/60 transition-colors";

const EditFood = ({ open, onClose, food, onUpdated }) => {
  const [form, setForm] = useState({
    food_name: "", quantity: "", description: "", expiry_time: "", address: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const utcToInputValue = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (!food) return;
    setForm({
      food_name: food.food_name || "",
      quantity: food.quantity || "",
      description: food.description || "",
      expiry_time: food.expiry_time ? utcToInputValue(food.expiry_time) : "",
      address: food.address || "",
    });
    setPreview(food.food_image?.[0]?.url || null);
    setImage(null);
  }, [food]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (!open || !food) return null;

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("food_name", form.food_name);
      fd.append("quantity", form.quantity);
      fd.append("description", form.description);
      if (form.expiry_time) fd.append("expiry_time", new Date(form.expiry_time).toISOString());
      if (form.address) fd.append("address", form.address);
      if (image) fd.append("food_image", image);
      await updateFood(food._id, fd);
      toast.success("Food post updated successfully");
      onUpdated?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={submit}
        className="bg-[#1e293b] border border-white/10 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-white font-bold text-lg">Edit Food Post</h2>
            <p className="text-slate-400 text-xs mt-0.5">Update the details of your listing</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Image */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Food Photo</label>
          {preview ? (
            <div className="relative mt-2 rounded-xl overflow-hidden h-44">
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setImage(null); setPreview(food.food_image?.[0]?.url || null); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <label className="mt-2 flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition-colors cursor-pointer">
              <ImagePlus size={24} className="text-orange-400 mb-1" />
              <span className="text-slate-400 text-xs">Click to upload new image</span>
              <input type="file" name="food_image" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          )}
          {preview && (
            <label className="mt-2 flex items-center gap-2 text-xs text-orange-400 cursor-pointer hover:text-orange-300 transition-colors">
              <ImagePlus size={13} />
              Change image
              <input type="file" name="food_image" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          )}
        </div>

        {/* Fields */}
        {[
          { label: "Food Name", key: "food_name", placeholder: "e.g. Biryani, Bread loaves…" },
          { label: "Quantity", key: "quantity", placeholder: "e.g. 20 portions, 5 kg…" },
          { label: "Description", key: "description", placeholder: "Any notes about the food…" },
          { label: "Pickup Address", key: "address", placeholder: "Leave blank to use registered address" },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
            <input
              className={`${inputClass} mt-1.5`}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}

        {/* Expiry */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expiry Date & Time</label>
          <input
            type="datetime-local"
            className={`${inputClass} mt-1.5`}
            value={form.expiry_time}
            onChange={(e) => setForm({ ...form, expiry_time: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Updating…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditFood;