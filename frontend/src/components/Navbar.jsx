import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MenuIcon, X as XIcon, Utensils } from "lucide-react";
import { useAuth } from "../context/useAuth";
import upload from "../assets/upload_area.png";
import Menu from "./Menu";

const Navbar = () => {
  const [isOpen, setisOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        className={`fixed top-0 left-0 z-50 w-full flex items-center justify-between px-4 sm:px-8 md:px-12 lg:px-20 py-3 text-white transition-all duration-500 ${
          scrolled || !isHome
            ? "bg-[#0f172a]/95 shadow-lg shadow-black/30 backdrop-blur-md"
            : "bg-transparent backdrop-blur-sm"
        }`}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 flex-1"
          onClick={() => scrollTo(0, 0)}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
            <Utensils size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Meal<span className="text-orange-400">Connect</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div
          className={`max-md:absolute max-md:top-0 max-md:-left-10 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-7 md:px-6 py-3 max-md:px-3 max-md:h-screen md:rounded-full backdrop-blur-3xl bg-[#0f172a]/90 md:bg-white/10 md:border border-white/10 overflow-hidden transition-[width] duration-300 ${
            isOpen ? "max-md:w-full" : "max-md:w-0"
          }`}
        >
          <XIcon
            className="md:hidden absolute top-6 right-6 w-8 h-8 cursor-pointer text-orange-400"
            onClick={() => setisOpen(false)}
          />
          <Link
            to="/"
            onClick={() => {
              scrollTo(0, 0);
              setisOpen(false);
            }}
            className="hover:text-orange-400 transition-colors duration-300 text-sm font-medium"
          >
            Home
          </Link>
          <a
            href={isHome ? "#features" : undefined}
            onClick={() => setisOpen(false)}
            className={`text-sm font-medium transition-colors duration-300 ${
              !isHome
                ? "text-slate-500 cursor-not-allowed"
                : "hover:text-orange-400"
            }`}
            aria-disabled={!isHome}
          >
            About
          </a>
          <a
            href={isHome ? "#testimonials" : undefined}
            onClick={() => setisOpen(false)}
            className={`text-sm font-medium transition-colors duration-300 ${
              !isHome
                ? "text-slate-500 cursor-not-allowed"
                : "hover:text-orange-400"
            }`}
            aria-disabled={!isHome}
          >
            Testimonials
          </a>

          {user?.role === "restaurant" && (
            <>
              <Link to="/restaurantdashboard" onClick={() => { scrollTo(0, 0); setisOpen(false); }} className="hover:text-orange-400 transition-colors duration-300 text-sm font-medium">Dashboard</Link>
              {user.verificationStatus !== "verified" && <Link to="/verification" className="text-amber-400 text-sm font-medium">Verify account</Link>}
            </>
          )}
          {user?.role === "ngo" && (
            <>
              <Link
                to="/ngodashboard"
                onClick={() => {
                  scrollTo(0, 0);
                  setisOpen(false);
                }}
                className="hover:text-orange-400 transition-colors duration-300 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/mapview"
                onClick={() => {
                  scrollTo(0, 0);
                  setisOpen(false);
                }}
                className="hover:text-orange-400 transition-colors duration-300 text-sm font-medium"
              >
                Map View
              </Link>
              {user.verificationStatus !== "verified" && <Link to="/verification" className="text-amber-400 text-sm font-medium">Verify account</Link>}
            </>
          )}
          {user?.isAdmin && <Link to="/admin" onClick={() => { scrollTo(0, 0); setisOpen(false); }} className="text-sky-300 hover:text-sky-200 transition-colors text-sm font-medium">Admin</Link>}

          {!user && (
            <>
              <button
                onClick={() => {
                  navigate("/login");
                  setisOpen(false);
                  scrollTo(0, 0);
                }}
                className="text-sm font-semibold px-5 py-2 rounded-full border border-orange-500/60 text-orange-400 hover:bg-orange-500/10 transition-colors cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => {
                  navigate("/signup");
                  setisOpen(false);
                  scrollTo(0, 0);
                }}
                className="text-sm font-semibold px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/30 transition-all cursor-pointer"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {user && (
          <div className="relative ml-4">
            <img
              src={user.avatar?.url || upload}
              alt="profile"
              className="w-10 h-10 rounded-full cursor-pointer object-cover ring-2 ring-orange-500/50 hover:ring-orange-400 transition-all"
              onClick={() => setMenuOpen((prev) => !prev)}
            />
            {menuOpen && (
              <div
                className="absolute right-0 top-12 z-50"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <Menu />
              </div>
            )}
          </div>
        )}

        <MenuIcon
          className="md:hidden w-7 h-7 cursor-pointer ml-6 text-orange-400"
          onClick={() => setisOpen(true)}
        />
      </div>
    </>
  );
};

export default Navbar;
