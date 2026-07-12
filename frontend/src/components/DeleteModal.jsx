import React from "react";
import { AlertTriangle } from "lucide-react";

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="flex flex-col items-center bg-[#1e293b] border border-white/10 rounded-2xl py-8 px-6 w-[85vw] md:w-[380px] shadow-2xl">

        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/25 mb-4">
          <AlertTriangle size={26} className="text-red-400" />
        </div>

        <h2 className="text-white font-bold text-xl">Are you sure?</h2>

        <p className="text-sm text-slate-400 mt-2 text-center leading-relaxed">
          This action is <span className="text-red-400 font-medium">permanent</span> and cannot be undone.
        </p>

        <div className="flex items-center gap-3 mt-7 w-full">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-sm font-medium hover:bg-white/10 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-11 rounded-xl bg-red-500/90 text-white text-sm font-semibold hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;