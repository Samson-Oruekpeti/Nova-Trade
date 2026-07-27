// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

function generatePriceHistory(basePrice, trend = "up", days = 30) {
  const prices = [];
  let price = basePrice * (trend === "up" ? 0.82 : 1.18);
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - (trend === "up" ? 0.38 : 0.62)) * basePrice * 0.03;
    price = Math.max(price + change, basePrice * 0.5);
    prices.push(parseFloat(price.toFixed(2)));
  }
  prices.push(basePrice);
  return prices;
}

const STOCKS_BASE = [
  { name: "Tesla", symbol: "TSLA", price: 358.90, change: "+4.12%", positive: true, color: "#e11d48", bg: "#1a0a0d", domain: "tesla.com", volume: "98.4M", marketCap: "Large Cap", week52High: 488.54, week52Low: 138.80, history: generatePriceHistory(358.90, "up") },
  { name: "Apple", symbol: "AAPL", price: 221.30, change: "+1.20%", positive: true, color: "#a0a0a0", bg: "#111", domain: "apple.com", volume: "54.2M", marketCap: "Large Cap", week52High: 237.23, week52Low: 164.08, history: generatePriceHistory(221.30, "up") },
  { name: "Nvidia", symbol: "NVDA", price: 1138.60, change: "+6.80%", positive: true, color: "#22c55e", bg: "#0a1a0d", domain: "nvidia.com", volume: "41.7M", marketCap: "Large Cap", week52High: 1255.87, week52Low: 560.00, history: generatePriceHistory(1138.60, "up") },
  { name: "Amazon", symbol: "AMZN", price: 204.75, change: "+3.40%", positive: true, color: "#f59e0b", bg: "#1a140a", domain: "amazon.com", volume: "32.1M", marketCap: "Large Cap", week52High: 230.00, week52Low: 151.00, history: generatePriceHistory(204.75, "up") },
  { name: "Microsoft", symbol: "MSFT", price: 419.40, change: "+0.90%", positive: true, color: "#3b82f6", bg: "#0a0f1a", domain: "microsoft.com", volume: "18.5M", marketCap: "Large Cap", week52High: 468.35, week52Low: 344.79, history: generatePriceHistory(419.40, "up") },
  { name: "Google", symbol: "GOOGL", price: 176.20, change: "-1.20%", positive: false, color: "#10b981", bg: "#0a1a14", domain: "google.com", volume: "22.3M", marketCap: "Large Cap", week52High: 207.05, week52Low: 155.63, history: generatePriceHistory(176.20, "down") },
  { name: "Meta", symbol: "META", price: 531.80, change: "+5.20%", positive: true, color: "#f97316", bg: "#1a0f0a", domain: "meta.com", volume: "15.6M", marketCap: "Large Cap", week52High: 602.95, week52Low: 414.50, history: generatePriceHistory(531.80, "up") },
  { name: "Netflix", symbol: "NFLX", price: 676.40, change: "-0.80%", positive: false, color: "#dc2626", bg: "#1a0a0a", domain: "netflix.com", volume: "4.1M", marketCap: "Large Cap", week52High: 791.00, week52Low: 580.05, history: generatePriceHistory(676.40, "down") },
  { name: "AMD", symbol: "AMD", price: 174.90, change: "+2.95%", positive: true, color: "#a855f7", bg: "#110a1a", domain: "amd.com", volume: "47.9M", marketCap: "Large Cap", week52High: 227.30, week52Low: 121.12, history: generatePriceHistory(174.90, "up") },
  { name: "Coinbase", symbol: "COIN", price: 238.60, change: "+8.40%", positive: true, color: "#0ea5e9", bg: "#0a1218", domain: "coinbase.com", volume: "12.3M", marketCap: "Mid Cap", week52High: 283.50, week52Low: 115.00, history: generatePriceHistory(238.60, "up") },
  { name: "S&P 500 ETF", symbol: "SPY", price: 542.80, change: "+0.62%", positive: true, color: "#eab308", bg: "#151200", domain: null, volume: "71.2M", marketCap: "ETF", week52High: 564.87, week52Low: 491.95, history: generatePriceHistory(542.80, "up") },
  { name: "Berkshire", symbol: "BRK.B", price: 402.10, change: "-0.30%", positive: false, color: "#6b7280", bg: "#111", domain: null, volume: "3.8M", marketCap: "Large Cap", week52High: 454.78, week52Low: 362.10, history: generatePriceHistory(402.10, "down") },
];

