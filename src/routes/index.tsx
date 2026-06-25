import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { getUsage, createPortalSession } from "@/lib/payments.functions";
import {
  generateRepurpose,
  regenerateOutput,
  listRepurposes,
  saveBrandVoice,
  getBrandVoice,
  type RepurposeRow,
} from "@/lib/repurpose.functions";
import {
  getProfile,
  saveProfile,
  DEFAULT_PREFERENCES,
  type Preferences,
} from "@/lib/profile.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { Paywall, ManageBillingButton } from "@/components/Paywall";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Repurpose — One idea in. Every format out." },
      {
        name: "description",
        content:
          "Repurpose turns one video, clip, caption, or rough idea into platform-native content for shorts, reels, X, LinkedIn, carousels and more.",
      },
      { property: "og:title", content: "Repurpose — One idea in. Every format out." },
      {
        property: "og:description",
        content:
          "A content variation engine for creators. Generate platform-native outputs in your own voice.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=Inter:wght@400;450;500;600;700&display=swap",
      },
    ],
  }),
  component: RepurposePrototype,
});

// ────────────────────────────────────────────────────────────────────────────
// iOS device frame (ported from ios-frame.jsx — dark only, no nav/keyboard)
// ────────────────────────────────────────────────────────────────────────────
function IOSStatusBar() {
  const c = "#fff";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "21px 34px 19px",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 20,
        width: "100%",
      }}
    >
      <span
        style={{
          fontFamily: '-apple-system, "SF Pro", system-ui',
          fontWeight: 590,
          fontSize: 17,
          lineHeight: "22px",
          color: c,
        }}
      >
        9:41
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <svg width="19" height="12" viewBox="0 0 19 12">
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill={c} />
          <rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill={c} />
          <rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill={c} />
          <rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill={c} />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12">
          <path
            d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z"
            fill={c}
          />
          <path
            d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z"
            fill={c}
          />
          <circle cx="8.5" cy="10.5" r="1.5" fill={c} />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={c} strokeOpacity="0.35" fill="none" />
          <rect x="2" y="2" width="20" height="9" rx="2" fill={c} />
          <path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill={c} fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

function IOSDevice({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 402,
        height: 874,
        borderRadius: 48,
        overflow: "hidden",
        position: "relative",
        background: "#000",
        boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
        fontFamily: "-apple-system, system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 11,
          left: "50%",
          transform: "translateX(-50%)",
          width: 126,
          height: 37,
          borderRadius: 24,
          background: "#000",
          zIndex: 50,
        }}
      />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
        <IOSStatusBar />
      </div>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>{children}</div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          height: 34,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          paddingBottom: 8,
          pointerEvents: "none",
        }}
      >
        <div style={{ width: 139, height: 5, borderRadius: 100, background: "rgba(255,255,255,0.7)" }} />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Data
// ────────────────────────────────────────────────────────────────────────────
type Platform = { id: string; name: string; sub: string; mono: string };

const PLATFORMS: Platform[] = [
  { id: "hooks", name: "Hook variations", sub: "5 scroll-stoppers", mono: "HK" },
  { id: "shorts", name: "Shorts script", sub: "Vertical video", mono: "SH" },
  { id: "reel", name: "Reel caption", sub: "Instagram Reels", mono: "RL" },
  { id: "tiktok", name: "TikTok caption", sub: "Caption + tags", mono: "TT" },
  { id: "captionvariants", name: "Caption variants", sub: "4 alt angles", mono: "CV" },
  { id: "remix", name: "Trend remix", sub: "Trending formats", mono: "TR" },
  { id: "abtest", name: "A/B versions", sub: "Two test angles", mono: "AB" },
  { id: "xthread", name: "X thread", sub: "Multi-post", mono: "X" },
  { id: "linkedin", name: "LinkedIn post", sub: "Professional", mono: "IN" },
  { id: "carousel", name: "IG carousel", sub: "Slide outline", mono: "IG" },
  { id: "newsletter", name: "Newsletter", sub: "Email intro", mono: "NL" },
  { id: "yttitle", name: "YouTube titles", sub: "Titles + thumbs", mono: "YT" },
];

const OUTPUTS_INIT: Record<string, string> = {
  hooks: `1. "I went 0 → 50K with one boring weekly habit."\n2. "Nobody talks about THIS part of growing an audience."\n3. "50,000 subscribers. Zero ads. Here's the system."\n4. "The growth advice that actually worked — not what you think."\n5. "What 78 weeks of shipping taught me about attention."\n\nUse #1 for cold audiences, #3 for proof-driven, #5 for story-led.`,
  captionvariants: `VARIANT A — Punchy\n50K subs in 18 months. No ads. One weekly system. Save this. 📌\n\nVARIANT B — Story\nMy newsletter had 0 readers 18 months ago. Today: 50,000. Here's the boring habit behind it.\n\nVARIANT C — Question\nWhat if consistency beat virality every time? 50K subscribers say it does.\n\nVARIANT D — Value-first\nThe exact weekly loop that grew my list to 50K: one essay, one swipe file, one CTA.`,
  remix: `FORMAT — "POV glow-up"\n"POV: you stopped chasing viral and your audience hit 50K anyway."\n\nFORMAT — Green-screen explainer\nReact to your own 0 → 50K chart; narrate the 3-step weekly system over it.\n\nFORMAT — On-screen listicle (trending audio)\n3 things that grew it / 2 that didn't / 1 I'd redo.\n\nFORMAT — Text-to-cut storytime\nHook → struggle (month 4, flat) → system → payoff (50K).`,
  abtest: `VERSION A — Contrarian hook\nVirality is overrated. I grew to 50,000 subscribers by being boringly consistent for 78 weeks straight. The system ↓\n\nVERSION B — Result-first hook\n0 → 50,000 subscribers in 18 months, no ads. The whole playbook fit on one index card. Here it is ↓\n\nTEST PLAN\nSame body + CTA — swap only the first two lines. Ship A to Stories, B to feed, keep the winner.`,
  shorts: `HOOK (0:00–0:03)\n"I went 0 → 50K subscribers — here's the part nobody talks about."\n\nBEAT 1 (0:03–0:11)\nEveryone obsesses over growth hacks. The real unlock was one boring, repeatable system.\n\nBEAT 2 (0:11–0:19)\nEvery week: one essay, one swipe file, one CTA. That's the whole machine.\n\nCTA (0:19–0:22)\nFollow for the exact weekly template I used →`,
  reel: `The newsletter advice no one gives you 👇\n\n50K subscribers in 18 months came down to consistency — not going viral.\n\nSave this for your next growth sprint.\n\n#newsletter #creatoreconomy #growthtips #buildinpublic`,
  tiktok: `POV: you stop chasing viral and start chasing consistent.\n\n50,000 subscribers. 18 months. One weekly system.\n\nThe creators winning right now aren't the loudest — they're the most repeatable.\n\n#creatortok #newslettertips #buildinpublic`,
  linkedin: `18 months ago my newsletter had 0 subscribers.\n\nToday it has 50,000.\n\nI didn't go viral. I didn't run ads. I did one boring thing exceptionally well: I shipped every single week.\n\nThe system:\n→ One core idea per issue\n→ A swipe file readers could steal\n→ A single, clear call to action\n\nConsistency compounds. The creators who win aren't the most talented — they're the ones still showing up in month 14 when no one's watching.\n\nWhat's the one habit that moved the needle for you?`,
  xthread: `1/ I grew a newsletter from 0 → 50,000 subscribers in 18 months.\n\nNo ads. No viral moment. Just one repeatable system. 🧵\n\n2/ The mistake most people make: chasing growth hacks.\n\nHacks spike. Systems compound.\n\n3/ My weekly loop:\n• 1 essay\n• 1 swipe file\n• 1 clear CTA\n\nSame structure. Every week. For 78 weeks.\n\n4/ Distribution beat perfection. A "good" issue shipped on time beat a "great" issue shipped late — every time.\n\n5/ Starting today? Pick one format and commit to 12 weeks before you judge it.\n\nFollow for the full template.`,
  carousel: `SLIDE 1 — Hook\n"0 → 50K subscribers in 18 months (no ads)"\n\nSLIDE 2 — The myth\nVirality is luck. Consistency is a choice.\n\nSLIDE 3 — The system\nOne essay + one swipe file + one CTA, weekly.\n\nSLIDE 4 — The proof\n78 weeks. Zero skipped sends.\n\nSLIDE 5 — The lesson\nThe algorithm rewards people who don't quit.\n\nSLIDE 6 — CTA\nSave this + follow for the template.`,
  newsletter: `Eighteen months ago, this newsletter didn't exist.\n\nThis week it crossed 50,000 subscribers — and I want to pull back the curtain on the part that actually mattered. It wasn't a viral tweet or a clever growth hack. It was a single, almost boring weekly system I refused to break.\n\nLet's get into it.`,
  yttitle: `1. How I Grew a Newsletter to 50,000 Subscribers (No Ads)\n2. The Boring System That Got Me 50K Subscribers\n3. 0 to 50,000 Subscribers in 18 Months — Full Breakdown\n4. Why Consistency Beats Going Viral (50K Proof)\n5. The Weekly Routine That Built My 50K Newsletter\n\nTHUMBNAIL IDEAS\n• Face + bold "50K" with a flat green progress line\n• Split: "Day 1: 0" vs "Day 540: 50,000"\n• Handwritten "78 weeks. 0 skipped."`,
};

