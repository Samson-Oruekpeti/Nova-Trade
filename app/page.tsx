// @ts-nocheck
"use client";
import { useRouter } from "next/navigation";

const TICKER = [
  { symbol: "TSLA", change: "+4.12%", positive: true },
  { symbol: "AAPL", change: "+1.20%", positive: true },
  { symbol: "NVDA", change: "+6.80%", positive: true },
  { symbol: "AMZN", change: "+3.40%", positive: true },
  { symbol: "MSFT", change: "+0.90%", positive: true },
  { symbol: "GOOGL", change: "-1.20%", positive: false },
  { symbol: "META", change: "+5.20%", positive: true },
  { symbol: "NFLX", change: "-0.80%", positive: false },
  { symbol: "AMD", change: "+2.95%", positive: true },
  { symbol: "COIN", change: "+8.40%", positive: true },
  { symbol: "SPY", change: "+0.62%", positive: true },
  { symbol: "BRK.B", change: "-0.30%", positive: false },
];

const FEATURES = [
  {
    title: "Track",
    body: "Real-time prices pulled straight from the market, not stale snapshots. Your dashboard updates as the numbers move.",
    glyph: "◈",
  },
  {
    title: "Trade",
    body: "Buy and sell using your available balance. Every order is checked against your funds before it goes through.",
    glyph: "⇄",
  },
  {
    title: "Withdraw",
    body: "Move your funds out to your own wallet whenever you want. No middlemen holding your money hostage.",
    glyph: "↗",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const doubled = [...TICKER, ...TICKER];

  return (
    <div style={{ background: "#08080c", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#fff", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes novaPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.08); }
        }
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .nova-glow, .ticker-track { animation: none !important; }
        }
        @media (max-width: 720px) {
          .hero-title { font-size: 40px !important; }
          .feature-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", maxWidth: "1200px", margin: "0 auto" }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "20px", letterSpacing: "0.5px" }}>NOVA</span>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => router.push("/login")}
            style={{ background: "transparent", border: "none", color: "#9ca3af", fontSize: "14px", cursor: "pointer", padding: "8px 12px" }}
          >
            Log in
          </button>
          <button
            onClick={() => router.push("/login")}
            style={{ background: "#fff", color: "#000", border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", padding: "80px 32px 60px", textAlign: "center" }}>
        <div
          className="nova-glow"
          style={{
            position: "absolute", top: "-100px", left: "50%", transform: "translateX(-50%)",
            width: "700px", height: "700px", pointerEvents: "none", zIndex: 0,
            background: "radial-gradient(circle at 35% 35%, rgba(245,182,66,0.35), transparent 60%), radial-gradient(circle at 65% 60%, rgba(124,92,255,0.30), transparent 60%)",
            filter: "blur(60px)",
            animation: "novaPulse 6s ease-in-out infinite",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-block", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#f5b642", background: "rgba(245,182,66,0.1)", border: "1px solid rgba(245,182,66,0.25)", borderRadius: "20px", padding: "6px 14px", marginBottom: "24px" }}>
            LIVE MARKET DATA
          </div>
          <h1 className="hero-title" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "58px", lineHeight: 1.08, margin: "0 0 20px", letterSpacing: "-1px" }}>
            Markets move.<br />So should your money.
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "17px", maxWidth: "520px", margin: "0 auto 32px", lineHeight: 1.6 }}>
            Track live prices, trade with your balance, and move your crypto in and out — all from one dashboard.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
            <button
              onClick={() => router.push("/login")}
              style={{ background: "#fff", color: "#000", border: "none", borderRadius: "12px", padding: "14px 28px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}
            >
              Get started
            </button>
            <button
              onClick={() => router.push("/login")}
              style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", padding: "14px 28px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
            >
              Log in
            </button>
          </div>
        </div>
      </section>

      {/* Ticker strip */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", padding: "18px 0", background: "rgba(255,255,255,0.02)" }}>
        <div className="ticker-track" style={{ display: "flex", width: "max-content", animation: "tickerScroll 32s linear infinite" }}>
          {doubled.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 28px", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", whiteSpace: "nowrap" }}>
              <span style={{ color: "#fff", fontWeight: 500 }}>{t.symbol}</span>
              <span style={{ color: t.positive ? "#4ade80" : "#f87171" }}>{t.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "90px 32px" }}>
        <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "28px 24px" }}>
              <div style={{ fontSize: "22px", color: "#f5b642", marginBottom: "16px" }}>{f.glyph}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "19px", margin: "0 0 10px" }}>{f.title}</h3>
              <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preview panel */}
      <section style={{ maxWidth: "760px", margin: "0 auto", padding: "0 32px 100px" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(245,182,66,0.06), rgba(124,92,255,0.06))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "22px", padding: "32px", backdropFilter: "blur(20px)" }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#6b7280", margin: "0 0 6px" }}>PORTFOLIO BALANCE</p>
          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "36px", margin: "0 0 4px" }}>$24,918.42</p>
          <p style={{ color: "#4ade80", fontSize: "14px", margin: 0 }}>+ $1,204.10 today</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto", color: "#6b7280", fontSize: "13px" }}>
        <span>NOVA</span>
        <span
          onClick={() => router.push("/login")}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Log in
        </span>
      </footer>
    </div>
  );
}