// Uses Google's favicon service which returns transparent logos
function StockLogo({ stock, size = 36, fontSize = 15 }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = stock.domain
    ? `https://www.google.com/s2/favicons?domain=${stock.domain}&sz=128`
    : null;
  const showFallback = !logoUrl || imgError;

  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: stock.color + "22", border: `1px solid ${stock.color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", flexShrink: 0
    }}>
      {showFallback ? (
        <span style={{ fontSize, fontWeight: 800, color: stock.color }}>
          {stock.symbol[0]}
        </span>
      ) : (
        <img
          src={logoUrl}
          alt={stock.name}
          onError={() => setImgError(true)}
          style={{ width: size * 0.65, height: size * 0.65, objectFit: "contain" }}
        />
      )}
    </div>
  );
}

function MiniChart({ prices, color }) {
  const w = 100, h = 40;
  const min = Math.min(...prices), max = Math.max(...prices);
  const range = max - min || 1;
  const pts = prices.map((p, i) => `${(i / (prices.length - 1)) * w},${h - ((p - min) / range) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "40px" }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#grad-${color.replace("#", "")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function BigChart({ prices, color, symbol }) {
  const w = 340, h = 120;
  const min = Math.min(...prices), max = Math.max(...prices);
  const range = max - min || 1;
  const pts = prices.map((p, i) => `${(i / (prices.length - 1)) * w},${h - ((p - min) / range) * (h - 10) - 5}`).join(" ");
  const lastY = h - ((prices[prices.length - 1] - min) / range) * (h - 10) - 5;
  return (
    <div style={{ marginBottom: "20px" }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "120px" }}>
        <defs>
          <linearGradient id={`biggrad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#biggrad-${symbol})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <circle cx={w} cy={lastY} r="4" fill={color} />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>
        {["30d ago", "20d ago", "10d ago", "Today"].map(d => <span key={d}>{d}</span>)}
      </div>
    </div>
  );
}

const PAGE_TITLES = {
  dashboard: "Dashboard", portfolio: "My Portfolio",
  deposit: "Deposit", withdraw: "Withdraw", transactions: "Transactions"
};

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeType, setTradeType] = useState("buy");
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeMsg, setTradeMsg] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMessage, setDepositMessage] = useState("");
  const [btcWallet, setBtcWallet] = useState("bc1q7x9k2nvatradebtcwallet");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawWallet, setWithdrawWallet] = useState("");
  const [withdrawMsg, setWithdrawMsg] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [stockFilter, setStockFilter] = useState("all");
  const [stocks, setStocks] = useState(STOCKS_BASE);

  // Fetch live prices from Finnhub (via our own /api/quote route, which
  // keeps the API key server-side) and merge them into the static stock data.
  useEffect(() => {
    let cancelled = false;

    const fetchLivePrices = async () => {
      const updated = await Promise.all(
        STOCKS_BASE.map(async (stock) => {
          try {
            const res = await fetch(`/api/quote?symbol=${stock.symbol}`);
            const data = await res.json();
            if (!data || typeof data.c !== "number" || data.c === 0) return stock;
            const changePct = data.dp ?? 0;
            return {
              ...stock,
              price: data.c,
              change: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`,
              positive: changePct >= 0,
            };
          } catch {
            return stock; // fall back to static data if a single symbol fails
          }
        })
      );
      if (!cancelled) setStocks(updated);
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 60000); // refresh every 60s
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const loadData = async (userId) => {
    const { data: p } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(p);
    const { data: txns } = await supabase.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setTransactions(txns || []);
    const { data: h } = await supabase.from("holdings").select("*").eq("user_id", userId);
    setHoldings(h || []);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      await loadData(user.id);
      const { data: settings } = await supabase.from("settings").select("value").eq("key", "btc_wallet").single();
      if (settings?.value) setBtcWallet(settings.value);
      const saved = localStorage.getItem("watchlist");
      if (saved) setWatchlist(JSON.parse(saved));
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    document.title = `${PAGE_TITLES[activeTab] || "NovaTrade"} | NovaTrade`;
  }, [activeTab]);

  const toggleWatchlist = (symbol) => {
    setWatchlist(prev => {
      const updated = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      localStorage.setItem("watchlist", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) { setDepositMessage("Please enter a valid amount."); return; }
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("transactions").insert({ user_id: user.id, type: "Deposit", method: "Crypto - BTC", amount: Number(depositAmount), status: "Pending" });
    setDepositMessage("✅ Deposit request submitted successfully!");
    setDepositAmount("");
    await loadData(user.id);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0) { setWithdrawMsg("Please enter a valid amount."); return; }
    if (!withdrawWallet.trim()) { setWithdrawMsg("Please enter your BTC wallet address."); return; }
    if (Number(withdrawAmount) > (profile?.balance || 0)) { setWithdrawMsg("Insufficient balance."); return; }
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("transactions").insert({ user_id: user.id, type: "Withdrawal", method: `BTC - ${withdrawWallet}`, amount: Number(withdrawAmount), status: "Pending" });
    setWithdrawMsg("✅ Withdrawal request submitted successfully!");
    setWithdrawAmount(""); setWithdrawWallet("");
    await loadData(user.id);
  };

  const handleTrade = async () => {
    if (!tradeAmount || isNaN(tradeAmount) || Number(tradeAmount) <= 0) { setTradeMsg("Please enter a valid amount."); return; }
    if (tradeType === "buy" && Number(tradeAmount) > (profile?.balance || 0)) { setTradeMsg("Insufficient balance."); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const totalWithFee = (Number(tradeAmount) * 1.01).toFixed(2);
    const shares = (Number(tradeAmount) / selectedStock.price).toFixed(4);
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: tradeType === "buy" ? `Buy ${selectedStock.symbol}` : `Sell ${selectedStock.symbol}`,
      method: `Market Order • ${shares} shares @ $${selectedStock.price}`,
      amount: Number(totalWithFee),
      status: "Pending"
    });
    setTradeMsg(`✅ Order placed successfully!`);
    setTimeout(() => { setSelectedStock(null); setTradeMsg(""); setTradeAmount(""); }, 2000);
    await loadData(user.id);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };
  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert("Address copied!"); };
  const switchTab = (tab) => { setActiveTab(tab); setMobileMenuOpen(false); };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "DM Sans, sans-serif" }}>
      Loading...
    </div>
  );

  const totalBalance = (profile?.balance || 0) + (profile?.profit || 0);
  const profitPositive = (profile?.profit || 0) >= 0;
  const portfolioValue = holdings.reduce((sum, h) => { const s = stocks.find(s => s.symbol === h.symbol); return sum + (s ? s.price * h.shares : 0); }, 0);
  const portfolioCost = holdings.reduce((sum, h) => sum + (h.avg_buy_price * h.shares), 0);
  const portfolioPnL = portfolioValue - portfolioCost;
  const portfolioPnLPos = portfolioPnL >= 0;
  const filteredStocks = stockFilter === "watchlist" ? stocks.filter(s => watchlist.includes(s.symbol))
    : stockFilter === "gainers" ? stocks.filter(s => s.positive)
      : stockFilter === "losers" ? stocks.filter(s => !s.positive)
        : stocks;

  const inputStyle = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" };
  const cardStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" };
  const badgeStyle = (s) => ({ background: s === "Completed" ? "#4ade80" : s === "Pending" ? "#fbbf24" : "#f87171", color: "#000", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px" });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif", color: "#fff" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        @media(max-width:768px){.sidebar{display:none!important}.sidebar.open{display:flex!important;position:fixed;inset:0;z-index:999;width:100%!important}.main-content{padding:16px!important}.stats-grid{grid-template-columns:1fr 1fr!important}.stocks-grid{grid-template-columns:repeat(2,1fr)!important}.mobile-btn{display:flex!important}}
        @media(min-width:769px){.mobile-btn{display:none!important}}
        .stock-card{transition:all 0.2s;cursor:pointer}.stock-card:hover{transform:translateY(-3px)}
        .nav-tab:hover{background:rgba(255,255,255,0.06)!important;color:#fff!important}
        .filter-btn:hover{background:rgba(255,255,255,0.08)!important}
        .holding-row:hover{background:rgba(255,255,255,0.07)!important;cursor:pointer}
      `}</style>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`} style={{ width: "220px", background: "#0d0d12", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "24px 14px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800 }}>NovaTrade</div>
          <button className="mobile-btn" onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: "22px", cursor: "pointer", display: "none" }}>×</button>
        </div>
        <nav>
          {[
            { id: "dashboard", label: "📊 Dashboard" },
            { id: "portfolio", label: "💼 Portfolio" },
            { id: "deposit", label: "💰 Deposit" },
            { id: "withdraw", label: "📤 Withdraw" },
            { id: "transactions", label: "📋 Transactions" },
          ].map(tab => (
            <button key={tab.id} className="nav-tab" onClick={() => switchTab(tab.id)} style={{ width: "100%", textAlign: "left", background: activeTab === tab.id ? "rgba(255,255,255,0.08)" : "none", border: "none", color: activeTab === tab.id ? "#fff" : "#6b7280", padding: "11px 14px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: activeTab === tab.id ? 600 : 400, marginBottom: "4px" }}>
              {tab.label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: "auto" }}>
          <div style={{ ...cardStyle, marginBottom: "12px" }}>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>Logged in as</div>
            <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "4px", wordBreak: "break-all" }}>{profile?.full_name || profile?.email}</div>
            <div style={{ fontSize: "12px", color: "#4ade80", marginTop: "4px" }}>Active Trader</div>
          </div>
          <button onClick={handleLogout} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", borderRadius: "10px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", width: "100%" }}>Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content" style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, margin: 0 }}>{PAGE_TITLES[activeTab]}</h1>
            <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>Welcome back, {profile?.full_name || "Trader"} 👋</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {activeTab === "dashboard" && <button onClick={() => switchTab("deposit")} style={{ background: "#fff", color: "#000", border: "none", borderRadius: "10px", padding: "9px 18px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Deposit</button>}
            <button className="mobile-btn" onClick={() => setMobileMenuOpen(true)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", borderRadius: "10px", padding: "9px 14px", fontSize: "18px", cursor: "pointer", display: "none" }}>☰</button>
          </div>
        </div>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <>
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "24px" }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>Total Balance</div>
                <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "6px" }}>${totalBalance.toLocaleString()}</div>
                <div style={{ fontSize: "12px", color: "#4ade80", marginTop: "4px" }}>Deposit + Profit</div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>Deposited</div>
                <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "6px" }}>${(profile?.balance || 0).toLocaleString()}</div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Total deposited</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${profitPositive ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>Profit / Returns</div>
                <div style={{ fontSize: "26px", fontWeight: 700, color: profitPositive ? "#4ade80" : "#f87171", marginTop: "6px" }}>
                  {profitPositive ? "" : "-"}${Math.abs(profile?.profit || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: "12px", color: profitPositive ? "#4ade80" : "#f87171", marginTop: "4px" }}>{profitPositive ? "▲ In profit" : "▼ In loss"}</div>
              </div>
            </div>

            {/* Stocks */}
            <div style={{ ...cardStyle, marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ fontSize: "16px", fontWeight: 600 }}>📈 Live Markets</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  {["all", "gainers", "losers", "watchlist"].map(f => (
                    <button key={f} className="filter-btn" onClick={() => setStockFilter(f)} style={{ background: stockFilter === f ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: stockFilter === f ? "#fff" : "#6b7280", borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
                      {f === "gainers" ? "🟢 Gainers" : f === "losers" ? "🔴 Losers" : f === "watchlist" ? "⭐ Watchlist" : "All"}
                    </button>
                  ))}
                  <span style={{ fontSize: "11px", color: "#4ade80", background: "rgba(34,197,94,0.1)", padding: "4px 10px", borderRadius: "20px" }}>● Market Open</span>
                </div>
              </div>

              {filteredStocks.length === 0 && (
                <p style={{ color: "#6b7280", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>
                  {stockFilter === "watchlist" ? "No stocks in your watchlist yet. Star a stock to add it." : "No stocks found."}
                </p>
              )}

              <div className="stocks-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                {filteredStocks.map(stock => (
                  <div key={stock.symbol} style={{ position: "relative" }}>
                    <button onClick={(e) => { e.stopPropagation(); toggleWatchlist(stock.symbol); }}
                      style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "14px", zIndex: 2, color: watchlist.includes(stock.symbol) ? "#fbbf24" : "#4b5563" }}>
                      {watchlist.includes(stock.symbol) ? "⭐" : "☆"}
                    </button>
                    <div className="stock-card" onClick={() => setSelectedStock(stock)}
                      style={{ background: stock.bg, border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "14px", overflow: "hidden", height: "100%" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = stock.color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
                      <div style={{ marginBottom: "10px" }}><StockLogo stock={stock} size={36} fontSize={15} /></div>
                      <div style={{ fontSize: "13px", fontWeight: 700 }}>{stock.name}</div>
                      <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>{stock.symbol}</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "8px" }}>${stock.price.toLocaleString()}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px", marginBottom: "8px" }}>
                        <div style={{ fontSize: "11px", color: stock.positive ? "#4ade80" : "#f87171" }}>{stock.change}</div>
                        <div style={{ fontSize: "10px", color: "#4b5563" }}>Vol {stock.volume}</div>
                      </div>
                      <MiniChart prices={stock.history} color={stock.color} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={cardStyle}>
              <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "14px" }}>Recent Activity</div>
              {transactions.length === 0 && <p style={{ color: "#6b7280", fontSize: "13px" }}>No transactions yet.</p>}
              {transactions.slice(0, 5).map((tx, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px 14px", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{tx.type}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>{tx.method} • {new Date(tx.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700 }}>${tx.amount.toLocaleString()}</div>
                    <span style={badgeStyle(tx.status)}>{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PORTFOLIO */}
        {activeTab === "portfolio" && (
          <>
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "24px" }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>Portfolio Value</div>
                <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "6px" }}>${portfolioValue.toFixed(2)}</div>
                <div style={{ fontSize: "12px", color: "#818cf8", marginTop: "4px" }}>Current market value</div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>Total Invested</div>
                <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "6px" }}>${portfolioCost.toFixed(2)}</div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Avg cost basis</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${portfolioPnLPos ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: "16px", padding: "20px" }}>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>Total P&L</div>
                <div style={{ fontSize: "26px", fontWeight: 700, color: portfolioPnLPos ? "#4ade80" : "#f87171", marginTop: "6px" }}>
                  {portfolioPnLPos ? "+" : ""}${portfolioPnL.toFixed(2)}
                </div>
                <div style={{ fontSize: "12px", color: portfolioPnLPos ? "#4ade80" : "#f87171", marginTop: "4px" }}>
                  {portfolioCost > 0 ? `${portfolioPnLPos ? "▲" : "▼"} ${Math.abs((portfolioPnL / portfolioCost) * 100).toFixed(2)}%` : "No positions yet"}
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>Your Holdings</div>
              {holdings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
                  <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>No holdings yet</div>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>Buy your first stock to start building your portfolio</div>
                  <button onClick={() => switchTab("dashboard")} style={{ background: "#fff", color: "#000", border: "none", borderRadius: "10px", padding: "10px 20px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Browse Markets</button>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "12px", padding: "8px 14px", marginBottom: "8px" }}>
                    {["Asset", "Shares", "Avg Price", "Current", "P&L"].map(h => (
                      <div key={h} style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600 }}>{h}</div>
                    ))}
                  </div>
                  {holdings.map((holding, i) => {
                    const stock = stocks.find(s => s.symbol === holding.symbol);
                    if (!stock) return null;
                    const pnl = (stock.price - holding.avg_buy_price) * holding.shares;
                    const pnlPct = ((pnl / (holding.avg_buy_price * holding.shares)) * 100).toFixed(2);
                    const pnlPos = pnl >= 0;
                    return (
                      <div key={i} className="holding-row" onClick={() => setSelectedStock(stock)}
                        style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "14px", marginBottom: "8px", alignItems: "center", transition: "background 0.15s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <StockLogo stock={stock} size={36} fontSize={14} />
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 700 }}>{stock.name}</div>
                            <div style={{ fontSize: "11px", color: "#6b7280" }}>{stock.symbol}</div>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600 }}>{Number(holding.shares).toFixed(4)}</div>
                          <div style={{ fontSize: "11px", color: "#6b7280" }}>shares</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600 }}>${Number(holding.avg_buy_price).toFixed(2)}</div>
                          <div style={{ fontSize: "11px", color: "#6b7280" }}>avg cost</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600 }}>${stock.price.toLocaleString()}</div>
                          <div style={{ fontSize: "11px", color: stock.positive ? "#4ade80" : "#f87171" }}>{stock.change}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: pnlPos ? "#4ade80" : "#f87171" }}>{pnlPos ? "+" : ""}${pnl.toFixed(2)}</div>
                          <div style={{ fontSize: "11px", color: pnlPos ? "#4ade80" : "#f87171" }}>{pnlPos ? "▲" : "▼"} {Math.abs(pnlPct)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </>
        )}

        {/* DEPOSIT */}
        {activeTab === "deposit" && (
          <div style={{ maxWidth: "520px" }}>
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px", padding: "16px", background: "rgba(247,147,26,0.08)", borderRadius: "14px", border: "1px solid rgba(247,147,26,0.2)" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#f7931a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 900, color: "#fff", flexShrink: 0 }}>₿</div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700 }}>Bitcoin (BTC)</div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>Only send BTC to this address</div>
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>Your deposit address:</div>
              <div style={{ background: "#09090f", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#f7931a", overflowX: "auto", whiteSpace: "nowrap" }}>{btcWallet}</div>
              <button onClick={() => copyToClipboard(btcWallet)} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "11px", cursor: "pointer", marginTop: "8px" }}>📋 Copy Address</button>
              <div style={{ marginTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>Amount (USD equivalent)</div>
                <input style={inputStyle} type="number" placeholder="Enter amount e.g. 500" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
                <button onClick={handleDeposit} style={{ background: "#22c55e", color: "#000", border: "none", borderRadius: "10px", padding: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer", width: "100%", marginTop: "12px" }}>Submit Deposit Request</button>
                {depositMessage && <p style={{ color: "#4ade80", fontSize: "13px", marginTop: "10px" }}>{depositMessage}</p>}
              </div>
              <div style={{ marginTop: "16px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "10px", padding: "12px 14px", fontSize: "12px", color: "#fbbf24" }}>
                ⚠️ After sending BTC, submit your deposit request above and your account will be credited shortly.
              </div>
            </div>
          </div>
        )}

        {/* WITHDRAW */}
        {activeTab === "withdraw" && (
          <div style={{ maxWidth: "520px" }}>
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px", padding: "16px", background: "rgba(239,68,68,0.08)", borderRadius: "14px", border: "1px solid rgba(239,68,68,0.2)" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "#fff", flexShrink: 0 }}>📤</div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700 }}>Withdraw Funds</div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>Available: ${(profile?.balance || 0).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>Your BTC Wallet Address</div>
                <input style={inputStyle} type="text" placeholder="Enter your BTC wallet address" value={withdrawWallet} onChange={e => setWithdrawWallet(e.target.value)} />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>Amount (USD)</div>
                <input style={inputStyle} type="number" placeholder="Enter amount e.g. 200" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
              </div>
              <button onClick={handleWithdraw} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "10px", padding: "12px", fontWeight: 700, fontSize: "13px", cursor: "pointer", width: "100%" }}>Submit Withdrawal Request</button>
              {withdrawMsg && <p style={{ color: withdrawMsg.includes("✅") ? "#4ade80" : "#f87171", fontSize: "13px", marginTop: "10px" }}>{withdrawMsg}</p>}
              <div style={{ marginTop: "16px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "10px", padding: "12px 14px", fontSize: "12px", color: "#fbbf24" }}>
                ⚠️ Withdrawals are processed securely. Funds will be sent to your BTC wallet within 24 hours.
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {activeTab === "transactions" && (
          <div style={cardStyle}>
            <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "14px" }}>Transaction History</div>
            {transactions.length === 0 && <p style={{ color: "#6b7280", fontSize: "13px" }}>No transactions yet.</p>}
            {transactions.map((tx, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px 14px", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{tx.type}</div>
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>{tx.method} • {new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>${tx.amount.toLocaleString()}</div>
                  <span style={badgeStyle(tx.status)}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trade Modal */}
      {selectedStock && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "28px", width: "100%", maxWidth: "420px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <StockLogo stock={selectedStock} size={44} fontSize={16} />
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700 }}>{selectedStock.name}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>{selectedStock.symbol} • <span style={{ color: selectedStock.positive ? "#4ade80" : "#f87171" }}>{selectedStock.change}</span></div>
                </div>
              </div>
              <button onClick={() => { setSelectedStock(null); setTradeMsg(""); setTradeAmount(""); }} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "18px" }}>×</button>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "20px", fontWeight: 700 }}>${selectedStock.price.toLocaleString()}</span>
                <span style={{ fontSize: "12px", color: selectedStock.positive ? "#4ade80" : "#f87171", background: selectedStock.positive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", padding: "3px 8px", borderRadius: "6px" }}>{selectedStock.change} 30d</span>
              </div>
              <BigChart prices={selectedStock.history} color={selectedStock.color} symbol={selectedStock.symbol} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
              {[{ label: "52W High", value: `$${selectedStock.week52High.toLocaleString()}` }, { label: "52W Low", value: `$${selectedStock.week52Low.toLocaleString()}` }, { label: "Volume", value: selectedStock.volume }].map(item => (
                <div key={item.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: "#6b7280", marginBottom: "4px" }}>{item.label}</div>
                  <div style={{ fontSize: "12px", fontWeight: 700 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Current position if they hold this stock */}
            {(() => {
              const h = holdings.find(h => h.symbol === selectedStock.symbol);
              if (!h) return null;
              const pnl = (selectedStock.price - h.avg_buy_price) * h.shares;
              const pnlPos = pnl >= 0;
              return (
                <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", fontSize: "12px" }}>
                  <div style={{ fontWeight: 700, color: "#818cf8", marginBottom: "6px" }}>💼 Your Position</div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#9ca3af" }}>{Number(h.shares).toFixed(4)} shares @ ${Number(h.avg_buy_price).toFixed(2)}</span>
                    <span style={{ color: pnlPos ? "#4ade80" : "#f87171", fontWeight: 700 }}>{pnlPos ? "+" : ""}${pnl.toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}

            <div style={{ marginBottom: "16px" }}>
              <span style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "3px 10px", fontSize: "11px", color: "#9ca3af", fontWeight: 600 }}>{selectedStock.marketCap}</span>
            </div>

            <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "4px", marginBottom: "16px" }}>
              <button onClick={() => setTradeType("buy")} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: tradeType === "buy" ? "#22c55e" : "transparent", color: tradeType === "buy" ? "#000" : "#6b7280", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Buy</button>
              <button onClick={() => setTradeType("sell")} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: tradeType === "sell" ? "#ef4444" : "transparent", color: tradeType === "sell" ? "#fff" : "#6b7280", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Sell</button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>Amount (USD)</span>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>Available: <span style={{ color: "#fff", fontWeight: 600 }}>${(profile?.balance || 0).toLocaleString()}</span></span>
              </div>
              <input style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }} type="number" placeholder="Enter amount e.g. 100" value={tradeAmount} onChange={e => setTradeAmount(e.target.value)} />
            </div>

            {tradeAmount && !isNaN(tradeAmount) && Number(tradeAmount) > 0 && (
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", fontSize: "12px", color: "#9ca3af" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}><span>Estimated Shares</span><span style={{ color: "#fff" }}>{(Number(tradeAmount) / selectedStock.price).toFixed(4)} {selectedStock.symbol}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}><span>Market Fee (1%)</span><span style={{ color: "#fff" }}>${(Number(tradeAmount) * 0.01).toFixed(2)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#fff", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}><span>Total</span><span>${(Number(tradeAmount) * 1.01).toFixed(2)}</span></div>
              </div>
            )}

            {tradeMsg && <p style={{ color: tradeMsg.includes("Insufficient") ? "#f87171" : "#4ade80", fontSize: "13px", marginBottom: "12px" }}>{tradeMsg}</p>}

            <button onClick={handleTrade} style={{ width: "100%", background: tradeType === "buy" ? "#22c55e" : "#ef4444", color: tradeType === "buy" ? "#000" : "#fff", border: "none", borderRadius: "12px", padding: "14px", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
              {tradeType === "buy" ? "🟢 Place Buy Order" : "🔴 Place Sell Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}