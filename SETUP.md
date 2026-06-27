# Repurpose — Backend Setup (Supabase + OpenAI)

The native app is wired to a real backend: Supabase for accounts + data (with
Row-Level Security), and a Supabase Edge Function that calls OpenAI server-side.
Until you complete this, the app runs in **mock mode** (canned sample outputs, no
sign-in) so it still launches.

You'll need: a free [Supabase](https://supabase.com) account, an
[OpenAI API key](https://platform.openai.com/api-keys), and the
[Supabase CLI](https://supabase.com/docs/guides/cli) (`npm i -g supabase`).

---

## 1. Create a Supabase project
1. supabase.com → New project. Pick a name + database password.
2. Project Settings → **API**, copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 2. Point the app at it
```bash
cp .env.example .env
# edit .env and paste the two values from step 1
```

## 3. Apply the database schema (tables + Row-Level Security)
Either run the SQL in the Supabase dashboard (SQL Editor → paste
`supabase/migrations/0001_init.sql` → Run), **or** with the CLI:
```bash
supabase link --project-ref <your-project-ref>
supabase db push
```
This creates `profiles` and `repurposes`, with RLS policies so each user can only
read/write their own rows, plus a trigger that auto-creates a profile on signup.

## 4. Set the OpenAI key as a server-side secret
```bash
supabase secrets set OPENAI_API_KEY=sk-...your key...
```
The key lives only in the Edge Function environment — it is **never** in the app.

## 5. Deploy the generate Edge Function
```bash
supabase functions deploy generate
```
This is the only thing that can call OpenAI. It verifies the caller's login,
enforces the free monthly limit server-side, runs the prompt, saves the result,
and returns the outputs.

## 6. Run the app
```bash
npm install --legacy-peer-deps
npx expo start        # i = iOS simulator, a = Android
```
Sign up → generate → your repurposes are saved to your account.

---

## How user data is protected
- **Auth:** Supabase email/password. Sessions are stored in the device keychain
  (`expo-secure-store`), encrypted at rest — not plain storage.
- **Isolation:** Postgres **Row-Level Security** means a user physically cannot
  read another user's rows, even though the app talks to the database directly
  with the public anon key.
- **Secrets:** the OpenAI key and service-role key never leave the server (Edge
  Function env). The app ships only the anon key, which is designed to be public.
- **Limits:** the free monthly cap is enforced **server-side** in the Edge
  Function, so it can't be bypassed by editing the client.
- **Transport:** all Supabase/OpenAI calls are HTTPS.

## What's intentionally next (not built yet)
- **Subscriptions:** iOS requires Apple In-App Purchase for digital subscriptions
  (Stripe is not allowed). Plan: add **RevenueCat** IAP. Until then the app is
  free with a 10/month limit. This needs an Apple Developer account + a dev build.
- **Email confirmation:** if you leave Supabase's "Confirm email" on (default),
  new users get a "check your inbox" screen before they can sign in.

## Adjusting the free limit
Change `FREE_MONTHLY_LIMIT` in **both** `supabase/functions/generate/index.ts`
and `src/lib/config.ts`, then redeploy the function.
