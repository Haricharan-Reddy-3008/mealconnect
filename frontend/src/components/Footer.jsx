import React from "react";
import { Link } from "react-router-dom";
import { Utensils, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#080e1a] text-white pt-14 pb-0">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
              <Utensils size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Meal<span className="text-orange-400">Connect</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Bridging surplus food with communities in need — reducing waste, one meal at a time.
          </p>
          <div className="flex gap-3 mt-1">
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer"
               className="p-2 rounded-lg bg-slate-800 hover:bg-orange-500/20 hover:text-orange-400 transition-all text-slate-400">
              <Facebook size={16} />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer"
               className="p-2 rounded-lg bg-slate-800 hover:bg-orange-500/20 hover:text-orange-400 transition-all text-slate-400">
              <Instagram size={16} />
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer"
               className="p-2 rounded-lg bg-slate-800 hover:bg-orange-500/20 hover:text-orange-400 transition-all text-slate-400">
              <Twitter size={16} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-orange-400 mb-4">
            Platform
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-orange-400 transition-colors">Home</Link></li>
            <li><a href="#features" className="hover:text-orange-400 transition-colors">How It Works</a></li>
            <li><a href="#testimonials" className="hover:text-orange-400 transition-colors">Testimonials</a></li>
            <li><Link to="/signup" onClick={() => scrollTo(0, 0)} className="hover:text-orange-400 transition-colors">Join Now</Link></li>
          </ul>
        </div>

        {/* For Partners */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-orange-400 mb-4">
            Partners
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><span>For Restaurants</span></li>
            <li><span>For NGOs</span></li>
            <li><span>Volunteer Network</span></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-orange-400 mb-4">
            Contact
          </h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2.5">
              <Mail size={14} className="text-orange-400 flex-shrink-0" />
              support@mealconnect.org
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={14} className="text-orange-400 flex-shrink-0" />
              +91 98765 43210
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
              123, Salt Lake, Kolkata – 700091
            </li>
          </ul>
        </div>
      </div>

      {/* Divider + Copyright */}
      <div className="border-t border-white/8 mt-12">
        <p className="text-center text-xs text-slate-500 py-5">
          © 2025 <span className="text-white font-medium">Meal<span className="text-orange-400">Connect</span></span>. All Rights Reserved.
          &nbsp;·&nbsp; Built with ❤️ to reduce food waste.
        </p>
      </div>
    </footer>
  );
}