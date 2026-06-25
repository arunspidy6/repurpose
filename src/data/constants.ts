export const colors = {
  bg: '#0a0a0b',
  card: '#141416',
  cardAlt: '#121214',
  surface: '#1d1d20',
  accent: '#2fe39b',
  accentOn: '#04140d',
  accentBg: 'rgba(47,227,155,0.08)',
  accentBorder: 'rgba(47,227,155,0.5)',
  accentSubtle: 'rgba(47,227,155,0.12)',
  text: '#f4f4f6',
  textMuted: 'rgba(244,244,246,0.55)',
  textDim: 'rgba(244,244,246,0.42)',
  textFaint: 'rgba(244,244,246,0.35)',
  border: 'rgba(255,255,255,0.07)',
  borderSubtle: 'rgba(255,255,255,0.04)',
  overlay: 'rgba(0,0,0,0.55)',
};

export const PLATFORMS = [
  { id: 'hooks',          name: 'Hook variations',   sub: '5 scroll-stoppers',  mono: 'HK' },
  { id: 'shorts',         name: 'Shorts script',      sub: 'Vertical video',     mono: 'SH' },
  { id: 'reel',           name: 'Reel caption',       sub: 'Instagram Reels',    mono: 'RL' },
  { id: 'tiktok',         name: 'TikTok caption',     sub: 'Caption + tags',     mono: 'TT' },
  { id: 'captionvariants',name: 'Caption variants',   sub: '4 alt angles',       mono: 'CV' },
  { id: 'remix',          name: 'Trend remix',        sub: 'Trending formats',   mono: 'TR' },
  { id: 'abtest',         name: 'A/B versions',       sub: 'Two test angles',    mono: 'AB' },
  { id: 'xthread',        name: 'X thread',           sub: 'Multi-post',         mono: 'X'  },
  { id: 'linkedin',       name: 'LinkedIn post',      sub: 'Professional',       mono: 'IN' },
  { id: 'carousel',       name: 'IG carousel',        sub: 'Slide outline',      mono: 'IG' },
  { id: 'newsletter',     name: 'Newsletter',         sub: 'Email intro',        mono: 'NL' },
  { id: 'yttitle',        name: 'YouTube titles',     sub: 'Titles + thumbs',    mono: 'YT' },
];

export type PlatformId = typeof PLATFORMS[number]['id'];

export const OUTPUTS = {
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

export const PROJECTS = [
  { id: '1', title: 'Newsletter growth playbook',      src: 'Long video · 24:18',        date: 'Today',     outputs: 9, status: 'Ready', formats: ['hooks','shorts','reel','tiktok','linkedin','xthread','carousel','newsletter','yttitle'] },
  { id: '2', title: 'My TikTok hook teardown',         src: 'Short video · 0:48',        date: 'Today',     outputs: 6, status: 'Ready', formats: ['hooks','captionvariants','reel','tiktok','remix','abtest'] },
  { id: '3', title: 'How I price my freelance work',   src: 'Transcript · 3,420 words',  date: 'Yesterday', outputs: 6, status: 'Ready', formats: ['hooks','linkedin','xthread','newsletter','yttitle','abtest'] },
  { id: '4', title: '"Consistency beats virality"',    src: 'Rough idea · 1 line',       date: '2d ago',    outputs: 5, status: 'Draft', formats: ['hooks','reel','tiktok','xthread','captionvariants'] },
  { id: '5', title: 'Cold outreach that actually works', src: 'Long video · 12:04',      date: '2d ago',    outputs: 5, status: 'Ready', formats: ['reel','tiktok','linkedin','xthread','carousel'] },
  { id: '6', title: 'Reel caption A/B test',           src: 'Caption · 180 words',       date: 'Last week', outputs: 4, status: 'Ready', formats: ['captionvariants','abtest','hooks','remix'] },
];

export const VOICES = ['My main voice', 'Punchy & casual', 'LinkedIn pro'];

export const SRC_TYPES = [
  { id: 'longvideo',  label: 'Long video' },
  { id: 'shortvideo', label: 'Short video' },
  { id: 'youtube',    label: 'YouTube link' },
  { id: 'transcript', label: 'Transcript' },
  { id: 'caption',    label: 'Caption / post' },
  { id: 'idea',       label: 'Rough idea' },
];

export const SAMPLE_POSTS = [
  'Most people don\'t need more discipline. They need a smaller first step. Shrink it until it\'s embarrassingly easy, then start.',
  'Your first 1,000 followers don\'t come from going viral. They come from being consistently useful to the same 50 people.',
  'I stopped trying to be impressive and started trying to be clear. Engagement doubled. Funny how that works.',
];

export const VOICE_TRAITS = [
  { label: 'Tone',       value: 'Direct · warm · a little punchy' },
  { label: 'Avg length', value: 'Short — 2–4 tight lines' },
  { label: 'CTA style',  value: 'One soft question at the end' },
  { label: 'Formatting', value: 'Line breaks, no walls of text' },
  { label: 'Emoji',      value: 'Rare — only on social captions' },
];
