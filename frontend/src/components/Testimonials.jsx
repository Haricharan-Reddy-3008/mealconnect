import React from "react";

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10.525.464a.5.5 0 0 1 .95 0l2.107 6.482a.5.5 0 0 0 .475.346h6.817a.5.5 0 0 1 .294.904l-5.515 4.007a.5.5 0 0 0-.181.559l2.106 6.483a.5.5 0 0 1-.77.559l-5.514-4.007a.5.5 0 0 0-.588 0l-5.514 4.007a.5.5 0 0 1-.77-.56l2.106-6.482a.5.5 0 0 0-.181-.56L.832 8.197a.5.5 0 0 1 .294-.904h6.817a.5.5 0 0 0 .475-.346z"
      fill="#fbbf24"
    />
  </svg>
);

const Testimonials = (props) => {
  return (
    <div className="relative bg-[#1e293b] border border-white/8 rounded-2xl p-6 pt-14 flex flex-col gap-4 hover:border-sky-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/5">
      {/* Avatar */}
      <img
        className="absolute -top-8 left-6 h-16 w-16 rounded-full object-cover ring-4 ring-[#1e293b] border-2 border-sky-500/40"
        src={props.img}
        alt={props.author}
      />

      {/* Stars */}
      <div className="flex gap-0.5 mt-1">
        {Array(5).fill(0).map((_, i) => <StarIcon key={i} />)}
      </div>

      {/* Quote */}
      <p className="text-slate-300 text-sm leading-relaxed italic">
        "{props.quote}"
      </p>

      {/* Author */}
      <div className="mt-auto pt-2 border-t border-white/8">
        <p className="text-white font-semibold text-sm">{props.author}</p>
        <p className="text-sky-400 text-xs mt-0.5">{props.type}</p>
      </div>
    </div>
  );
};

export default Testimonials;