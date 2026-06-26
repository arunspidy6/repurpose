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

// Target platforms — the user picks where the content is going, and the app
// produces one platform-native output card per selection.
export const PLATFORMS = [
  { id: 'tiktok',    name: 'TikTok',    sub: 'Caption + hashtags',  mono: 'TT' },
  { id: 'instagram', name: 'Instagram', sub: 'Feed caption',        mono: 'IG' },
  { id: 'reels',     name: 'Reels',     sub: 'Hook + caption',      mono: 'RL' },
  { id: 'shorts',    name: 'Shorts',    sub: 'Vertical script',     mono: 'SH' },
  { id: 'x',         name: 'X',         sub: 'Thread',              mono: 'X'  },
  { id: 'linkedin',  name: 'LinkedIn',  sub: 'Professional post',   mono: 'IN' },
];

export type PlatformId = typeof PLATFORMS[number]['id'];

// One platform-native output per target platform.
export const OUTPUTS: Record<string, string> = {
  tiktok: `POV: you stop chasing viral and start chasing consistent.\n\n50,000 subscribers. 18 months. One weekly system.\n\nThe creators winning right now aren't the loudest — they're the most repeatable.\n\n#creatortok #newslettertips #buildinpublic`,
  instagram: `The newsletter advice no one gives you 👇\n\n50K subscribers in 18 months came down to consistency — not going viral. One essay, one swipe file, one CTA. Every single week.\n\nSave this for your next growth sprint.\n\n#creatoreconomy #growthtips #buildinpublic #newsletter`,
  reels: `HOOK (0:00–0:03)\n"I went 0 → 50K subscribers — here's the part nobody talks about."\n\nCAPTION\nConsistency beat virality. One weekly system, 78 weeks straight.\n\nSave + follow for the template 👇\n\n#reels #creatoreconomy #buildinpublic`,
  shorts: `HOOK (0:00–0:03)\n"I went 0 → 50K subscribers — here's the part nobody talks about."\n\nBEAT 1 (0:03–0:11)\nEveryone obsesses over growth hacks. The real unlock was one boring, repeatable system.\n\nBEAT 2 (0:11–0:19)\nEvery week: one essay, one swipe file, one CTA. That's the whole machine.\n\nCTA (0:19–0:22)\nFollow for the exact weekly template I used →`,
  x: `1/ I grew a newsletter from 0 → 50,000 subscribers in 18 months.\n\nNo ads. No viral moment. Just one repeatable system. 🧵\n\n2/ The mistake most people make: chasing growth hacks.\n\nHacks spike. Systems compound.\n\n3/ My weekly loop:\n• 1 essay\n• 1 swipe file\n• 1 clear CTA\n\nSame structure. Every week. For 78 weeks.\n\n4/ Starting today? Pick one format and commit to 12 weeks before you judge it.\n\nFollow for the full template.`,
  linkedin: `18 months ago my newsletter had 0 subscribers.\n\nToday it has 50,000.\n\nI didn't go viral. I didn't run ads. I did one boring thing exceptionally well: I shipped every single week.\n\nThe system:\n→ One core idea per issue\n→ A swipe file readers could steal\n→ A single, clear call to action\n\nConsistency compounds. The creators who win aren't the most talented — they're the ones still showing up in month 14 when no one's watching.\n\nWhat's the one habit that moved the needle for you?`,
};

export const PROJECTS = [
  { id: '1', title: 'Newsletter growth playbook',      src: 'Video · 24:18',            date: 'Today',     outputs: 6, status: 'Ready', formats: ['tiktok','instagram','reels','shorts','x','linkedin'] },
  { id: '2', title: 'My TikTok hook teardown',         src: 'Short video · 0:48',       date: 'Today',     outputs: 4, status: 'Ready', formats: ['tiktok','instagram','reels','shorts'] },
  { id: '3', title: 'How I price my freelance work',   src: 'Transcript · 3,420 words', date: 'Yesterday', outputs: 3, status: 'Ready', formats: ['linkedin','x','instagram'] },
  { id: '4', title: '"Consistency beats virality"',    src: 'Rough idea · 1 line',      date: '2d ago',    outputs: 4, status: 'Draft', formats: ['tiktok','reels','x','instagram'] },
  { id: '5', title: 'Cold outreach that actually works', src: 'Video · 12:04',          date: '2d ago',    outputs: 4, status: 'Ready', formats: ['reels','tiktok','linkedin','x'] },
  { id: '6', title: 'Launch caption rewrite',          src: 'Caption · 180 words',      date: 'Last week', outputs: 3, status: 'Ready', formats: ['instagram','tiktok','x'] },
];

export const VOICES = ['My main voice', 'Punchy & casual', 'LinkedIn pro'];

export const SRC_TYPES = [
  { id: 'video',      label: 'Video' },
  { id: 'shortvideo', label: 'Short video' },
  { id: 'transcript', label: 'Transcript' },
  { id: 'caption',    label: 'Caption' },
  { id: 'idea',       label: 'Rough idea' },
];

// Whether a source type is uploaded (media) or pasted (text).
export const UPLOAD_TYPES = ['video', 'shortvideo'];

export const SRC_PLACEHOLDERS: Record<string, string> = {
  video: 'Paste a link or the transcript of your video…',
  shortvideo: 'Paste a link or the captions from your short…',
  transcript: 'Paste your transcript here…',
  caption: 'Paste the caption or post you want to repurpose…',
  idea: 'Type your rough idea — even one line is enough…',
};

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
