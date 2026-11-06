# Life Crisis Tycoon: Fix the Chaos (standalone app)

Static web app (installable on phones) + Supabase for player accounts and saves.

## Setup
1. Supabase → SQL editor → run `supabase.sql` (table `saves` + row-level security).
2. Supabase → Settings → API → copy the Project URL and anon public key into `config.js`.
3. Supabase → Authentication → URL configuration: Site URL and Redirect URLs = the address where the app is hosted.
4. Authentication → Providers: Email is on by default. Google and Apple need their own client IDs.
5. Authentication → Email templates → "Magic link": add `{{ .Token }}` so players can type the 6-digit code inside the installed app.

## Hosting
Any static host (GitHub Pages, Netlify, Vercel). No build step.
