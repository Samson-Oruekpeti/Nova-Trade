// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newBalance, setNewBalance] = useState("");
  const [newProfit, setNewProfit] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [btcWallet, setBtcWallet] = useState("");
  const [walletMsg, setWalletMsg] = useState("");
  const [txFilter, setTxFilter] = useState("all");

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (!profile?.is_admin) { router.push("/dashboard"); return; }
      await loadData();
      setLoading(false);
    };
    checkAdmin();
  }, []);

  const loadData = async () => {
    const { data: u } = await supabase.from("profiles").select("*").eq("is_admin", false);
    setUsers(u || []);
    const { data: t } = await supabase.from("transactions").select("*, profiles(full_name, email)").order("created_at", { ascending: false });
    setTransactions(t || []);
    const { data: settings } = await supabase.from("settings").select("value").eq("key", "btc_wallet").single();
    if (settings?.value) setBtcWallet(settings.value);
  };

  const handleUpdateUser = async () => {
    await supabase.from("profiles").update({ balance: Number(newBalance), profit: Number(newProfit) }).eq("id", editingUser.id);
    setSaveMsg("✅ User updated!");
    setEditingUser(null);
    await loadData();
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const handleUpdateTxStatus = async (txId, status) => {
    await supabase.from("transactions").update({ status }).eq("id", txId);

    if (status === "Completed") {
      const tx = transactions.find(t => t.id === txId);
      if (!tx) return;

      const { data: profile } = await supabase.from("profiles").select("balance").eq("id", tx.user_id).single();
      const currentBalance = profile?.balance || 0;

      if (tx.type === "Deposit") {
        // Credit balance on deposit confirmation
        await supabase.from("profiles").update({ balance: currentBalance + tx.amount }).eq("id", tx.user_id);

      } else if (tx.type.startsWith("Buy ")) {
        // Deduct balance on buy confirmation
        const newBalance = Math.max(0, currentBalance - tx.amount);
        await supabase.from("profiles").update({ balance: newBalance }).eq("id", tx.user_id);

        // Update holdings — parse symbol from "Buy TSLA", shares and price from method field
        const symbol = tx.type.replace("Buy ", "").trim();
        // method format: "Market Order • 0.2930 shares @ $341.2"
        const sharesMatch = tx.method.match(/([\d.]+)\s*shares/);
        const priceMatch = tx.method.match(/\$\s*([\d.]+)/);
        const newShares = sharesMatch ? parseFloat(sharesMatch[1]) : 0;
        const buyPrice = priceMatch ? parseFloat(priceMatch[1]) : 0;

        if (newShares > 0 && buyPrice > 0) {
          const { data: existing } = await supabase.from("holdings").select("*").eq("user_id", tx.user_id).eq("symbol", symbol).single();
          if (existing) {
            // Update avg buy price and shares
            const totalShares = existing.shares + newShares;
            const avgPrice = ((existing.avg_buy_price * existing.shares) + (buyPrice * newShares)) / totalShares;
            await supabase.from("holdings").update({ shares: totalShares, avg_buy_price: avgPrice }).eq("id", existing.id);
          } else {
            // Create new holding
            await supabase.from("holdings").insert({ user_id: tx.user_id, symbol, shares: newShares, avg_buy_price: buyPrice });
          }
        }

      } else if (tx.type.startsWith("Sell ")) {
        // Credit balance on sell confirmation
        await supabase.from("profiles").update({ balance: currentBalance + tx.amount }).eq("id", tx.user_id);

        // Reduce or remove holding
        const symbol = tx.type.replace("Sell ", "").trim();
        const sharesMatch = tx.method.match(/([\d.]+)\s*shares/);
        const soldShares = sharesMatch ? parseFloat(sharesMatch[1]) : 0;

        if (soldShares > 0) {
          const { data: existing } = await supabase.from("holdings").select("*").eq("user_id", tx.user_id).eq("symbol", symbol).single();
          if (existing) {
            const remainingShares = existing.shares - soldShares;
            if (remainingShares <= 0.0001) {
              // Remove holding entirely
              await supabase.from("holdings").delete().eq("id", existing.id);
            } else {
              await supabase.from("holdings").update({ shares: remainingShares }).eq("id", existing.id);
            }
          }
        }

      } else if (tx.type === "Withdrawal") {
        // Deduct balance on withdrawal confirmation
        const newBalance = Math.max(0, currentBalance - tx.amount);
        await supabase.from("profiles").update({ balance: newBalance }).eq("id", tx.user_id);
      }
    }

    await loadData();
  };

  const handleSaveWallet = async () => {
    if (!btcWallet.trim()) { setWalletMsg("Please enter a valid wallet address."); return; }
    const { data: existing } = await supabase.from("settings").select("key").eq("key", "btc_wallet").single();
    if (existing) {
      await supabase.from("settings").update({ value: btcWallet }).eq("key", "btc_wallet");
    } else {
      await supabase.from("settings").insert({ key: "btc_wallet", value: btcWallet });
    }
    setWalletMsg("✅ BTC wallet updated! Users will see the new address.");
    setTimeout(() => setWalletMsg(""), 3000);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  if (loading) return <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "DM Sans, sans-serif" }}>Loading admin panel...</div>;

  const pendingCount = transactions.filter(t => t.status === "Pending").length;
  const pendingDeposits = transactions.filter(t => t.status === "Pending" && t.type === "Deposit").length;
  const pendingTrades = transactions.filter(t => t.status === "Pending" && (t.type.startsWith("Buy ") || t.type.startsWith("Sell "))).length;
  const pendingWithdrawals = transactions.filter(t => t.status === "Pending" && t.type === "Withdrawal").length;

  const filteredTx = txFilter === "all"
    ? transactions
    : txFilter === "deposits"
      ? transactions.filter(t => t.type === "Deposit")
      : txFilter === "trades"
        ? transactions.filter(t => t.type.startsWith("Buy ") || t.type.startsWith("Sell "))
        : transactions.filter(t => t.type === "Withdrawal");

  const getTxColor = (type) => {
    if (type === "Deposit") return "#4ade80";
    if (type === "Withdrawal") return "#f87171";
    if (type.startsWith("Buy ")) return "#3b82f6";
    if (type.startsWith("Sell ")) return "#f97316";
    return "#fff";
  };

  const s = {
    app: { display: "flex", minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif", color: "#fff" },
    sidebar: { width: "220px", background: "#0d0d12", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "24px 14px", display: "flex", flexDirection: "column" },
    logo: { fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, marginBottom: "8px", padding: "0 8px" },
    adminBadge: { background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", marginBottom: "24px", display: "inline-block", marginLeft: "8px" },
    navBtn: (active) => ({ width: "100%", textAlign: "left", background: active ? "rgba(255,255,255,0.08)" : "none", border: "none", color: active ? "#fff" : "#6b7280", padding: "11px 14px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: active ? 600 : 400, marginBottom: "4px" }),
    main: { flex: 1, padding: "28px", overflowY: "auto" },
    card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", marginBottom: "16px" },
    row: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px 16px", marginBottom: "8px", flexWrap: "wrap", gap: "8px" },
    badge: (color) => ({ background: color, color: "#000", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px" }),
    input: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" },
    btnWhite: { background: "#fff", color: "#000", border: "none", borderRadius: "8px", padding: "7px 14px", fontWeight: 700, fontSize: "12px", cursor: "pointer" },
    btnGreen: { background: "#22c55e", color: "#000", border: "none", borderRadius: "8px", padding: "7px 14px", fontWeight: 700, fontSize: "12px", cursor: "pointer" },
    btnRed: { background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 14px", fontWeight: 700, fontSize: "12px", cursor: "pointer" },
    btnOrange: { background: "#f7931a", color: "#000", border: "none", borderRadius: "10px", padding: "10px 20px", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginTop: "12px", width: "100%" },
    logoutBtn: { background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", borderRadius: "10px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", marginTop: "auto" },
    modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
    modalBox: { background: "#13131a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "400px" },
  };

  return (
    <div style={s.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <aside style={s.sidebar}>
        <div style={s.logo}>NovaTrade</div>
        <div style={s.adminBadge}>ADMIN</div>
        <nav>
          <button style={s.navBtn(activeTab === "users")} onClick={() => setActiveTab("users")}>👥 Users</button>
          <button style={s.navBtn(activeTab === "transactions")} onClick={() => setActiveTab("transactions")}>
            📋 Transactions {pendingCount > 0 && <span style={{ background: "#ef4444", borderRadius: "50%", padding: "1px 6px", fontSize: "10px", marginLeft: "6px" }}>{pendingCount}</span>}
          </button>
          <button style={s.navBtn(activeTab === "settings")} onClick={() => setActiveTab("settings")}>⚙️ Settings</button>
        </nav>
        <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
      </aside>

      <div style={s.main}>

        {/* USERS */}
        {activeTab === "users" && (
          <>
            <div style={{ marginBottom: "24px" }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: 800, margin: 0 }}>Manage Users</h1>
              <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>{users.length} registered trader{users.length !== 1 ? "s" : ""}</p>
            </div>

            {/* User stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "Total Users", value: users.length, color: "#fff" },
                { label: "Total Deposited", value: `$${users.reduce((sum, u) => sum + (u.balance || 0), 0).toLocaleString()}`, color: "#4ade80" },
                { label: "Total Profit Issued", value: `$${users.reduce((sum, u) => sum + (u.profit || 0), 0).toLocaleString()}`, color: "#fbbf24" },
              ].map(stat => (
                <div key={stat.label} style={s.card}>
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>{stat.label}</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: stat.color, marginTop: "4px" }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {saveMsg && <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "10px", padding: "10px 16px", color: "#4ade80", fontSize: "13px", marginBottom: "16px" }}>{saveMsg}</div>}
            {users.length === 0 && <p style={{ color: "#6b7280" }}>No users yet.</p>}
            {users.map(user => (
              <div key={user.id} style={s.row}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>{user.full_name || "No name"}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>{user.email}</div>
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>Balance</div>
                    <div style={{ fontSize: "14px", fontWeight: 700 }}>${(user.balance || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>Profit</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: (user.profit || 0) >= 0 ? "#4ade80" : "#f87171" }}>
                      {(user.profit || 0) >= 0 ? "" : "-"}${Math.abs(user.profit || 0).toLocaleString()}
                    </div>
                  </div>
                  <button style={s.btnWhite} onClick={() => { setEditingUser(user); setNewBalance(user.balance || 0); setNewProfit(user.profit || 0); }}>Edit</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* TRANSACTIONS */}
        {activeTab === "transactions" && (
          <>
            <div style={{ marginBottom: "24px" }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: 800, margin: 0 }}>Transactions</h1>
              <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>Confirm or reject deposits, trades, and withdrawals</p>
            </div>

            {/* Pending summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "Pending Deposits", value: pendingDeposits, color: "#4ade80" },
                { label: "Pending Trades", value: pendingTrades, color: "#3b82f6" },
                { label: "Pending Withdrawals", value: pendingWithdrawals, color: "#f87171" },
              ].map(stat => (
                <div key={stat.label} style={{ ...s.card, marginBottom: 0 }}>
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>{stat.label}</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: stat.value > 0 ? stat.color : "#6b7280", marginTop: "4px" }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {["all", "deposits", "trades", "withdrawals"].map(f => (
                <button key={f} onClick={() => setTxFilter(f)} style={{ background: txFilter === f ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: txFilter === f ? "#fff" : "#6b7280", borderRadius: "8px", padding: "5px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
                  {f}
                </button>
              ))}
            </div>

            {filteredTx.length === 0 && <p style={{ color: "#6b7280" }}>No transactions found.</p>}
            {filteredTx.map(tx => (
              <div key={tx.id} style={s.row}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: getTxColor(tx.type) }}>{tx.type}</div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{tx.profiles?.full_name || tx.profiles?.email || "Unknown"}</div>
                  <div style={{ fontSize: "11px", color: "#4b5563", marginTop: "2px" }}>{tx.method} • {new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ fontSize: "15px", fontWeight: 700 }}>${tx.amount.toLocaleString()}</div>
                  <span style={s.badge(tx.status === "Completed" ? "#4ade80" : tx.status === "Pending" ? "#fbbf24" : "#f87171")}>{tx.status}</span>
                  {tx.status === "Pending" && (
                    <>
                      <button style={s.btnGreen} onClick={() => handleUpdateTxStatus(tx.id, "Completed")}>Confirm</button>
                      <button style={s.btnRed} onClick={() => handleUpdateTxStatus(tx.id, "Rejected")}>Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <>
            <div style={{ marginBottom: "24px" }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: 800, margin: 0 }}>Settings</h1>
              <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>Manage your broker settings</p>
            </div>
            <div style={{ ...s.card, maxWidth: "520px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#f7931a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 900, color: "#fff" }}>₿</div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700 }}>BTC Deposit Wallet</div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>This is the address users will send Bitcoin to</div>
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>Bitcoin Wallet Address</div>
              <input style={s.input} type="text" placeholder="Enter your BTC wallet address" value={btcWallet} onChange={e => setBtcWallet(e.target.value)} />
              <button style={s.btnOrange} onClick={handleSaveWallet}>Save Wallet Address</button>
              {walletMsg && <p style={{ color: "#4ade80", fontSize: "13px", marginTop: "10px" }}>{walletMsg}</p>}
            </div>
          </>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div style={s.modal}>
          <div style={s.modalBox}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: 800, marginBottom: "6px" }}>Edit User</h2>
            <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "24px" }}>{editingUser.full_name || editingUser.email}</p>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "6px" }}>Balance ($)</label>
              <input style={s.input} type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "6px" }}>Profit / Returns ($)</label>
              <input style={s.input} type="number" value={newProfit} onChange={e => setNewProfit(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={s.btnGreen} onClick={handleUpdateUser}>Save Changes</button>
              <button style={{ background: "transparent", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "7px 14px", fontWeight: 700, fontSize: "12px", cursor: "pointer" }} onClick={() => setEditingUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}