const letters = ["M", "e", "a", "l", "C", "o", "n", "n", "e", "c", "t"];

const Spinner = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]">
      <div className="flex text-5xl md:text-7xl font-extrabold tracking-tight">
        {letters.map((char, i) => (
          <span
            key={i}
            className={`mx-0.5 animate-wave ${
              char === "C" && i === 4 ? "text-orange-400" : "text-white"
            }`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Spinner;