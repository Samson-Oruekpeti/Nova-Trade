"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuth = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }

      // Check if admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .single();

      if (profile?.is_admin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }

      // Create profile
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        email,
        balance: 0,
        profit: 0,
        is_admin: false,
      });

      setMessage("Account created! Please check your email to confirm, then log in.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0f0a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: "20px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px",
        padding: "40px 36px",
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, color: "#fff", margin: 0 }}>NovaTrade</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "6px" }}>
            {isLogin ? "Welcome back. Login to your dashboard." : "Create your trading account."}
          </p>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "12px 16px", color: "#f87171", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "12px", padding: "12px 16px", color: "#4ade80", fontSize: "13px", marginBottom: "16px" }}>
            {message}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "6px" }}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="John Doe"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "13px 16px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          )}
          <div>
            <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "6px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "13px 16px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "6px" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "13px 16px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button
            onClick={handleAuth}
            disabled={loading}
            style={{ width: "100%", background: loading ? "#374151" : "#fff", color: "#000", border: "none", borderRadius: "12px", padding: "14px", fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", marginTop: "6px" }}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>

          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "13px", marginTop: "8px" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => { setIsLogin(!isLogin); setError(""); setMessage(""); }}
              style={{ color: "#fff", cursor: "pointer", textDecoration: "underline" }}
            >
              {isLogin ? "Sign up" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
