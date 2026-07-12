import React from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { UserCog, LogOut, ShieldCheck } from "lucide-react";

const Menu = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="w-44 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden py-1.5">
      <button
        onClick={() => {
          navigate("/updateprofile");
          scrollTo(0, 0);
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/8 hover:text-orange-400 transition-all cursor-pointer"
      >
        <UserCog size={15} className="flex-shrink-0" />
        Edit Profile
      </button>
      {user?.isAdmin && <button onClick={() => { navigate("/admin"); scrollTo(0, 0); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-sky-300 hover:bg-white/8"><ShieldCheck size={15}/>Admin dashboard</button>}
      <div className="mx-3 my-1 h-px bg-white/8" />
      <button
        onClick={() => {
          logout();
          navigate("/");
          scrollTo(0, 0);
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
      >
        <LogOut size={15} className="flex-shrink-0" />
        Log Out
      </button>
    </div>
  );
};

export default Menu;
