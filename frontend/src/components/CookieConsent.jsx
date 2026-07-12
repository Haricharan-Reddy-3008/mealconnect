import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

const CookieConsent = () => {
  const [show, setShow] = useState(
    () => !localStorage.getItem("cookie_consent"),
  );

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm bg-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
            <Cookie size={17} className="text-orange-400" />
          </div>
          <h2 className="text-white font-bold text-base">We use cookies</h2>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed">
          We use cookies to improve your experience, personalize content, and
          measure platform performance. See our{" "}
          <a
            href="#"
            className="text-orange-400 underline hover:text-orange-300 transition-colors"
          >
            Privacy Policy
          </a>{" "}
          for details.
        </p>

        <div className="flex items-center gap-3 mt-5">
          <a
            href="#"
            className="text-sm text-slate-400 hover:text-slate-300 transition-colors underline"
          >
            More Options
          </a>
          <button
            type="button"
            onClick={handleAccept}
            className="ml-auto px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
