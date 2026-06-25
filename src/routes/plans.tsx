import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckoutSession } from "@/lib/payments.functions";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Choose your plan — Repurpose" },
      {
        name: "description",
        content:
          "Start free with 3 repurposes a month, or go Pro for unlimited outputs, brand voice memory, and advanced exports.",
      },
    ],
  }),
  component: PlansPage,
});

type Step = "choose" | "checkout";

function PlansPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("choose");
  const [err, setErr] = useState<string | null>(null);
  const checkout = useServerFn(createCheckoutSession);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate({ to: "/auth" });
        return;
      }
      setEmail(data.user.email ?? null);
      setUserId(data.user.id);
    });
  }, [navigate]);

  const fetchClientSecret = async (): Promise<string> => {
    const result = await checkout({
      data: {
        priceId: "pro_monthly",
        returnUrl: `${window.location.origin}/?upgraded=1`,
        environment: getStripeEnvironment(),
      },
    });
    if ("error" in result) throw new Error(result.error);
    return result.clientSecret;
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050506",
        color: "#f4f4f6",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "48px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: 8, background: "#2fe39b",
            display: "grid", placeItems: "center", fontWeight: 800, color: "#062018",
          }}
        >
          R
        </div>
        <div style={{ fontWeight: 700, fontSize: 17 }}>Repurpose</div>
      </div>

      {step === "choose" ? (
        <>
          <div style={{ textAlign: "center", maxWidth: 540, marginBottom: 32 }}>
            <div
              style={{
                display: "inline-block", padding: "4px 10px", borderRadius: 999,
                background: "rgba(47,227,155,0.12)", color: "#2fe39b",
                fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 14,
              }}
            >
              STEP 2 OF 2
            </div>
            <h1
              style={{
                fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif",
                fontSize: 34, fontWeight: 800, letterSpacing: "-1px",
                margin: "0 0 10px",
              }}
            >
              Pick a plan to get started
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, margin: 0 }}>
              Start free — upgrade anytime. Cancel in one tap.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              width: "100%",
              maxWidth: 720,
            }}
          >
            {/* Free */}
            <div
              style={{
                background: "#0f0f11",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 22,
                padding: 24,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: 0.4 }}>
                FREE
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 800 }}>$0</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>/ month</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "8px 0 16px" }}>
                Perfect for trying Repurpose.
              </p>
              <PlanList items={[
                "3 repurposes per month",
                "Core platforms (X, LinkedIn, TikTok, Reels)",
                "Basic exports",
              ]} />
              <div style={{ flex: 1 }} />
              <button
                onClick={() => navigate({ to: "/" })}
                style={{
                  marginTop: 22, padding: "13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent", color: "#f4f4f6", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                Continue free
              </button>
            </div>

            {/* Pro */}
            <div
              style={{
                position: "relative",
                background: "linear-gradient(180deg, rgba(47,227,155,0.10), rgba(47,227,155,0.02))",
                border: "1px solid rgba(47,227,155,0.35)",
                borderRadius: 22,
                padding: 24,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  position: "absolute", top: 14, right: 14,
                  padding: "4px 9px", borderRadius: 999, background: "#2fe39b",
                  color: "#062018", fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
                }}
              >
                RECOMMENDED
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2fe39b", letterSpacing: 0.4 }}>
                PRO
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 800 }}>$19</span>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>/ month</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "8px 0 16px" }}>
                For creators publishing every day.
              </p>
              <PlanList items={[
                "Unlimited repurposes",
                "Brand voice memory",
                "Searchable content library",
                "Advanced exports (SRT, captions, CSV)",
                "All platform variants",
              ]} accent />
              <div style={{ flex: 1 }} />
              <button
                onClick={() => { setErr(null); setStep("checkout"); }}
                style={{
                  marginTop: 22, padding: "13px", borderRadius: 12, border: "none",
                  background: "#2fe39b", color: "#062018", fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}
              >
                Upgrade to Pro
              </button>
            </div>
          </div>

          {err && (
            <div
              style={{
                marginTop: 18, padding: "10px 14px", borderRadius: 10,
                background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)",
                color: "#ffb4b4", fontSize: 13,
              }}
            >
              {err}
            </div>
          )}

          <p style={{ marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            Signed in as {email ?? "…"}
          </p>
        </>
      ) : (
        <div style={{ width: "100%", maxWidth: 640 }}>
          <button
            onClick={() => setStep("choose")}
            style={{
              background: "transparent", border: "none", color: "rgba(255,255,255,0.6)",
              fontSize: 13, cursor: "pointer", padding: "0 0 14px", display: "inline-flex",
              alignItems: "center", gap: 6,
            }}
          >
            ← Back to plans
          </button>
          <div
            style={{
              background: "#fff", borderRadius: 22, overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanList({ items, accent }: { items: string[]; accent?: boolean }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
      {items.map((f) => (
        <li key={f} style={{ display: "flex", gap: 10, fontSize: 13.5, color: "rgba(255,255,255,0.85)" }}>
          <span style={{ color: accent ? "#2fe39b" : "rgba(255,255,255,0.55)", fontWeight: 700 }}>✓</span>
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}
