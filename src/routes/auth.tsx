import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Repurpose" },
      { name: "description", content: "Sign in to Repurpose and turn one idea into every format." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState<string | null>(null); // email we asked them to confirm

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        // When email confirmation is enabled, signUp returns no session — the
        // user must confirm via email first. Don't bounce them into the
        // auth-gated /plans route; show a "check your inbox" state instead.
        if (!data.session) {
          setConfirmSent(email);
          return;
        }
        router.invalidate();
        navigate({ to: "/plans" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.invalidate();
        navigate({ to: "/" });
      }
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };


  const onGoogle = async () => {
    setErr(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setErr(result.error instanceof Error ? result.error.message : String(result.error));
      return;
    }
    if (result.redirected) return;
    router.invalidate();
    navigate({ to: "/" });
  };

  const shell = (children: React.ReactNode) => (
    <div style={{
      minHeight: "100vh",
      background: "#050506",
      color: "#f4f4f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 380,
        background: "#0f0f11",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        padding: 28,
      }}>
        {children}
      </div>
    </div>
  );

  if (confirmSent) {
    return shell(
      <>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: "rgba(47,227,155,0.12)",
          display: "grid", placeItems: "center", marginBottom: 18,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 7l8 5 8-5" stroke="#2fe39b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="#2fe39b" strokeWidth="2" />
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Confirm your email</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.5, margin: "0 0 22px" }}>
          We sent a confirmation link to <strong style={{ color: "#f4f4f6" }}>{confirmSent}</strong>.
          Open it to activate your account, then sign in.
        </p>
        <button
          onClick={() => { setConfirmSent(null); setMode("signin"); setPassword(""); }}
          style={{
            width: "100%", padding: "13px 14px", borderRadius: 12,
            background: "#2fe39b", color: "#062018", fontWeight: 700, fontSize: 14,
            border: "none", cursor: "pointer",
          }}
        >
          Back to sign in
        </button>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12.5, color: "rgba(255,255,255,0.45)" }}>
          Didn't get it? Check spam, or wait a minute and try signing in.
        </p>
      </>,
    );
  }

  return shell(
    <>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "#2fe39b",
            display: "grid", placeItems: "center", fontWeight: 800, color: "#062018",
          }}>R</div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Repurpose</div>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: "0 0 22px" }}>
          {mode === "signin" ? "Sign in to keep repurposing." : "3 free repurposes every month. Upgrade for unlimited."}
        </p>

        <button
          onClick={onGoogle}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 12,
            background: "#fff", color: "#0a0a0b", fontWeight: 600, fontSize: 14,
            border: "none", cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 10, marginBottom: 14,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.3 2.8l5.7-5.7C33.6 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.8 0 5.4 1.1 7.3 2.8l5.7-5.7C33.6 6.5 29 4.5 24 4.5 16.3 4.5 9.7 8.7 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-4.9c-2 1.5-4.4 2.4-6.9 2.4-5.3 0-9.7-2.9-11.3-7l-6.5 5C9.6 39.3 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6 4.9c-.4.4 6.7-4.9 6.7-14.2 0-1.2-.1-2.3-.4-3.5z"/></svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        <form onSubmit={onSubmit}>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Email</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            style={inputStyle} placeholder="you@studio.com"
          />
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 12, display: "block" }}>Password</label>
          <input
            type="password" required minLength={6} value={password}
            onChange={(e) => setPassword(e.target.value)} style={inputStyle}
            placeholder="••••••••"
          />
          {err && (
            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "#ffb4b4", fontSize: 12 }}>
              {err}
            </div>
          )}
          <button
            disabled={busy} type="submit"
            style={{
              marginTop: 18, width: "100%", padding: "13px 14px", borderRadius: 12,
              background: "#2fe39b", color: "#062018", fontWeight: 700, fontSize: 14,
              border: "none", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
          {mode === "signin" ? "New to Repurpose?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => { setErr(null); setMode(mode === "signin" ? "signup" : "signin"); }}
            style={{ background: "none", border: "none", color: "#2fe39b", fontWeight: 600, cursor: "pointer" }}
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </div>
    </>,
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "12px 14px",
  borderRadius: 12,
  background: "#161618",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#f4f4f6",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
};
