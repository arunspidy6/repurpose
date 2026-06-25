import { useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckoutSession, createPortalSession } from "@/lib/payments.functions";
import { useServerFn } from "@tanstack/react-start";

interface PaywallProps {
  open: boolean;
  onClose: () => void;
  reason?: "limit" | "upgrade";
  used?: number;
  limit?: number;
}

export function Paywall({ open, onClose, reason = "limit", used = 0, limit = 3 }: PaywallProps) {
  const checkout = useServerFn(createCheckoutSession);
  const [showCheckout, setShowCheckout] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

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
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0f0f11",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 22,
          width: "100%",
          maxWidth: showCheckout ? 600 : 400,
          maxHeight: "90vh",
          overflow: "auto",
          color: "#f4f4f6",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {!showCheckout ? (
          <div style={{ padding: 28 }}>
            <div style={{
              display: "inline-flex", padding: "5px 10px", borderRadius: 999,
              background: "rgba(47,227,155,0.12)", color: "#2fe39b",
              fontSize: 11, fontWeight: 700, letterSpacing: 0.4, marginBottom: 14,
            }}>
              REPURPOSE PRO
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 6px" }}>
              {reason === "limit" ? "You're out of free repurposes" : "Go unlimited"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: "0 0 18px" }}>
              {reason === "limit"
                ? `You've used ${used} of ${limit} free repurposes this month. Upgrade to keep going.`
                : "Unlock unlimited repurposes and the full toolkit."}
            </p>

            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 18 }}>
              <span style={{ fontSize: 38, fontWeight: 800 }}>$19</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>/ month</span>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", display: "grid", gap: 10 }}>
              {[
                "Unlimited repurposes",
                "Brand voice memory",
                "Searchable content library",
                "Advanced exports",
                "All platform variants",
              ].map((f) => (
                <li key={f} style={{ display: "flex", gap: 10, fontSize: 14 }}>
                  <span style={{ color: "#2fe39b", fontWeight: 700 }}>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {err && (
              <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "#ffb4b4", fontSize: 12, marginBottom: 12 }}>
                {err}
              </div>
            )}

            <button
              onClick={() => { setErr(null); setShowCheckout(true); }}
              style={{
                width: "100%", padding: "14px", borderRadius: 12,
                background: "#2fe39b", color: "#062018", fontWeight: 700,
                fontSize: 15, border: "none", cursor: "pointer",
              }}
            >
              Upgrade to Pro
            </button>
            <button
              onClick={onClose}
              style={{
                width: "100%", padding: "12px", marginTop: 8, borderRadius: 12,
                background: "transparent", color: "rgba(255,255,255,0.6)",
                fontWeight: 500, fontSize: 14, border: "none", cursor: "pointer",
              }}
            >
              Maybe later
            </button>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 22, overflow: "hidden" }}>
            <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>
    </div>
  );
}

export function ManageBillingButton() {
  const portal = useServerFn(createPortalSession);
  const [busy, setBusy] = useState(false);
  const open = async () => {
    setBusy(true);
    try {
      const result = await portal({
        data: { environment: getStripeEnvironment(), returnUrl: window.location.origin },
      });
      if ("error" in result) {
        alert(result.error);
        return;
      }
      window.open(result.url, "_blank");
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      onClick={open}
      disabled={busy}
      style={{
        padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
        background: "rgba(255,255,255,0.08)", color: "#f4f4f6", border: "none",
        cursor: busy ? "wait" : "pointer",
      }}
    >
      {busy ? "Opening…" : "Manage billing"}
    </button>
  );
}
