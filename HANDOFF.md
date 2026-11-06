# Life Crisis Tycoon — handoff for the next session

## LIVE (done 2026-11-06)
- Game: https://gnaine.github.io/Life-crisis-tycoon/ — repo github.com/gnaine/Life-crisis-tycoon (GitHub Pages, main branch, root, `.nojekyll`). A push redeploys in ~4 min.
- Supabase project `life-crisis-tycoon` (ref pvihszrcjosdyxmkcklu, eu-west-3, org "gnaine's Org"). Tables: `saves` (RLS own rows), `profiles` (user_id, username unique case-insensitive 3–16 `[A-Za-z0-9_.-]`, public read, own write).
- Auth: Site URL + redirect `https://gnaine.github.io/Life-crisis-tycoon/**`; email OTP length 6; custom SMTP = Brevo (smtp-relay.brevo.com:587, login c1c5ea001@smtp-brevo.com, sender ena.naine@gmail.com "Life Crisis Tycoon"; key entered by the user). Templates "Magic link" + "Confirm sign up" contain `{{ .Token }}` + link (FR/EN).
- account.js: account REQUIRED (config.js `REQUIRE_ACCOUNT`), never blocks offline or if a login was ever stored; 2-step panel (email → code, auto-submit at 6 digits); first sign-in asks a public username (`window.MLT_ACCOUNT.username`) — rankings must show usernames, never emails. Apple/Google hidden until set up: add to `PROVIDERS` in config.js.
- Still to do: end-to-end restore test with a real account; Google sign-in (Google Cloud OAuth client); leaderboard/stats (build from `saves` + `profiles`, expose username + score only, e.g. a SQL view or RPC).

Read this first. The user (French or English; answer in the language she writes in) wants to move the game off the Claude artifact into a standalone installable web app with real accounts and permanent saves.

## Immediate task (what she asked for)
1. **Supabase** (connector): create a project (or use the one she names). Run `supabase.sql` (table `saves` + row-level security). Put the Project URL + anon public key in `config.js` (never the service_role key).
   - Auth → URL configuration: Site URL + Redirect URLs = the hosted address (GitHub Pages URL).
   - Auth → Email templates → Magic link: include `{{ .Token }}` (players type the 6-digit code inside the installed iPhone app — a PWA does not share storage with Safari, so links alone don't sign it in).
   - Providers: Email on. Google = Google Cloud OAuth client (guide her). Apple = needs Apple Developer account (99 $/yr) → later, button already in the app.
2. **GitHub** (connector): create repo `life-crisis-tycoon`, push this folder (no build step), enable GitHub Pages (main branch, root). Large files are fine (biggest ~4 MB).
3. **Verify end to end**: sign in by email code, play, wipe local storage, reload → progress restored; install to home screen; import old progress with the 💾 Export / 📥 Import code ("MLT1:…").
4. Send her the live link and the Supabase/Google steps she must do herself.

## How saves work
- The game keeps everything in localStorage keys starting `ahq_` (`ahq_<city>_v2` per city, `ahq_profile`, `ahq_mgr`, `ahq_lang`, …). Never rename these: **updates must never reset saves**.
- `game.js` → "online save" block: `Storage.prototype.setItem` is wrapped to timestamp `ahq_` writes (`ahq_sync_at`) and push changed keys (debounced, on pagehide/visibilitychange). Backend adapter `{uid, list(), put(k, v, at)}`:
  - standalone app: `window.MLT_APP = true` (index.html) + `account.js` → `window.MLT_ACCOUNT.api()` (Supabase table `saves`).
  - Claude artifact: `window.claude.use('db')` (`data/users/<uid>/<key>`). The artifact is public, so the platform refused to declare `db`; it falls back to "use Export".
- Merge on start: local key missing/never timestamped → cloud wins; key written before sync finished this session → the **more advanced** save wins (stars, then day) so a fresh start never erases progress; otherwise newest wins. `ahq_profile` stars are merged by max.
- `window.mltCloudStart()` re-syncs after sign-in; `mltCloudStop()` on sign-out.

## Files
- `index.html` (PWA tags, 👤 Account button `#bAccount`, `#cloudInfo` line, service worker registration), `account.js` (Supabase auth UI in 7 languages: Apple, Google, email code, play without account), `config.js` (placeholders), `manifest.webmanifest`, `sw.js` (code network-first, models/assets cache-first, never caches supabase.co), `icons/`, `supabase.sql`.
- Game: `game.js` (main), `city.js` (city decor + landmarks), `chars.js`, `cases*.js` (special cases), `i18n.js` + `i18n_mgr.js` (strings; new strings go in `EXTRA20`), `audio.js`, `batch.js`, `toon.js`, `models/` (GLBs as base64 JS modules; `models/props/` = art pilot props).
- The Claude artifact copy lives at https://claude.ai/artifact/8YRXCTKeta6fUcU8MhPFFo (slug 3d13238d-50d7-4ebb-9c97-3d0ae5e9ae02, public: publishing needs shared_live "public" + artifact_title "Life Crisis Tycoon: Fix the Chaos").

## Standing rules from the user
- Never call any skin tone "neutral". No stereotyped appearance→problem mapping.
- Next-step/goal highlights never green (green = completed). The Build nav button is not coloured differently.
- Updates must never reset saves.
- London stays the simple tutorial city; new behaviours start from city 2 (Lagos). Natural disasters → future hard mode.
- Don't tune difficulty from the bot (bot only spots breakages; tuning comes from human playtests). Avoid goals that are just waiting. Daily goals and special cases come once per in-game week.
- Check art quality against her reference sheets before publishing (side-by-side). She dislikes worn/"old" looking textures.
- Playtest shortcut: tap the star counter on the world map 5× → all cities open (`ahq_unlock`).

## Art pipeline (tools/)
- `tools/gltfx/`: `geo.mjs` (shape-only simplify), `bake.py` (re-bake the Meshy texture onto the light mesh with xatlas — use this, NOT texture-seam-collapsing simplification), `props.mjs` (scale/centre/WebP/quantize). Needs `npm i @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer sharp` and `pip install trimesh xatlas scipy rtree`.
- `tools/blender/`: `make3.py` (reception desk, plane tree, toilet cubicle), `simple.py` (plants s/m/l, side table, planter, bus stop, kitchenette, radiator, air-con). Run with `pip install bpy` (Blender 5.2 headless): `python3 simple.py -- out all`.
- In game: `glbSwap(group, name, {h|len, rot, y, keep})` replaces a primitive-built group with `models/props/<name>.js` once loaded (`?props=0` disables). Groups marked `userData.swap` are excluded from mesh batching.
- Remaining art pilot step: sheet C building kit (walls, doors, windows, facades, floor materials), then rendering upgrades (soft shadows, AO, grading) within a mobile budget. Meshy balance ~589 credits; reference sheets are in `tools/art_src/`. The raw 20-58 MB Meshy GLBs are not included (too big); re-download from Meshy if a re-bake is needed.