type Project = {
  title: string;
  src: string;
  date: string;
  outputs: number;
  status: "Ready" | "Draft";
  formats: string[];
};

const PROJECTS: Project[] = [
  { title: "Newsletter growth playbook", src: "Long video · 24:18", date: "Today", outputs: 9, status: "Ready", formats: ["hooks", "shorts", "reel", "tiktok", "linkedin", "xthread", "carousel", "newsletter", "yttitle"] },
  { title: "My TikTok hook teardown", src: "Short video · 0:48", date: "Today", outputs: 6, status: "Ready", formats: ["hooks", "captionvariants", "reel", "tiktok", "remix", "abtest"] },
  { title: "How I price my freelance work", src: "Transcript · 3,420 words", date: "Yesterday", outputs: 6, status: "Ready", formats: ["hooks", "linkedin", "xthread", "newsletter", "yttitle", "abtest"] },
  { title: '"Consistency beats virality" — idea', src: "Rough idea · 1 line", date: "2d ago", outputs: 5, status: "Draft", formats: ["hooks", "reel", "tiktok", "xthread", "captionvariants"] },
  { title: "Cold outreach that actually works", src: "Long video · 12:04", date: "2d ago", outputs: 5, status: "Ready", formats: ["reel", "tiktok", "linkedin", "xthread", "carousel"] },
  { title: "Reel caption A/B test", src: "Caption · 180 words", date: "Last week", outputs: 4, status: "Ready", formats: ["captionvariants", "abtest", "hooks", "remix"] },
];

const VOICES = ["My main voice", "Punchy & casual", "LinkedIn pro"];
const SRC_TABS = [
  { id: "idea", label: "Rough idea" },
  { id: "caption", label: "Caption / post" },
  { id: "transcript", label: "Transcript" },
  { id: "youtube", label: "YouTube URL" },
];

const SAMPLE_POSTS = [
  { n: "1", text: "Most people don't need more discipline. They need a smaller first step. Shrink it until it's embarrassingly easy, then start." },
  { n: "2", text: "Your first 1,000 followers don't come from going viral. They come from being consistently useful to the same 50 people." },
  { n: "3", text: "I stopped trying to be impressive and started trying to be clear. Engagement doubled. Funny how that works." },
];

const VOICE_TRAITS = [
  { label: "Tone", value: "Direct · warm · a little punchy" },
  { label: "Avg length", value: "Short — 2–4 tight lines" },
  { label: "CTA style", value: "One soft question at the end" },
  { label: "Formatting", value: "Line breaks, no walls of text" },
  { label: "Emoji", value: "Rare — only on social captions" },
];

// ────────────────────────────────────────────────────────────────────────────
// Small helpers
// ────────────────────────────────────────────────────────────────────────────
const findP = (id: string) => PLATFORMS.find((p) => p.id === id)!;

function monoChip(accent: boolean): CSSProperties {
  return {
    width: 24,
    height: 24,
    borderRadius: 7,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 9.5,
    fontWeight: 700,
    marginRight: -6,
    border: "1.5px solid #141416",
    background: accent ? "#2fe39b" : "#2a2a2e",
    color: accent ? "#04140d" : "rgba(244,244,246,0.7)",
  };
}

