import React from "react";

const Features = (props) => {
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const threshold = 10;

  const handleMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setTilt({ x: y * -threshold, y: x * threshold });
  };

  return (
    <div
      className="group rounded-2xl overflow-hidden bg-[#1e293b] border border-white/8 shadow-xl cursor-pointer transition-all duration-200 ease-out hover:border-orange-500/40 hover:shadow-orange-500/10"
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
    >
      <div className="relative overflow-hidden h-52">
        <img
          src={props.img}
          alt={props.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent" />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2">{props.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{props.body}</p>
        <button className="mt-4 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
          Learn more →
        </button>
      </div>
    </div>
  );
};

export default Features;