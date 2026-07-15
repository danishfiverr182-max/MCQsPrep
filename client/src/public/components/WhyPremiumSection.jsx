/**
 * src/public/components/WhyPremiumSection.jsx — NEW
 *
 * "Why Go Premium?" section between category cards and footer.
 * Features premium benefit cards + strong CTA.
 */

const BENEFITS = [
  {
    icon: "🎯",
    title: "All Categories Unlocked",
    desc: "Access Army, Navy, Air Force, KPPSC, FPSC, and every future category all in one subscription.",
    gradient: "from-purple-600 to-indigo-600",
  },
  {
    icon: "♾️",
    title: "Unlimited Mock Tests",
    desc: "No daily limits, no paywalls per test. Practice as much as you need to build real confidence.",
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    icon: "📊",
    title: "Detailed Performance Results",
    desc: "See exactly which questions you got right/wrong with full explanations after every test.",
    gradient: "from-emerald-600 to-teal-600",
  },
  {
    icon: "🔄",
    title: "Always Up-to-Date MCQs",
    desc: "Questions regularly updated to reflect the latest exam patterns and syllabus changes.",
    gradient: "from-orange-500 to-red-600",
  },
  {
    icon: "⚡",
    title: "Real Exam-Format Tests",
    desc: "Sections mirror actual test structure Verbal, Non-Verbal, Academic exactly as on test day.",
    gradient: "from-pink-600 to-rose-600",
  },
  {
    icon: "🏅",
    title: "Affordable Pricing",
    desc: "Just Rs. 300/week or Rs. 1,000/month. The best investment you'll make for your career.",
    gradient: "from-yellow-500 to-amber-600",
  },
];

export default function WhyPremiumSection({ onBuyPremiumClick }) {
  return (
    <section
      className="relative py-20 px-4 overflow-hidden"
      style={{ background: "var(--bg-why-premium)" }}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(108,99,255,0.5), transparent)" }}
        />
        <div
          className="orb-1 absolute -top-40 right-0 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6C63FF, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-5"
            style={{
              background: "rgba(245, 197, 66, 0.1)",
              border: "1px solid rgba(245, 197, 66, 0.3)",
              color: "#F5C542",
            }}
          >
            <span className="text-sm">👑</span>
            Premium Membership
          </span>
          <h2 className="font-heading font-black text-3xl md:text-4xl text-slate-900 dark:text-white mb-4">
            Why Go <span className="gradient-text-gold">Premium?</span>
          </h2>
          <p className="text-slate-600 dark:text-purple-300/70 text-base max-w-xl mx-auto">
            12,000+ students have already unlocked their full potential. Join them today.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {BENEFITS.map(({ icon, title, desc, gradient }) => (
            <div
              key={title}
              className="group p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 bg-white/60 border border-slate-300 dark:bg-white/5 dark:border-white/10 backdrop-blur-md"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(108,99,255,0.35)";
                e.currentTarget.style.background = "rgba(108,99,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.background = "";
              }}
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
              >
                {icon}
              </div>
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base mb-2">{title}</h3>
              <p className="text-slate-600 dark:text-purple-300/70 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(108,99,255,0.3) 0%, rgba(168,85,247,0.2) 50%, rgba(245,197,66,0.15) 100%)",
            border: "1px solid rgba(108,99,255,0.3)",
          }}
        >
          {/* Glow orb in background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(108,99,255,0.15) 0%, transparent 70%)" }}
          />

          <div className="relative z-10">
            <div className="text-5xl mb-4 animate-float">👑</div>
            <h3 className="font-heading font-black text-slate-900 dark:text-white text-2xl md:text-3xl mb-3">
              Ready to Ace Your Exam?
            </h3>
            <p className="text-slate-700 dark:text-purple-200/80 mb-2 text-base">
              Join <strong className="text-slate-900 dark:text-white">12,000+ students</strong> who've already prepared the smart way.
            </p>
            <p className="text-slate-600 dark:text-purple-300/60 text-sm mb-8">
              Pay via EasyPaisa or JazzCash · WhatsApp activation in minutes
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onBuyPremiumClick}
                className="relative group w-full sm:w-auto px-10 py-4 font-heading font-black text-base rounded-2xl text-navy transition-all duration-300 hover:scale-105 overflow-hidden"
                style={{ background: "linear-gradient(135deg, #F5C542 0%, #f09819 100%)" }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>👑</span>
                  Get Premium Access
                </span>
                {/* Shimmer */}
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                    transform: "skewX(-15deg)",
                    transition: "opacity 0.5s",
                  }}
                />
              </button>

              <div className="text-slate-600 dark:text-purple-300/70 text-sm">
                <span className="text-slate-900 dark:text-white font-bold">Rs. 300</span>/week ·{" "}
                <span className="text-slate-900 dark:text-white font-bold">Rs. 1,000</span>/month
              </div>
            </div>

            {/* Trust strip */}
            <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
              {["✅ Instant activation", "🔒 Secure payment", "📞 WhatsApp support"].map((item) => (
                <span key={item} className="text-xs text-slate-500 dark:text-purple-300/60">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