const SRC_ICONS: Record<string, (c: string) => ReactNode> = {
  longvideo: (c) => (
    <>
      <rect x={3} y={6} width={13} height={12} rx={2.5} stroke={c} strokeWidth={2} />
      <path d="M16 10l5-3v10l-5-3v-4z" stroke={c} strokeWidth={2} strokeLinejoin="round" />
    </>
  ),
  shortvideo: (c) => (
    <>
      <rect x={7} y={3} width={10} height={18} rx={2.5} stroke={c} strokeWidth={2} />
      <path d="M11 9l4 3-4 3V9z" fill={c} />
    </>
  ),
  youtube: (c) => (
    <>
      <rect x={3} y={6} width={18} height={12} rx={3.5} stroke={c} strokeWidth={2} />
      <path d="M10 9.5l5 2.5-5 2.5v-5z" fill={c} />
    </>
  ),
  transcript: (c) => <path d="M5 5h14M5 10h14M5 15h9" stroke={c} strokeWidth={2} strokeLinecap="round" />,
  caption: (c) => (
    <>
      <path d="M4 5h16v11H9l-4 4v-4H4V5z" stroke={c} strokeWidth={2} strokeLinejoin="round" />
      <path d="M8 9.5h8M8 12.5h5" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
    </>
  ),
  idea: (c) => (
    <path
      d="M9 18h6M10 21h4M12 3a6 6 0 014 10.5c-.7.7-1 1.2-1 2.5H9c0-1.3-.3-1.8-1-2.5A6 6 0 0112 3z"
      stroke={c}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

const FIELD_LABELS: Record<string, string> = {
  youtube: "Paste a YouTube URL",
  transcript: "Paste your transcript",
  caption: "Paste a caption or post",
  idea: "Describe your idea",
};
const FIELD_PLACEHOLDERS: Record<string, string> = {
  youtube: "https://youtube.com/watch?v=...",
  transcript: "Paste the full transcript here — the more detail, the better.",
  caption: "Paste an existing caption, post, or thread you want to remix.",
  idea: 'e.g. "Why consistency beats virality — I grew my newsletter to 50K in 18 months by..."',
};

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────
type Screen = "onboarding" | "home" | "library" | "settings" | "new" | "results";

function RepurposePrototype() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const fetchUsage = useServerFn(getUsage);
  const generateFn = useServerFn(generateRepurpose);
  const regenerateFn = useServerFn(regenerateOutput);
  const listFn = useServerFn(listRepurposes);
  const loadBrandVoice = useServerFn(getBrandVoice);
  const saveBrandVoiceFn = useServerFn(saveBrandVoice);
  const loadProfile = useServerFn(getProfile);
  const saveProfileFn = useServerFn(saveProfile);
  const [usage, setUsage] = useState<{ used: number; limit: number; isPro: boolean } | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const openPortal = useServerFn(createPortalSession);
  const handleManageSubscription = async () => {
    if (!usage?.isPro) { setPaywallOpen(true); return; }
    try {
      const result = await openPortal({
        data: { environment: getStripeEnvironment(), returnUrl: window.location.origin },
      });
      if ("error" in result) { alert(result.error); return; }
      window.open(result.url, "_blank");
    } catch (e) {
      alert((e as Error).message);
    }
  };

  // start at home when authed (skip onboarding which is purely demo)
  const [screen, setScreen] = useState<Screen>(user ? "home" : "onboarding");
  const [obStep, setObStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [newStep, setNewStep] = useState(0);
  const [srcType, setSrcType] = useState("idea");
  const [sourceText, setSourceText] = useState("");
  const [selected, setSelected] = useState<string[]>(["hooks", "shorts", "reel", "xthread"]);
  const [voice, setVoice] = useState("My main voice");
  const [libFilter, setLibFilter] = useState("All");
  const [genIdx, setGenIdx] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [srcTitle, setSrcTitle] = useState("");
  const [srcMeta, setSrcMeta] = useState("");
  const [toast, setToast] = useState("");
  const [history, setHistory] = useState<RepurposeRow[]>([]);
  const [brandVoice, setBrandVoice] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  void srcMeta;

  // Fire a short haptic tap when the user has haptics enabled (web vibrate API).
  const haptic = () => {
    if (!prefs.haptics) return;
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(10);
    }
  };

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1700);
  };

  // Load usage when signed in
  const refreshUsage = async () => {
    if (!user) { setUsage(null); return; }
    try {
      const u = await fetchUsage({ data: { environment: getStripeEnvironment() } });
      setUsage({ used: u.used, limit: u.limit, isPro: u.isPro });
    } catch (e) {
      console.error(e);
    }
  };
  const refreshHistory = async () => {
    if (!user) { setHistory([]); return; }
    try {
      const rows = await listFn();
      setHistory(rows);
    } catch (e) { console.error(e); }
  };
  useEffect(() => {
    refreshUsage();
    refreshHistory();
    if (user) {
      loadBrandVoice().then((r) => setBrandVoice(r.brandVoice)).catch(() => {});
      loadProfile()
        .then((p) => {
          setDisplayName(p.displayName);
          setPrefs(p.preferences);
        })
        .catch(() => {});
    }
  /* eslint-disable-next-line */ }, [user?.id]);

  // After Stripe checkout returns
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("upgraded") === "1") {
      showToast("You're Pro — unlimited unlocked");
      url.searchParams.delete("upgraded");
      window.history.replaceState({}, "", url.toString());
      setTimeout(refreshUsage, 1200);
      setTimeout(refreshUsage, 3500);
    }
  // eslint-disable-next-line
  }, []);

  // analyze
  useEffect(() => {
    if (obStep === 2 && analyzing) {
      const t = setTimeout(() => setAnalyzing(false), 1700);
      return () => clearTimeout(t);
    }
  }, [obStep, analyzing]);

  // simulated progress while AI runs (purely visual; real result drives transition)
  useEffect(() => {
    if (screen !== "new" || newStep !== 2) return;
    // Respect the reduce-motion preference: skip the stepped animation.
    if (prefs.reduceMotion) {
      setGenIdx(Math.max(selected.length - 1, 0));
      return;
    }
    setGenIdx(0);
    const iv = setInterval(() => {
      setGenIdx((n) => Math.min(n + 1, Math.max(selected.length - 1, 0)));
    }, 700);
    return () => clearInterval(iv);
  }, [screen, newStep, selected.length, prefs.reduceMotion]);

  const togglePlatform = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const selectAll = () =>
    setSelected((s) => (s.length === PLATFORMS.length ? [] : PLATFORMS.map((p) => p.id)));

  const deriveTitle = (text: string, type: string) => {
    if (type === "youtube") return text.trim().slice(0, 80);
    const firstLine = text.trim().split(/\n/)[0] ?? "";
    return firstLine.length > 70 ? firstLine.slice(0, 70) + "…" : firstLine || "Untitled repurpose";
  };

  const startGenerate = async () => {
    if (!selected.length) { showToast("Pick at least one format"); return; }
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!sourceText.trim()) {
      showToast("Add your source first");
      setNewStep(0);
      return;
    }
    const title = deriveTitle(sourceText, srcType);
    setSrcTitle(title);
    setNewStep(2);
    setGenIdx(0);
    try {
      const result = await generateFn({
        data: {
          title,
          sourceType: srcType,
          sourceText: sourceText.trim(),
          platforms: selected,
          environment: getStripeEnvironment(),
        },
      });
      if (!result.ok) {
        if (result.reason === "limit_reached") {
          setNewStep(1);
          setPaywallOpen(true);
        } else if (result.reason === "rate_limited") {
          showToast("Rate limited. Try again in a moment.");
          setNewStep(1);
        } else if (result.reason === "credits_exhausted") {
          showToast("AI credits exhausted. Contact support.");
          setNewStep(1);
        } else {
          showToast(result.message || "Generation failed");
          setNewStep(1);
        }
        return;
      }
      setOutputs(result.outputs);
      setCurrentId(result.id);
      await Promise.all([refreshUsage(), refreshHistory()]);
      setScreen("results");
    } catch (e) {
      console.error(e);
      showToast((e as Error).message || "Couldn't generate");
      setNewStep(1);
    }
  };

  const openHistoryRow = (r: RepurposeRow) => {
    setSelected(r.platforms ?? []);
    setSrcTitle(r.title ?? "Untitled");
    setSrcMeta(r.source_type ?? "");
    setOutputs(r.outputs ?? {});
    setCurrentId(r.id);
    setScreen("results");
  };
  const openProject = (p: Project) => {
    setSelected(p.formats);
    setSrcTitle(p.title);
    setSrcMeta(p.src);
    setOutputs(OUTPUTS_INIT);
    setCurrentId(null); // demo project — no real row to regenerate against
    setScreen("results");
  };

  const copyText = (t: string) => {
    try {
      navigator.clipboard?.writeText(t);
    } catch {}
    showToast("Copied to clipboard");
  };

  // Regenerate a single platform's output against the existing repurpose row.
  const regenerateOne = async (platform: string) => {
    if (regeneratingId) return; // one at a time
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!currentId) {
      showToast("Generate this first to create variations");
      return;
    }
    setRegeneratingId(platform);
    haptic();
    try {
      const res = await regenerateFn({ data: { id: currentId, platform, environment: getStripeEnvironment() } });
      if (!res.ok) {
        if (res.reason === "rate_limited") showToast("Rate limited. Try again in a moment.");
        else if (res.reason === "credits_exhausted") showToast("AI credits exhausted. Contact support.");
        else showToast(res.message || "Couldn't regenerate");
        return;
      }
      setOutputs((o) => ({ ...o, [platform]: res.output }));
      haptic();
      showToast("New variation ready");
    } catch (e) {
      showToast((e as Error).message || "Couldn't regenerate");
    } finally {
      setRegeneratingId(null);
    }
  };

  // Export every generated output, honoring the user's Default export preference.
  const exportAll = async () => {
    const ids = selected.filter((id) => outputs[id]);
    if (!ids.length) { showToast("Nothing to export yet"); return; }
    const label = (id: string) => PLATFORMS.find((p) => p.id === id)?.name ?? id;
    const combined = ids.map((id) => `## ${label(id)}\n\n${outputs[id]}`).join("\n\n———\n\n");

    if (prefs.defaultExport === "copy") {
      try { await navigator.clipboard?.writeText(combined); } catch { /* clipboard unavailable */ }
      showToast(`Copied ${ids.length} outputs`);
      return;
    }

    if (prefs.defaultExport === "download") {
      try {
        const blob = new Blob([combined], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(srcTitle || "repurpose").replace(/[^\w-]+/g, "-").slice(0, 40)}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast(`Downloaded ${ids.length} outputs`);
      } catch {
        showToast("Download failed");
      }
      return;
    }

    // share (default)
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: srcTitle || "Repurpose", text: combined });
        return;
      } catch {
        // user cancelled or share unsupported — fall through to clipboard
      }
    }
    try { await navigator.clipboard?.writeText(combined); } catch { /* clipboard unavailable */ }
    showToast("Copied (sharing unavailable)");
  };

  const editP = editId ? findP(editId) : null;

  // ──── render screens ────
  return (
    <>
      <style>{`
        @keyframes rp-spin { to { transform: rotate(360deg); } }
        @keyframes rp-rise { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes rp-sheet { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes rp-toast { from { transform: translate(-50%, 12px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        .rp-scroll::-webkit-scrollbar { width: 0; height: 0; }
        .rp-scroll { scrollbar-width: none; }
        * { box-sizing: border-box; }
      `}</style>
      <PaymentTestModeBanner />
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "#050506",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 26,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div style={{
          width: "100%", maxWidth: 420, display: "flex",
          justifyContent: "space-between", alignItems: "center", gap: 8,
          marginBottom: 14, color: "#f4f4f6", fontSize: 13, minWidth: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexShrink: 1 }}>
            {user && usage && (
              <span style={{
                padding: "5px 10px", borderRadius: 999,
                background: usage.isPro ? "rgba(47,227,155,0.14)" : "rgba(255,255,255,0.08)",
                color: usage.isPro ? "#2fe39b" : "rgba(255,255,255,0.75)",
                fontWeight: 600, fontSize: 12, whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {usage.isPro ? "Pro · unlimited" : `${usage.used}/${usage.limit} this month`}
              </span>
            )}
            {user && usage && !usage.isPro && (
              <button
                onClick={() => setPaywallOpen(true)}
                style={{
                  padding: "5px 10px", borderRadius: 999, background: "#2fe39b",
                  color: "#062018", fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer",
                  whiteSpace: "nowrap", flexShrink: 0, lineHeight: 1,
                }}
              >Upgrade</button>
            )}
            {user && usage?.isPro && <ManageBillingButton />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, minWidth: 0 }}>
            {!authLoading && (user ? (
              <>
                <span style={{
                  color: "rgba(255,255,255,0.55)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  maxWidth: 160, minWidth: 0,
                }}>{user.email}</span>
                <TopBarMenu
                  isPro={!!usage?.isPro}
                  onBrandVoice={() => setScreen("settings")}
                  onSubscription={handleManageSubscription}
                  onSignOut={() => signOut()}
                />
              </>
            ) : (
              <button
                onClick={() => navigate({ to: "/auth" })}
                style={{
                  padding: "7px 14px", borderRadius: 999, background: "#2fe39b",
                  color: "#062018", fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer",
                  whiteSpace: "nowrap", flexShrink: 0, lineHeight: 1,
                }}
              >Sign in</button>
            ))}
          </div>


        </div>

        <IOSDevice>
          <div
            style={{
              position: "relative",
              height: "100%",
              width: "100%",
              background: "#0a0a0b",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              color: "#f4f4f6",
            }}
          >
            {screen === "onboarding" && (
              <OnboardingScreen
                obStep={obStep}
                analyzing={analyzing}
                onNext={() => setObStep(obStep + 1)}
                onSkip={() => setScreen("home")}
                onAnalyze={() => {
                  setObStep(2);
                  setAnalyzing(true);
                }}
                onAddPost={() => showToast("Post added to voice sample")}
                onFinish={() => setScreen("home")}
              />
            )}

            {(screen === "home" || screen === "library" || screen === "settings") && (
              <MainTabs
                screen={screen}
                onGo={setScreen}
                onStartNew={() => {
                  setNewStep(0);
                  setSourceText("");
                  setScreen("new");
                }}
                onOpenProject={openProject}
                onOpenHistory={openHistoryRow}
                history={history}
                libFilter={libFilter}
                setLibFilter={setLibFilter}
                voice={voice}
                brandVoice={brandVoice}
                onSaveBrandVoice={async (v) => {
                  setBrandVoice(v);
                  try {
                    await saveBrandVoiceFn({ data: { brandVoice: v } });
                    haptic();
                    showToast("Brand voice saved");
                  } catch (e) { showToast((e as Error).message); }
                }}
                userEmail={user?.email ?? ""}
                isPro={!!usage?.isPro}
                displayName={displayName}
                onSaveDisplayName={async (name) => {
                  const prev = displayName;
                  setDisplayName(name);
                  try {
                    const saved = await saveProfileFn({ data: { displayName: name } });
                    setDisplayName(saved.displayName);
                    haptic();
                    showToast("Profile saved");
                  } catch (e) {
                    setDisplayName(prev);
                    showToast((e as Error).message);
                  }
                }}
                prefs={prefs}
                onUpdatePref={async (patch) => {
                  const prev = prefs;
                  const next = { ...prefs, ...patch };
                  setPrefs(next); // optimistic
                  haptic();
                  try {
                    const saved = await saveProfileFn({ data: { preferences: patch } });
                    setPrefs(saved.preferences);
                  } catch (e) {
                    setPrefs(prev);
                    showToast((e as Error).message);
                  }
                }}
                onSignOut={async () => {
                  try {
                    await signOut();
                    setScreen("onboarding");
                  } catch (e) { showToast((e as Error).message); }
                }}
                showToast={showToast}
              />
            )}

            {screen === "new" && (
              <NewFlow
                newStep={newStep}
                srcType={srcType}
                setSrcType={setSrcType}
                sourceText={sourceText}
                setSourceText={setSourceText}
                selected={selected}
                togglePlatform={togglePlatform}
                selectAll={selectAll}
                voice={voice}
                setVoice={setVoice}
                genIdx={genIdx}
                onExit={() => setScreen("home")}
                onNextFromImport={() => {
                  if (!sourceText.trim()) { showToast("Add some source text first"); return; }
                  setNewStep(1);
                }}
                onGenerate={startGenerate}
              />
            )}

            {screen === "results" && (
              <Results
                selected={selected}
                srcTitle={srcTitle}
                voice={voice}
                outputs={outputs}
                onExit={() => setScreen("home")}
                onOpenOutput={(id) => setEditId(id)}
                onCopy={(id) => copyText(outputs[id])}
                onSave={() => showToast("Saved to library")}
                onSendScheduler={() => showToast("Sent to your scheduler")}
                onExportAll={exportAll}
                onRegenerate={regenerateOne}
                regeneratingId={regeneratingId}
              />
            )}

            {editId && editP && (
              <EditorSheet
                platform={editP}
                text={outputs[editId]}
                onChange={(t) => setOutputs({ ...outputs, [editId]: t })}
                onClose={() => setEditId(null)}
                onCopy={() => copyText(outputs[editId])}
                onShare={() => showToast("Opening share sheet…")}
                onRegenerate={() => regenerateOne(editId)}
                regenerating={regeneratingId === editId}
              />
            )}

            {toast && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 108,
                  transform: "translateX(-50%)",
                  zIndex: 80,
                  background: "#1f1f22",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 13,
                  padding: "12px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  boxShadow: "0 12px 34px rgba(0,0,0,0.5)",
                  animation: "rp-toast .25s ease",
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#2fe39b" />
                  <path d="M7.5 12.5l3 3 6-6.5" stroke="#04140d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: "#f4f4f6", whiteSpace: "nowrap" }}>{toast}</span>
              </div>
            )}
          </div>
        </IOSDevice>
      </div>
      <Paywall
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason={usage && usage.used >= usage.limit ? "limit" : "upgrade"}
        used={usage?.used ?? 0}
        limit={usage?.limit ?? 3}
      />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Screens
// ────────────────────────────────────────────────────────────────────────────
function OnboardingScreen({
  obStep,
  analyzing,
  onNext,
  onSkip,
  onAnalyze,
  onAddPost,
  onFinish,
}: {
  obStep: number;
  analyzing: boolean;
  onNext: () => void;
  onSkip: () => void;
  onAnalyze: () => void;
  onAddPost: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="rp-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      {obStep === 0 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 26px 32px" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              gap: 26,
              paddingTop: 40,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 44px)", gap: 9, transform: "rotate(-4deg)" }}>
              {PLATFORMS.slice(0, 8).map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    ...(i % 3 === 0
                      ? { background: "#2fe39b", color: "#04140d" }
                      : {
                          background: "#19191c",
                          color: "rgba(244,244,246,0.6)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }),
                  }}
                >
                  {p.mono}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <h1 style={{ fontFamily: "'Inter Tight'", fontWeight: 800, fontSize: 40, letterSpacing: "-1.6px", lineHeight: 1, margin: 0 }}>
                Repurpose
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.45, color: "rgba(244,244,246,0.6)", maxWidth: 290, fontWeight: 450, margin: 0 }}>
                One idea in. Every format out. Your content variation engine — turn any video, clip, caption, or rough idea into platform-native content.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={onNext} style={primaryBtn}>Get started</button>
            <button onClick={onSkip} style={ghostBtn}>I'll set up my voice later</button>
          </div>
        </div>
      )}

      {obStep === 1 && (
        <div style={{ padding: "64px 22px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "1.4px", color: "#2fe39b", textTransform: "uppercase" }}>
              Step 1 of 2 · Brand voice
            </div>
            <h2 style={{ fontFamily: "'Inter Tight'", fontWeight: 800, fontSize: 30, letterSpacing: "-1px", lineHeight: 1.08, margin: 0 }}>
              Teach it how you write
            </h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.45, color: "rgba(244,244,246,0.55)", margin: 0 }}>
              Paste 3–5 posts you're proud of. Repurpose learns your tone, length, and CTA habits — then writes everything in your voice.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {SAMPLE_POSTS.map((s) => (
              <div
                key={s.n}
                style={{
                  background: "#141416",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 15,
                  padding: "14px 15px",
                  display: "flex",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: "rgba(47,227,155,0.12)",
                    color: "#2fe39b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {s.n}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(244,244,246,0.78)" }}>{s.text}</div>
              </div>
            ))}
            <button
              onClick={onAddPost}
              style={{
                height: 48,
                border: "1px dashed rgba(255,255,255,0.15)",
                borderRadius: 15,
                background: "transparent",
                color: "rgba(244,244,246,0.55)",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              + Paste another post
            </button>
          </div>
          <button onClick={onAnalyze} style={{ ...primaryBtn, marginTop: 4 }}>Analyze my voice</button>
        </div>
      )}

      {obStep === 2 && (
        <div style={{ padding: "64px 22px 24px", display: "flex", flexDirection: "column", gap: 20, minHeight: "100%" }}>
          {analyzing ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 22,
                textAlign: "center",
                minHeight: 520,
              }}
            >
              <Spinner />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontFamily: "'Inter Tight'", fontWeight: 700, fontSize: 21 }}>Reading your voice…</div>
                <div style={{ fontSize: 14.5, color: "rgba(244,244,246,0.5)" }}>Finding tone, rhythm, and your go-to CTAs</div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "rp-rise .4s ease" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 13,
                      background: "rgba(47,227,155,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#2fe39b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 style={{ fontFamily: "'Inter Tight'", fontWeight: 800, fontSize: 28, letterSpacing: "-0.9px", lineHeight: 1.1, margin: 0 }}>
                    Here's your voice
                  </h2>
                  <p style={{ fontSize: 15, color: "rgba(244,244,246,0.55)", margin: 0 }}>
                    We'll write every output to match this. Edit it anytime in Settings.
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {VOICE_TRAITS.map((t) => (
                    <div
                      key={t.label}
                      style={{
                        background: "#141416",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 14,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 14,
                      }}
                    >
                      <span style={{ fontSize: 14, color: "rgba(244,244,246,0.5)", fontWeight: 500 }}>{t.label}</span>
                      <span style={{ fontSize: 14.5, color: "#f4f4f6", fontWeight: 600, textAlign: "right" }}>{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={onFinish} style={{ ...primaryBtn, marginTop: "auto" }}>Save brand voice</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MainTabs({
  screen,
  onGo,
  onStartNew,
  onOpenProject,
  onOpenHistory,
  history,
  libFilter,
  setLibFilter,
  voice,
  brandVoice,
  onSaveBrandVoice,
  userEmail,
  isPro,
  displayName,
  onSaveDisplayName,
  prefs,
  onUpdatePref,
  onSignOut,
  showToast,
}: {
  screen: Screen;
  onGo: (s: Screen) => void;
  onStartNew: () => void;
  onOpenProject: (p: Project) => void;
  onOpenHistory: (r: RepurposeRow) => void;
  history: RepurposeRow[];
  libFilter: string;
  setLibFilter: (f: string) => void;
  voice: string;
  brandVoice: string;
  onSaveBrandVoice: (v: string) => void;
  userEmail: string;
  isPro: boolean;
  displayName: string;
  onSaveDisplayName: (name: string) => void;
  prefs: Preferences;
  onUpdatePref: (patch: Partial<Preferences>) => void;
  onSignOut: () => void;
  showToast: (m: string) => void;
}) {
  const TABS: { id: Screen; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "library", label: "Library" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <>
      <div className="rp-scroll" style={{ flex: 1, overflowY: "auto", paddingBottom: 96 }}>
        {screen === "home" && (
          <HomeView
            onStartNew={onStartNew}
            onOpenProject={onOpenProject}
            onOpenHistory={onOpenHistory}
            history={history}
            onSeeAll={() => onGo("library")}
          />
        )}
        {screen === "library" && (
          <LibraryView
            libFilter={libFilter}
            setLibFilter={setLibFilter}
            onOpenProject={onOpenProject}
            onOpenHistory={onOpenHistory}
            history={history}
          />
        )}
        {screen === "settings" && (
          <SettingsView
            voice={voice}
            showToast={showToast}
            brandVoice={brandVoice}
            onSaveBrandVoice={onSaveBrandVoice}
            userEmail={userEmail}
            isPro={isPro}
            displayName={displayName}
            onSaveDisplayName={onSaveDisplayName}
            prefs={prefs}
            onUpdatePref={onUpdatePref}
            onSignOut={onSignOut}
          />
        )}
      </div>


      {/* tab bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "8px 30px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          background: "linear-gradient(to top, #0a0a0b 62%, rgba(10,10,11,0))",
          zIndex: 30,
        }}
      >
        {TABS.map((t) => {
          const active = screen === t.id;
          const c = active ? "#2fe39b" : "rgba(244,244,246,0.42)";
          return (
            <div
              key={t.id}
              onClick={() => onGo(t.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                cursor: "pointer",
                paddingTop: 6,
              }}
            >
              <TabIcon kind={t.id} color={c} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: c }}>{t.label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TabIcon({ kind, color }: { kind: string; color: string }) {
  const common = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none" } as const;
  if (kind === "home")
    return (
      <svg {...common}>
        <path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-8z" stroke={color} strokeWidth={1.9} strokeLinejoin="round" />
      </svg>
    );
  if (kind === "library")
    return (
      <svg {...common}>
        <rect x={4} y={4} width={16} height={16} rx={3} stroke={color} strokeWidth={1.9} />
        <path d="M9 9h6M9 13h6M9 17h3" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx={12} cy={12} r={3.2} stroke={color} strokeWidth={1.9} />
      <path
        d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18 6l-1.8 1.8M7.8 16.2L6 18M18 18l-1.8-1.8M7.8 7.8L6 6"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </svg>
  );
}

function HomeView({
  onStartNew,
  onOpenProject,
  onOpenHistory,
  history,
  onSeeAll,
}: {
  onStartNew: () => void;
  onOpenProject: (p: Project) => void;
  onOpenHistory: (r: RepurposeRow) => void;
  history: RepurposeRow[];
  onSeeAll: () => void;
}) {
  const recent = PROJECTS.slice(0, 4);
  void onOpenProject;
  void recent;
  const hasReal = history.length > 0;
  return (
    <div style={{ padding: "60px 20px 8px", display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontSize: 14, color: "rgba(244,244,246,0.45)", fontWeight: 500 }}>Good morning, Maya</span>
          <span style={{ fontFamily: "'Inter Tight'", fontWeight: 800, fontSize: 27, letterSpacing: "-0.9px" }}>Repurpose</span>
        </div>
        <Avatar />
      </div>

      <div
        style={{
          background: "#141416",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 18,
          padding: "16px 17px",
          display: "flex",
          flexDirection: "column",
          gap: 13,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, color: "rgba(244,244,246,0.6)", fontWeight: 500 }}>Free plan · this month</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#2fe39b" }}>Upgrade</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
          <span style={{ fontFamily: "'Inter Tight'", fontSize: 26, fontWeight: 800, letterSpacing: "-1px" }}>3</span>
          <span style={{ fontSize: 14, color: "rgba(244,244,246,0.45)" }}>of 5 repurposes used</span>
        </div>
        <div style={{ height: 7, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: "60%", borderRadius: 99, background: "#2fe39b" }} />
        </div>
      </div>

      <button
        onClick={onStartNew}
        style={{
          height: 60,
          border: "none",
          borderRadius: 18,
          background: "#2fe39b",
          color: "#04140d",
          fontSize: 18,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          fontFamily: "'Inter Tight'",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="#04140d" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
        New repurpose
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Inter Tight'", letterSpacing: "-0.4px" }}>Recent</span>
          <span onClick={onSeeAll} style={{ fontSize: 14, color: "rgba(244,244,246,0.45)", cursor: "pointer" }}>
            See all
          </span>
        </div>
        {!hasReal && (
          <div style={{ padding: 18, borderRadius: 16, background: "#141416", border: "1px dashed rgba(255,255,255,0.1)",
            color: "rgba(244,244,246,0.55)", fontSize: 14, lineHeight: 1.5 }}>
            No repurposes yet. Tap “New repurpose” to generate your first set of platform-native outputs.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {history.slice(0, 4).map((r) => (
            <div
              key={r.id}
              onClick={() => onOpenHistory(r)}
              style={{
                background: "#141416", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: 15, display: "flex", flexDirection: "column",
                gap: 12, cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.25, color: "#f4f4f6",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.title || "Untitled"}
                  </span>
                  <span style={{ fontSize: 13, color: "rgba(244,244,246,0.42)" }}>
                    {r.source_type ?? "idea"} · {Object.keys(r.outputs || {}).length} outputs
                  </span>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, padding: "4px 9px", borderRadius: 7,
                  background: "rgba(47,227,155,0.12)", color: "#2fe39b", whiteSpace: "nowrap", flexShrink: 0 }}>
                  Ready
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex" }}>
                  {(r.platforms ?? []).slice(0, 4).map((f, i) => {
                    const plat = PLATFORMS.find((p) => p.id === f);
                    if (!plat) return null;
                    return <div key={f} style={monoChip(i === 0)}>{plat.mono}</div>;
                  })}
                </div>
                <span style={{ fontSize: 12.5, color: "rgba(244,244,246,0.4)", marginLeft: 4 }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function LibraryView({
  libFilter,
  setLibFilter,
  onOpenProject,
  onOpenHistory,
  history,
}: {
  libFilter: string;
  setLibFilter: (f: string) => void;
  onOpenProject: (p: Project) => void;
  onOpenHistory: (r: RepurposeRow) => void;
  history: RepurposeRow[];
}) {
  void onOpenProject;
  const FILT = ["All", "Hooks", "Short-form", "Captions", "Posts", "A/B"];
  return (
    <div style={{ padding: "60px 20px 8px", display: "flex", flexDirection: "column", gap: 18 }}>
      <h1 style={{ fontFamily: "'Inter Tight'", fontWeight: 800, fontSize: 30, letterSpacing: "-1.1px", margin: 0 }}>Library</h1>
      <div
        style={{
          height: 46, borderRadius: 14, background: "#141416",
          border: "1px solid rgba(255,255,255,0.07)", display: "flex",
          alignItems: "center", gap: 10, padding: "0 14px",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="rgba(244,244,246,0.4)" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="rgba(244,244,246,0.4)" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 15, color: "rgba(244,244,246,0.4)" }}>Search sources & outputs</span>
      </div>
      <div className="rp-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        {FILT.map((f) => {
          const on = libFilter === f;
          return (
            <div
              key={f}
              onClick={() => setLibFilter(f)}
              style={{
                padding: "9px 15px", borderRadius: 11, fontSize: 14, fontWeight: 600,
                whiteSpace: "nowrap", cursor: "pointer",
                ...(on
                  ? { background: "#2fe39b", color: "#04140d" }
                  : { background: "#141416", color: "rgba(244,244,246,0.55)", border: "1px solid rgba(255,255,255,0.07)" }),
              }}
            >
              {f}
            </div>
          );
        })}
      </div>
      {history.length === 0 && (
        <div style={{ padding: 18, borderRadius: 16, background: "#141416", border: "1px dashed rgba(255,255,255,0.1)",
          color: "rgba(244,244,246,0.55)", fontSize: 14 }}>
          Your generated repurposes will show up here.
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {history.map((r) => (
          <div
            key={r.id}
            onClick={() => onOpenHistory(r)}
            style={{
              background: "#141416", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, padding: 15, display: "flex", alignItems: "center",
              gap: 13, cursor: "pointer",
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: "rgba(47,227,155,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              color: "#2fe39b", fontWeight: 700, fontSize: 13,
            }}>
              {(r.source_type ?? "id").slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              <span style={{
                fontSize: 15.5, fontWeight: 600, lineHeight: 1.2,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{r.title || "Untitled"}</span>
              <span style={{ fontSize: 12.5, color: "rgba(244,244,246,0.42)" }}>
                {r.source_type ?? "idea"} · {Object.keys(r.outputs || {}).length} outputs
              </span>
            </div>
            <span style={{ fontSize: 12.5, color: "rgba(244,244,246,0.35)", flexShrink: 0 }}>
              {new Date(r.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView({
  voice, showToast, brandVoice, onSaveBrandVoice,
  userEmail, isPro, displayName, onSaveDisplayName,
  prefs, onUpdatePref, onSignOut,
}: {
  voice: string;
  showToast: (m: string) => void;
  brandVoice: string;
  onSaveBrandVoice: (v: string) => void;
  userEmail: string;
  isPro: boolean;
  displayName: string;
  onSaveDisplayName: (name: string) => void;
  prefs: Preferences;
  onUpdatePref: (patch: Partial<Preferences>) => void;
  onSignOut: () => void;
}) {
  const [local, setLocal] = useState(brandVoice);
  useEffect(() => { setLocal(brandVoice); }, [brandVoice]);
  const dirty = local !== brandVoice;

  const [nameLocal, setNameLocal] = useState(displayName);
  useEffect(() => { setNameLocal(displayName); }, [displayName]);
  const nameDirty = nameLocal.trim() !== displayName.trim();

  const EXPORT_LABELS: Record<Preferences["defaultExport"], string> = {
    share: "Share sheet",
    copy: "Copy to clipboard",
    download: "Download .txt",
  };
  const cycleExport = () => {
    const order: Preferences["defaultExport"][] = ["share", "copy", "download"];
    const next = order[(order.indexOf(prefs.defaultExport) + 1) % order.length];
    onUpdatePref({ defaultExport: next });
  };

  return (
    <div style={{ padding: "60px 20px 8px", display: "flex", flexDirection: "column", gap: 22 }}>
      <h1 style={{ fontFamily: "'Inter Tight'", fontWeight: 800, fontSize: 30, letterSpacing: "-1.1px", margin: 0 }}>Settings</h1>

      <Group label="Account">
        <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 13, borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
          <Avatar size={46} fontSize={18} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {displayName.trim() || "Your account"}
            </div>
            <div style={{ fontSize: 12.5, color: "rgba(244,244,246,0.42)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userEmail || "Signed in"}
            </div>
          </div>
          <span
            style={{
              fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8, flexShrink: 0,
              ...(isPro
                ? { background: "#2fe39b", color: "#04140d" }
                : { background: "rgba(255,255,255,0.08)", color: "rgba(244,244,246,0.6)" }),
            }}
          >
            {isPro ? "PRO" : "FREE"}
          </span>
        </div>
        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 13, color: "rgba(244,244,246,0.5)" }}>Display name</span>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={nameLocal}
              onChange={(e) => setNameLocal(e.target.value)}
              maxLength={80}
              placeholder="What should we call you?"
              style={{
                flex: 1, height: 42, background: "#0e0e10", color: "#f4f4f6",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
                padding: "0 12px", fontSize: 14.5, fontFamily: "'Inter', system-ui", outline: "none",
              }}
            />
            <button
              disabled={!nameDirty}
              onClick={() => onSaveDisplayName(nameLocal.trim())}
              style={{
                height: 42, padding: "0 16px", borderRadius: 10, border: "none",
                background: nameDirty ? "#2fe39b" : "rgba(255,255,255,0.08)",
                color: nameDirty ? "#04140d" : "rgba(255,255,255,0.4)",
                fontWeight: 700, fontSize: 14, cursor: nameDirty ? "pointer" : "default", flexShrink: 0,
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Group>

      <Group label="Brand voice">
        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 13, color: "rgba(244,244,246,0.5)", lineHeight: 1.45 }}>
            Describe how you write — tone, sentence length, do's and don'ts, signature phrases.
            Every generation matches this voice.
          </span>
          <textarea
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder="e.g. Direct, warm, a little punchy. Short lines, no walls of text. End with one soft question. Rare emoji."
            style={{
              minHeight: 140, width: "100%", resize: "vertical",
              background: "#0e0e10", color: "#f4f4f6",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
              padding: 12, fontSize: 14.5, lineHeight: 1.5,
              fontFamily: "'Inter', system-ui", outline: "none",
            }}
          />
          <button
            disabled={!dirty}
            onClick={() => onSaveBrandVoice(local)}
            style={{
              alignSelf: "flex-end", height: 38, padding: "0 16px",
              borderRadius: 10, border: "none",
              background: dirty ? "#2fe39b" : "rgba(255,255,255,0.08)",
              color: dirty ? "#04140d" : "rgba(255,255,255,0.4)",
              fontWeight: 700, fontSize: 14, cursor: dirty ? "pointer" : "default",
            }}
          >
            Save voice
          </button>
        </div>
      </Group>

      <Group label="Preferences">
        <PrefRow
          label="Haptic feedback"
          value={prefs.haptics}
          onChange={(v) => onUpdatePref({ haptics: v })}
        />
        <PrefRow
          label="Reduce motion"
          value={prefs.reduceMotion}
          onChange={(v) => onUpdatePref({ reduceMotion: v })}
        />
        <div
          onClick={cycleExport}
          style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
        >
          <span style={{ fontSize: 15.5 }}>Default export</span>
          <span style={{ fontSize: 14.5, color: "rgba(244,244,246,0.45)" }}>{EXPORT_LABELS[prefs.defaultExport]} ›</span>
        </div>
      </Group>

      <div style={{ fontSize: 12, color: "rgba(244,244,246,0.3)", textAlign: "center", paddingTop: 8 }}>
        Active voice: {voice} · tap a chip in “New” to switch
      </div>
      <button
        onClick={() => showToast("Heads up: more voices coming soon")}
        style={{ ...ghostBtn, alignSelf: "center" }}
      >
        Manage voice presets
      </button>
      <button
        onClick={onSignOut}
        style={{
          ...ghostBtn, alignSelf: "center", color: "#ff6b6b",
          borderColor: "rgba(255,107,107,0.3)",
        }}
      >
        Sign out
      </button>
    </div>
  );
}



function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.6px",
          color: "rgba(244,244,246,0.4)",
          textTransform: "uppercase",
          paddingLeft: 4,
        }}
      >
        {label}
      </span>
      <div
        style={{
          background: "#141416",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function PrefRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
        cursor: "pointer",
      }}
    >
      <span style={{ fontSize: 15.5 }}>{label}</span>
      <div
        role="switch"
        aria-checked={value}
        style={{
          width: 46,
          height: 28,
          borderRadius: 99,
          background: value ? "#2fe39b" : "rgba(255,255,255,0.14)",
          padding: 3,
          display: "flex",
          justifyContent: value ? "flex-end" : "flex-start",
          transition: "background 0.18s ease",
        }}
      >
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff" }} />
      </div>
    </div>
  );
}

function NewFlow({
  newStep,
  srcType,
  setSrcType,
  sourceText,
  setSourceText,
  selected,
  togglePlatform,
  selectAll,
  voice,
  setVoice,
  genIdx,
  onExit,
  onNextFromImport,
  onGenerate,
}: {
  newStep: number;
  srcType: string;
  setSrcType: (s: string) => void;
  sourceText: string;
  setSourceText: (s: string) => void;
  selected: string[];
  togglePlatform: (id: string) => void;
  selectAll: () => void;
  voice: string;
  setVoice: (v: string) => void;
  genIdx: number;
  onExit: () => void;
  onNextFromImport: () => void;
  onGenerate: () => void;
}) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "58px 18px 12px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div
          onClick={onExit}
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: "#141416",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="rgba(244,244,246,0.7)" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ flex: 1, display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 99,
                background: i <= newStep ? "#2fe39b" : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="rp-scroll" style={{ flex: 1, overflowY: "auto" }}>
        {newStep === 0 && (
          <div style={{ padding: "8px 20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <h2 style={{ fontFamily: "'Inter Tight'", fontWeight: 800, fontSize: 28, letterSpacing: "-1px", margin: 0 }}>
                Add your input
              </h2>
              <p style={{ fontSize: 15, color: "rgba(244,244,246,0.55)", lineHeight: 1.4, margin: 0 }}>
                Long video, short clip, transcript, caption, or a rough idea — we'll spin it into every format.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              {SRC_TABS.map((t) => {
                const active = srcType === t.id;
                const clr = active ? "#2fe39b" : "rgba(244,244,246,0.5)";
                return (
                  <div
                    key={t.id}
                    onClick={() => setSrcType(t.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 9,
                      padding: 15,
                      borderRadius: 15,
                      cursor: "pointer",
                      ...(active
                        ? {
                            background: "rgba(47,227,155,0.08)",
                            border: "1px solid rgba(47,227,155,0.5)",
                            color: "#f4f4f6",
                          }
                        : {
                            background: "#141416",
                            border: "1px solid rgba(255,255,255,0.07)",
                            color: "rgba(244,244,246,0.7)",
                          }),
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      {SRC_ICONS[t.id](clr)}
                    </svg>
                    <span style={{ fontSize: 14.5, fontWeight: 600 }}>{t.label}</span>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                background: "#141416",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 13, color: "rgba(244,244,246,0.45)", fontWeight: 500 }}>{FIELD_LABELS[srcType]}</span>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder={FIELD_PLACEHOLDERS[srcType]}
                rows={srcType === "youtube" ? 2 : 8}
                style={{
                  width: "100%",
                  minHeight: srcType === "youtube" ? 56 : 180,
                  resize: "vertical",
                  background: "#0e0e10",
                  color: "#f4f4f6",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "13px 14px",
                  fontSize: 15,
                  lineHeight: 1.5,
                  fontFamily: "'Inter', system-ui",
                  outline: "none",
                }}
              />
              <div style={{ fontSize: 12, color: "rgba(244,244,246,0.4)" }}>
                {sourceText.trim().length} characters · the more context you give, the better the outputs.
              </div>
            </div>
            <button
              onClick={onNextFromImport}
              disabled={!sourceText.trim()}
              style={{
                ...primaryBtn,
                opacity: sourceText.trim() ? 1 : 0.5,
                cursor: sourceText.trim() ? "pointer" : "not-allowed",
              }}
            >
              Choose formats
            </button>
          </div>
        )}


        {newStep === 1 && (
          <div style={{ padding: "8px 20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <h2 style={{ fontFamily: "'Inter Tight'", fontWeight: 800, fontSize: 28, letterSpacing: "-1px", margin: 0 }}>
                  Pick formats
                </h2>
                <span style={{ fontSize: 15, color: "rgba(244,244,246,0.55)" }}>{selected.length} selected</span>
              </div>
              <span
                onClick={selectAll}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#2fe39b",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  paddingBottom: 4,
                }}
              >
                {selected.length === PLATFORMS.length ? "Clear all" : "Select all"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {PLATFORMS.map((p) => {
                const on = selected.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                      padding: 14,
                      borderRadius: 16,
                      cursor: "pointer",
                      transition: "all .12s",
                      ...(on
                        ? { background: "rgba(47,227,155,0.07)", border: "1px solid rgba(47,227,155,0.5)" }
                        : { background: "#141416", border: "1px solid rgba(255,255,255,0.07)" }),
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12.5,
                          fontWeight: 700,
                          ...(on
                            ? { background: "#2fe39b", color: "#04140d" }
                            : { background: "rgba(255,255,255,0.06)", color: "rgba(244,244,246,0.6)" }),
                        }}
                      >
                        {p.mono}
                      </div>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          ...(on
                            ? { background: "#2fe39b" }
                            : { background: "transparent", border: "1.5px solid rgba(255,255,255,0.14)" }),
                        }}
                      >
                        {on && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13l4 4L19 7" stroke="#04140d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.15 }}>{p.name}</span>
                      <span style={{ fontSize: 12, color: "rgba(244,244,246,0.42)", lineHeight: 1.2 }}>{p.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  color: "rgba(244,244,246,0.4)",
                  textTransform: "uppercase",
                  paddingLeft: 2,
                }}
              >
                Brand voice
              </span>
              <div className="rp-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
                {VOICES.map((v) => {
                  const on = voice === v;
                  return (
                    <div
                      key={v}
                      onClick={() => setVoice(v)}
                      style={{
                        padding: "11px 16px",
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        ...(on
                          ? { background: "rgba(47,227,155,0.1)", border: "1px solid rgba(47,227,155,0.5)", color: "#2fe39b" }
                          : { background: "#141416", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(244,244,246,0.6)" }),
                      }}
                    >
                      {v}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {newStep === 2 && (
          <div style={{ padding: "24px 22px", display: "flex", flexDirection: "column", gap: 24, minHeight: 560 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", textAlign: "center", paddingTop: 30 }}>
              <Spinner />
              <div style={{ fontFamily: "'Inter Tight'", fontWeight: 800, fontSize: 24, marginTop: 8 }}>Repurposing…</div>
              <div style={{ fontSize: 14.5, color: "rgba(244,244,246,0.5)" }}>
                Adapting your source into {selected.length} platform-native formats
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {selected.map((id, i) => {
                const p = findP(id);
                const done = i < genIdx;
                const active = i === genIdx;
                return (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 15px",
                      borderRadius: 14,
                      ...(done || active
                        ? { background: "#141416", border: "1px solid rgba(255,255,255,0.07)" }
                        : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }),
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        ...(done || active
                          ? { background: "rgba(47,227,155,0.12)", color: "#2fe39b" }
                          : { background: "rgba(255,255,255,0.05)", color: "rgba(244,244,246,0.4)" }),
                      }}
                    >
                      {p.mono}
                    </div>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: done || active ? "#f4f4f6" : "rgba(244,244,246,0.4)" }}>
                      {p.name}
                    </span>
                    {done && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="11" fill="#2fe39b" />
                        <path d="M7.5 12.5l3 3 6-6.5" stroke="#04140d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {active && !done && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: "rp-spin .8s linear infinite" }}>
                        <circle cx="12" cy="12" r="9" stroke="rgba(47,227,155,0.2)" strokeWidth="2.5" />
                        <path d="M12 3a9 9 0 019 9" stroke="#2fe39b" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    )}
                    {!done && !active && (
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.12)" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {newStep === 1 && (
        <div
          style={{
            padding: "10px 20px 34px",
            flexShrink: 0,
            background: "linear-gradient(to top, #0a0a0b 70%, rgba(10,10,11,0))",
          }}
        >
          <button
            onClick={onGenerate}
            style={{
              height: 56,
              width: "100%",
              border: "none",
              borderRadius: 16,
              background: "#2fe39b",
              color: "#04140d",
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Inter Tight'",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13H11l-1 9 8.5-11H12l1-9z" fill="#04140d" />
            </svg>
            Generate {selected.length} outputs
          </button>
        </div>
      )}
    </div>
  );
}

function Results({
  selected,
  srcTitle,
  voice,
  outputs,
  onExit,
  onOpenOutput,
  onCopy,
  onSave,
  onSendScheduler,
  onExportAll,
  onRegenerate,
  regeneratingId,
}: {
  selected: string[];
  srcTitle: string;
  voice: string;
  outputs: Record<string, string>;
  onExit: () => void;
  onOpenOutput: (id: string) => void;
  onCopy: (id: string) => void;
  onSave: () => void;
  onSendScheduler: () => void;
  onExportAll: () => void;
  onRegenerate: (id: string) => void;
  regeneratingId: string | null;
}) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div
        style={{
          padding: "58px 18px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
          borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          onClick={onExit}
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: "#141416",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 5l-7 7 7 7" stroke="rgba(244,244,246,0.7)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {srcTitle}
          </span>
          <span style={{ fontSize: 12.5, color: "rgba(244,244,246,0.42)" }}>
            {selected.length} outputs · {voice}
          </span>
        </div>
        <div
          onClick={onSave}
          style={{
            height: 36,
            padding: "0 15px",
            borderRadius: 11,
            background: "rgba(47,227,155,0.12)",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "#2fe39b" }}>Save</span>
        </div>
      </div>

      <div
        className="rp-scroll"
        style={{ flex: 1, overflowY: "auto", padding: "16px 20px 120px", display: "flex", flexDirection: "column", gap: 12 }}
      >
        {selected.map((id) => {
          const p = findP(id);
          return (
            <div
              key={id}
              onClick={() => onOpenOutput(id)}
              style={{
                background: "#141416",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "rgba(244,244,246,0.7)",
                    flexShrink: 0,
                  }}
                >
                  {p.mono}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 15.5, fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: "rgba(244,244,246,0.4)" }}>{p.sub}</span>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (regeneratingId !== id) onRegenerate(id);
                  }}
                  title="Regenerate variation"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    cursor: regeneratingId ? "default" : "pointer",
                    opacity: regeneratingId && regeneratingId !== id ? 0.4 : 1,
                  }}
                >
                  {regeneratingId === id ? (
                    <Spinner />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 11a8 8 0 10-.6 4" stroke="rgba(244,244,246,0.65)" strokeWidth="1.9" strokeLinecap="round" fill="none" />
                      <path d="M20 4v5h-5" stroke="rgba(244,244,246,0.65)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(id);
                  }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="8" y="8" width="12" height="12" rx="2.5" stroke="rgba(244,244,246,0.65)" strokeWidth="1.8" />
                    <path d="M5 15V5a2 2 0 012-2h10" stroke="rgba(244,244,246,0.65)" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: "rgba(244,244,246,0.62)",
                  whiteSpace: "pre-wrap",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  opacity: regeneratingId === id ? 0.4 : 1,
                  transition: "opacity 0.2s ease",
                }}
              >
                {outputs[id]}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: "rgba(244,244,246,0.35)" }}>Tap to edit</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="rgba(244,244,246,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "12px 20px 32px",
          display: "flex",
          gap: 10,
          background: "linear-gradient(to top, #0a0a0b 68%, rgba(10,10,11,0))",
          zIndex: 20,
        }}
      >
        <button
          onClick={onSendScheduler}
          style={{
            flex: 1,
            height: 52,
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 15,
            background: "#141416",
            color: "#f4f4f6",
            fontSize: 15.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Send to scheduler
        </button>
        <button
          onClick={onExportAll}
          style={{
            flex: 1,
            height: 52,
            border: "none",
            borderRadius: 15,
            background: "#2fe39b",
            color: "#04140d",
            fontSize: 15.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Export all
        </button>
      </div>
    </div>
  );
}

function EditorSheet({
  platform,
  text,
  onChange,
  onClose,
  onCopy,
  onShare,
  onRegenerate,
  regenerating,
}: {
  platform: Platform;
  text: string;
  onChange: (t: string) => void;
  onClose: () => void;
  onCopy: () => void;
  onShare: () => void;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 50 }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "90%",
          background: "#121214",
          borderRadius: "26px 26px 0 0",
          zIndex: 51,
          display: "flex",
          flexDirection: "column",
          animation: "rp-sheet .32s cubic-bezier(.2,.8,.2,1)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "11px 0 4px" }}>
          <div style={{ width: 38, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.18)" }} />
        </div>
        <div
          style={{
            padding: "8px 20px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "0.5px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(47,227,155,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12.5,
              fontWeight: 700,
              color: "#2fe39b",
              flexShrink: 0,
            }}
          >
            {platform.mono}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{platform.name}</span>
            <span style={{ fontSize: 12.5, color: "rgba(244,244,246,0.42)" }}>{platform.sub}</span>
          </div>
          <div
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="rgba(244,244,246,0.6)" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className="rp-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: "100%",
              minHeight: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              resize: "none",
              color: "#f4f4f6",
              fontSize: 15.5,
              lineHeight: 1.6,
              fontFamily: "'Inter', system-ui",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, padding: "12px 16px 22px", borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
          <div
            onClick={() => { if (!regenerating) onRegenerate(); }}
            title="Regenerate variation"
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: "#1d1d20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: regenerating ? "default" : "pointer",
              flexShrink: 0,
            }}
          >
            {regenerating ? (
              <Spinner />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 12a8 8 0 10-2.3 5.6M20 12V7m0 5h-5"
                  stroke="rgba(244,244,246,0.7)"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <button
            onClick={onShare}
            style={{
              flex: 1,
              height: 50,
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
              background: "#1d1d20",
              color: "#f4f4f6",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Share
          </button>
          <button
            onClick={onCopy}
            style={{
              flex: 1.4,
              height: 50,
              border: "none",
              borderRadius: 14,
              background: "#2fe39b",
              color: "#04140d",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <rect x="8" y="8" width="12" height="12" rx="2.5" stroke="#04140d" strokeWidth="2" />
              <path d="M5 15V5a2 2 0 012-2h10" stroke="#04140d" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Copy
          </button>
        </div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Tiny atoms
// ────────────────────────────────────────────────────────────────────────────
function Avatar({ size = 40, fontSize = 15 }: { size?: number; fontSize?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#2fe39b,#1ba876)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        color: "#04140d",
        fontSize,
        flexShrink: 0,
      }}
    >
      M
    </div>
  );
}

function Chevron() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14">
      <path d="M1 1l6 6-6 6" stroke="rgba(244,244,246,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 54,
        height: 54,
        borderRadius: "50%",
        border: "3px solid rgba(47,227,155,0.18)",
        borderTopColor: "#2fe39b",
        animation: "rp-spin .8s linear infinite",
      }}
    />
  );
}

const primaryBtn: CSSProperties = {
  height: 54,
  border: "none",
  borderRadius: 16,
  background: "#2fe39b",
  color: "#04140d",
  fontSize: 17,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Inter Tight'",
};

const ghostBtn: CSSProperties = {
  height: 44,
  border: "none",
  background: "transparent",
  color: "rgba(244,244,246,0.45)",
  fontSize: 15,
  fontWeight: 500,
  cursor: "pointer",
};

function TopBarMenu({
  isPro, onBrandVoice, onSubscription, onSignOut,
}: {
  isPro: boolean;
  onBrandVoice: () => void;
  onSubscription: () => void;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const item: CSSProperties = {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px", background: "transparent", border: "none",
    color: "#f4f4f6", fontSize: 13, fontWeight: 500, cursor: "pointer",
    width: "100%", textAlign: "left", whiteSpace: "nowrap",
  };

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        aria-label="More options"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 30, height: 30, borderRadius: 999,
          background: "rgba(255,255,255,0.08)", border: "none", color: "#f4f4f6",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          padding: 0, flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0,
            minWidth: 200, background: "#16161a",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
            boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
            padding: 6, zIndex: 50, display: "flex", flexDirection: "column",
          }}
        >
          <button
            style={item}
            onClick={() => { setOpen(false); onBrandVoice(); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 14a4 4 0 004-4V6a4 4 0 00-8 0v4a4 4 0 004 4zM6 10a6 6 0 0012 0M12 18v3"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Brand voice
          </button>
          <button
            style={item}
            onClick={() => { setOpen(false); onSubscription(); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            {isPro ? "Manage subscription" : "Upgrade to Pro"}
          </button>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
          <button
            style={{ ...item, color: "rgba(255,255,255,0.6)" }}
            onClick={() => { setOpen(false); onSignOut(); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 17l5-5-5-5M20 12H9M12 19H5a2 2 0 01-2-2V7a2 2 0 012-2h7"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

