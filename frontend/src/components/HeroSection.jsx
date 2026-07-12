import React from "react";
import { Link } from "react-router-dom";
import CountUp from "./CountUp";
import Features from "./Features";
import matching from "../assets/matching.png";
import workflow from "../assets/workflow.jpg";
import waste from "../assets/waste.jpg";
import food from "../assets/food.jpg";
import bp from "../assets/bp.jpg";
import goonj from "../assets/goonj.jpg";
import Testimonials from "./Testimonials";
import Footer from "./Footer";

const HeroSection = () => {
  return (
    <div className="relative pt-16 md:pt-20 bg-[#0f172a]">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-orange-600/20 blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full bg-sky-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[100px]" />
      </div>

      {/* ── HERO ── */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12 lg:gap-16 pt-16 md:pt-24 pb-24 md:pb-32">

          {/* LEFT */}
          <div className="w-full md:w-3/5 text-white flex flex-col max-md:items-center fade-in-up">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-400 text-sm font-medium max-md:text-xs">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              Real-time food redistribution platform
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] max-md:text-center">
              <span className="text-white">Turning</span>{" "}
              <span className="mc-shimmer">Surplus</span>{" "}
              <span className="text-white">into</span>{" "}
              <span className="text-sky-400">Impact</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-xl max-md:text-center leading-relaxed">
              MealConnect bridges restaurants and food providers with NGOs to
              redistribute surplus meals — reducing waste, feeding communities,
              and creating measurable change.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="mc-btn-primary px-7 py-3.5 text-sm"
              >
                Start Connecting →
              </Link>
              <a
                href="#testimonials"
                className="mc-btn-outline px-7 py-3.5 text-sm"
              >
                See Stories
              </a>
            </div>

            {/* Mobile Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 md:hidden">
              {[
                { to: 673, label: "Meals Shared", color: "text-orange-400" },
                { to: 162, label: "Restaurants", color: "text-sky-400" },
                { to: 58,  label: "NGO Partners", color: "text-amber-400" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-2xl font-extrabold ${s.color}`}>
                    <CountUp from={0} to={s.to} separator="," direction="up" duration={1} className="count-up-text" />+
                  </div>
                  <div className="text-slate-400 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Stats card (Desktop) */}
          <div className="hidden md:flex justify-end w-full md:w-2/5">
            <div className="mc-glass rounded-2xl p-8 w-full max-w-sm space-y-6 fade-in-up">
              {[
                { to: 673, label: "Meals Shared",  color: "text-orange-400", icon: "🍱" },
                { to: 162, label: "Restaurants",   color: "text-sky-400",    icon: "🏪" },
                { to: 58,  label: "NGO Partners",  color: "text-amber-400",  icon: "🤝" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-4">
                  <span className="text-3xl">{s.icon}</span>
                  <div>
                    <div className={`text-4xl font-extrabold ${s.color}`}>
                      <CountUp from={0} to={s.to} separator="," direction="up" duration={1} className="count-up-text" />+
                    </div>
                    <div className="text-slate-300 font-medium mt-0.5">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── FEATURES ── */}
      <main className="relative z-10">
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
              How <span className="text-orange-400">MealConnect</span> Works
            </h2>
            <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto">
              A seamless three-step system that takes surplus food from kitchen to community.
            </p>
          </div>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <Features
              title="Real-time Matching"
              body="Restaurants post surplus food, and nearby NGOs get instant notifications through our live map."
              img={matching}
              name="Real-time Matching"
            />
            <Features
              title="Simple Workflow"
              body="Share surplus food in seconds — just add details and your post goes live instantly."
              img={workflow}
              name="Simple Workflow"
            />
            <Features
              title="Track & Report"
              body="Track collections, measure impact and get reports to help reduce waste and feed people."
              img={waste}
              name="Track and Report"
            />
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section
          id="testimonials"
          className="max-w-7xl mx-auto px-4 sm:px-6 py-24"
        >
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
              What Our <span className="text-sky-400">Partners</span> Say
            </h2>
            <p className="text-slate-400 mt-4 text-lg">
              Behind every saved meal is a story of hope — and we've seen thousands of them.
            </p>
          </div>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Testimonials
              quote="MealConnect helped us stop wasting perfectly good meals and feed people in our area."
              author="The Majestic Restaurant"
              type="Restaurant Partner"
              img={food}
            />
            <Testimonials
              quote="Super easy to claim posts and coordinate pickups — game changer for our volunteers."
              author="Goonj"
              type="Poverty Alleviation NGO"
              img={goonj}
            />
            <Testimonials
              quote="Fast matching and clear information — saved time and food every single week."
              author="6 Ballygunge Place"
              type="Restaurant Partner"
              img={bp}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HeroSection;
