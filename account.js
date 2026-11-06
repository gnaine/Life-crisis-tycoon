// Player accounts for the standalone app (Supabase): email magic link, Apple, Google — or play without an account.
// Saves are rows in public.saves (one per local "ahq_" key), protected by row-level security: a player only sees their own.
import * as CFG from './config.js';
const { SUPABASE_URL, SUPABASE_ANON_KEY } = CFG;
// sign-in buttons shown besides email; add 'google' / 'apple' in config.js once each provider is set up in Supabase
const PROVIDERS = CFG.PROVIDERS || [];
// players must sign in before playing (rankings need a username); skipped when Supabase can't load (offline)
const REQUIRED = CFG.REQUIRE_ACCOUNT !== false;

const L = {
  en: { pick: 'Choose your username', pickWhy: 'Shown in rankings instead of your email. 3–16 letters, numbers, _ . -', taken: 'This username is already taken.', badName: 'Use 3–16 letters, numbers, _ . - only.', save: 'Save', sendCode: 'Email me a code', sentTo: 'Code sent to', typeIt: 'Type it here (check spam too).', other: 'Use another email', codeHint: 'Or type the 6-digit code from the email', code: 'Code', verify: 'Sign in', acc: 'Account', title: 'Your account', why: 'Sign in to keep your progress safe online and play on any device.', email: 'Your email', send: 'Email me a sign-in link', sent: 'Check your inbox: tap the link to sign in.', apple: 'Continue with Apple', google: 'Continue with Google', guest: 'Play without an account', signedAs: 'Signed in as', out: 'Sign out', close: 'Close', soon: 'Online accounts are being set up.', err: 'Sign-in failed, please try again.', badEmail: 'Please enter a valid email.' },
  fr: { pick: 'Choisis ton pseudo', pickWhy: 'Affiché dans les classements à la place de ton email. 3 à 16 lettres, chiffres, _ . -', taken: 'Ce pseudo est déjà pris.', badName: 'Utilise 3 à 16 lettres, chiffres, _ . - uniquement.', save: 'Valider', sendCode: 'Recevoir un code par email', sentTo: 'Code envoyé à', typeIt: 'Tape-le ici (regarde aussi dans les spams).', other: 'Changer d’email', codeHint: 'Ou tape le code à 6 chiffres reçu par email', code: 'Code', verify: 'Se connecter', acc: 'Compte', title: 'Ton compte', why: 'Connecte-toi pour garder ta progression en sécurité en ligne et jouer sur n’importe quel appareil.', email: 'Ton email', send: 'Recevoir un lien de connexion', sent: 'Regarde tes emails : touche le lien pour te connecter.', apple: 'Continuer avec Apple', google: 'Continuer avec Google', guest: 'Jouer sans compte', signedAs: 'Connecté·e en tant que', out: 'Se déconnecter', close: 'Fermer', soon: 'Les comptes en ligne sont en cours d’installation.', err: 'La connexion a échoué, réessaie.', badEmail: 'Entre un email valide.' },
  es: { pick: 'Elige tu nombre de usuario', pickWhy: 'Se muestra en las clasificaciones en lugar de tu email. 3–16 letras, números, _ . -', taken: 'Ese nombre ya está en uso.', badName: 'Usa solo 3–16 letras, números, _ . -', save: 'Guardar', sendCode: 'Recibir un código por email', sentTo: 'Código enviado a', typeIt: 'Escríbelo aquí (mira también en spam).', other: 'Usar otro email', codeHint: 'O escribe el código de 6 cifras del email', code: 'Código', verify: 'Entrar', acc: 'Cuenta', title: 'Tu cuenta', why: 'Inicia sesión para guardar tu progreso en línea y jugar en cualquier dispositivo.', email: 'Tu email', send: 'Enviarme un enlace', sent: 'Revisa tu correo: toca el enlace para entrar.', apple: 'Continuar con Apple', google: 'Continuar con Google', guest: 'Jugar sin cuenta', signedAs: 'Sesión iniciada como', out: 'Cerrar sesión', close: 'Cerrar', soon: 'Las cuentas en línea se están preparando.', err: 'Error al iniciar sesión, inténtalo de nuevo.', badEmail: 'Introduce un email válido.' },
  pt: { pick: 'Escolha seu nome de usuário', pickWhy: 'Aparece nos rankings no lugar do seu email. 3–16 letras, números, _ . -', taken: 'Esse nome já está em uso.', badName: 'Use só 3–16 letras, números, _ . -', save: 'Salvar', sendCode: 'Receber um código por email', sentTo: 'Código enviado para', typeIt: 'Digite-o aqui (veja também no spam).', other: 'Usar outro email', codeHint: 'Ou digite o código de 6 dígitos do email', code: 'Código', verify: 'Entrar', acc: 'Conta', title: 'Sua conta', why: 'Entre para salvar seu progresso online e jogar em qualquer aparelho.', email: 'Seu email', send: 'Receber link de acesso', sent: 'Veja seu email: toque no link para entrar.', apple: 'Continuar com Apple', google: 'Continuar com Google', guest: 'Jogar sem conta', signedAs: 'Conectado como', out: 'Sair', close: 'Fechar', soon: 'As contas online estão sendo configuradas.', err: 'Falha ao entrar, tente de novo.', badEmail: 'Digite um email válido.' },
  de: { pick: 'Wähle deinen Spielernamen', pickWhy: 'Wird in Ranglisten statt deiner E-Mail angezeigt. 3–16 Buchstaben, Ziffern, _ . -', taken: 'Dieser Name ist schon vergeben.', badName: 'Nur 3–16 Buchstaben, Ziffern, _ . -', save: 'Speichern', sendCode: 'Code per E-Mail erhalten', sentTo: 'Code gesendet an', typeIt: 'Gib ihn hier ein (auch im Spam nachsehen).', other: 'Andere E-Mail verwenden', codeHint: 'Oder gib den 6-stelligen Code aus der E-Mail ein', code: 'Code', verify: 'Anmelden', acc: 'Konto', title: 'Dein Konto', why: 'Melde dich an, um deinen Fortschritt online zu sichern und auf jedem Gerät zu spielen.', email: 'Deine E-Mail', send: 'Anmeldelink senden', sent: 'Schau in dein Postfach und tippe auf den Link.', apple: 'Weiter mit Apple', google: 'Weiter mit Google', guest: 'Ohne Konto spielen', signedAs: 'Angemeldet als', out: 'Abmelden', close: 'Schließen', soon: 'Online-Konten werden gerade eingerichtet.', err: 'Anmeldung fehlgeschlagen, bitte erneut versuchen.', badEmail: 'Bitte gib eine gültige E-Mail ein.' },
  ja: { pick: 'ユーザー名を決めよう', pickWhy: 'ランキングではメールの代わりに表示されます。3〜16文字（英数字と _ . -）', taken: 'このユーザー名は使われています。', badName: '3〜16文字の英数字と _ . - のみ使えます。', save: '決定', sendCode: 'メールでコードを受け取る', sentTo: 'コードを送信しました：', typeIt: 'ここに入力してください（迷惑メールも確認）。', other: '別のメールを使う', codeHint: 'またはメールの6桁コードを入力', code: 'コード', verify: 'ログイン', acc: 'アカウント', title: 'アカウント', why: 'ログインすると進行状況がオンラインに保存され、どの端末でも遊べます。', email: 'メールアドレス', send: 'ログインリンクを送る', sent: 'メールのリンクをタップしてログインしてください。', apple: 'Appleで続ける', google: 'Googleで続ける', guest: 'アカウントなしで遊ぶ', signedAs: 'ログイン中：', out: 'ログアウト', close: '閉じる', soon: 'オンラインアカウントは準備中です。', err: 'ログインに失敗しました。もう一度お試しください。', badEmail: '有効なメールアドレスを入力してください。' },
  ko: { pick: '닉네임을 정하세요', pickWhy: '순위표에 이메일 대신 표시돼요. 3–16자 영문, 숫자, _ . -', taken: '이미 사용 중인 닉네임이에요.', badName: '3–16자 영문, 숫자, _ . - 만 사용할 수 있어요.', save: '저장', sendCode: '이메일로 코드 받기', sentTo: '코드를 보냈어요:', typeIt: '여기에 입력하세요 (스팸함도 확인).', other: '다른 이메일 사용', codeHint: '또는 이메일의 6자리 코드를 입력하세요', code: '코드', verify: '로그인', acc: '계정', title: '내 계정', why: '로그인하면 진행 상황이 온라인에 안전하게 저장되고 어느 기기에서나 플레이할 수 있어요.', email: '이메일', send: '로그인 링크 받기', sent: '메일함에서 링크를 눌러 로그인하세요.', apple: 'Apple로 계속', google: 'Google로 계속', guest: '계정 없이 플레이', signedAs: '로그인:', out: '로그아웃', close: '닫기', soon: '온라인 계정을 준비 중이에요.', err: '로그인에 실패했어요. 다시 시도해 주세요.', badEmail: '올바른 이메일을 입력하세요.' },
};
const tr = (k) => { const l = (localStorage.getItem('ahq_lang') || navigator.language || 'en').slice(0, 2); return (L[l] || L.en)[k] || L.en[k]; };
const configured = SUPABASE_URL && !SUPABASE_URL.includes('YOUR_') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('YOUR_');
const here = () => location.origin + location.pathname;

let sb = null;
if (configured) {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } });
  } catch (e) { console.warn('[account] supabase load', e); }
}

async function session() { if (!sb) return null; try { return (await sb.auth.getSession()).data.session; } catch (e) { return null; } }

let profile = null; // { username } of the signed-in player, null until chosen
async function loadProfile(s) {
  profile = null; if (!s) return null;
  try { const { data } = await sb.from('profiles').select('username').eq('user_id', s.user.id).maybeSingle(); profile = data || null; } catch (e) { console.warn('[account] profile', e); }
  return profile;
}
const NAME_RE = /^[A-Za-z0-9_.-]{3,16}$/;
// first sign-in: every player picks a public username (rankings show it, never the email)
async function askUsername() {
  if (document.querySelector('#accBox[data-pick]')) return;
  const box = document.createElement('div'); box.id = 'accBox'; box.dataset.pick = '1';
  box.innerHTML = `<div class="card"><h2>🏷️ ${tr('pick')}</h2><p>${tr('pickWhy')}</p><input data-name maxlength="16" autocomplete="nickname" autocapitalize="off" spellcheck="false" placeholder="${tr('pick')}"><button class="em" data-save>${tr('save')}</button><div class="msg" style="color:#C0392B"></div></div>`;
  document.body.appendChild(box);
  const inp = box.querySelector('[data-name]'), msg = box.querySelector('.msg'), btn = box.querySelector('[data-save]');
  inp.focus();
  const save = async () => {
    const name = inp.value.trim(); msg.textContent = '';
    if (!NAME_RE.test(name)) { msg.textContent = tr('badName'); return; }
    btn.disabled = true;
    const s = await session(); if (!s) { box.remove(); return; }
    const { error } = await sb.from('profiles').upsert({ user_id: s.user.id, username: name }, { onConflict: 'user_id' });
    btn.disabled = false;
    if (error) { msg.textContent = error.code === '23505' ? tr('taken') : tr('err'); return; }
    profile = { username: name }; box.remove(); paintButton();
  };
  btn.onclick = save; inp.onkeydown = (e) => { if (e.key === 'Enter') save(); };
}
let ensuring = null;
function ensureUsername() {
  return ensuring || (ensuring = (async () => { const s = await session(); if (s && !(await loadProfile(s))) askUsername(); paintButton(); })().finally(() => { ensuring = null; }));
}

window.MLT_ACCOUNT = {
  get username() { return profile ? profile.username : null; },
  async api() {
    const s = await session(); if (!s) return null; const uid = s.user.id;
    return {
      uid,
      async list() { const { data, error } = await sb.from('saves').select('k,v,at'); if (error) throw error; return data || []; },
      async put(k, v, at) { const { error } = await sb.from('saves').upsert({ user_id: uid, k, v, at }, { onConflict: 'user_id,k' }); if (error) throw error; },
    };
  },
  open: openAccount,
};

if (sb) sb.auth.onAuthStateChange((ev) => {
  if (ev === 'SIGNED_IN') { window.mltCloudStart && window.mltCloudStart(); ensureUsername(); if (location.search.includes('code=') || location.hash.includes('access_token')) history.replaceState(null, '', here()); }
  if (ev === 'SIGNED_OUT') { profile = null; window.mltCloudStop && window.mltCloudStop(); paintButton(); }
});

// ---------------- UI
const css = document.createElement('style');
css.textContent = `#accBox{position:fixed;inset:0;z-index:9999;background:rgba(20,24,40,.45);display:flex;align-items:center;justify-content:center;padding:18px}
#accBox .card{background:#fff;border-radius:22px;max-width:380px;width:100%;padding:20px 18px 16px;font-family:Nunito,system-ui,sans-serif;box-shadow:0 18px 50px rgba(0,0,0,.25)}
#accBox h2{font-family:Fredoka,system-ui,sans-serif;margin:0 0 6px;font-size:22px}#accBox p{margin:0 0 12px;font-size:14px;color:#4a4f5c}
#accBox button{width:100%;border:0;border-radius:14px;padding:12px;font-size:15px;font-weight:700;margin-top:8px;cursor:pointer;font-family:inherit}
#accBox .ap{background:#111;color:#fff}#accBox .go{background:#fff;color:#222;border:2px solid #e3e5ea}#accBox .em{background:#5B8DEF;color:#fff}#accBox .gh{background:#f1f2f5;color:#333}
#accBox input{width:100%;box-sizing:border-box;border:2px solid #e3e5ea;border-radius:14px;padding:11px 12px;font-size:16px;margin-top:10px;font-family:inherit}
#accBox .card{position:relative}#accBox .xx{position:absolute;top:10px;right:10px;width:34px;height:34px;margin:0;padding:0;border-radius:50%;background:#f1f2f5;color:#555;font-size:18px;line-height:34px}#accBox .lnk{background:none;color:#5B8DEF;font-weight:700;font-size:14px;padding:6px;margin-top:4px}#accBox .msg{font-size:13px;margin-top:8px;color:#2E7D4F;min-height:1em}#accBox .sep{text-align:center;font-size:12px;color:#9aa0ab;margin:10px 0 0}`;
document.head.appendChild(css);

async function openAccount(opts = {}) {
  const s = await session(); const required = !!opts.required && !s;
  if (required && document.querySelector('#accBox[data-req]')) return;
  const box = document.createElement('div'); box.id = 'accBox'; if (required) box.dataset.req = '1';
  if (!sb) box.innerHTML = `<div class="card"><h2>👤 ${tr('title')}</h2><p>${tr('soon')}</p><button class="gh" data-x>${tr('close')}</button></div>`;
  else if (s) box.innerHTML = `<div class="card"><h2>👤 ${tr('title')}</h2><p>${tr('signedAs')} <b>${(profile ? profile.username : (s.user.email || '')).replace(/</g, '&lt;')}</b></p><button class="gh" data-out>${tr('out')}</button><button class="em" data-x>${tr('close')}</button></div>`;
  else {
    const prov = PROVIDERS.map((p) => p === 'apple' ? `<button class="ap" data-p="apple"> ${tr('apple')}</button>` : `<button class="go" data-p="google">G&nbsp; ${tr('google')}</button>`).join('');
    box.innerHTML = `<div class="card">${required ? '' : `<button class="xx" data-x aria-label="${tr('close')}">✕</button>`}<h2>👤 ${tr('title')}</h2><p>${tr('why')}</p>
    <div data-step1>${prov}${prov ? '<div class="sep">— ou / or —</div>' : ''}<input data-email type="email" inputmode="email" autocomplete="email" placeholder="${tr('email')}"><button class="em" data-mail>✉️ ${tr('sendCode')}</button></div>
    <div data-step2 hidden><p style="margin:0">${tr('sentTo')} <b data-to></b><br>${tr('typeIt')}</p><input data-code inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="${tr('code')}"><button class="em" data-verify>${tr('verify')}</button><button class="lnk" data-back>${tr('other')}</button></div>
    <div class="msg" style="color:#C0392B"></div></div>`;
  }
  document.body.appendChild(box);
  const msg = box.querySelector('.msg'), close = () => box.remove();
  box.addEventListener('click', (e) => { if (e.target === box && !required) close(); });
  box.querySelectorAll('[data-x]').forEach((b) => (b.onclick = close));
  const out = box.querySelector('[data-out]'); if (out) out.onclick = async () => { await sb.auth.signOut(); close(); if (REQUIRED) openAccount({ required: true }); };
  box.querySelectorAll('[data-p]').forEach((b) => (b.onclick = async () => {
    const { error } = await sb.auth.signInWithOAuth({ provider: b.dataset.p, options: { redirectTo: here() } });
    if (error) msg.textContent = tr('err');
  }));
  const mail = box.querySelector('[data-mail]'); if (!mail) return;
  const s1 = box.querySelector('[data-step1]'), s2 = box.querySelector('[data-step2]'), emIn = box.querySelector('[data-email]'), codeIn = box.querySelector('[data-code]');
  let em = '';
  const send = async () => {
    em = emIn.value.trim(); msg.textContent = '';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { msg.textContent = tr('badEmail'); return; }
    mail.disabled = true; const { error } = await sb.auth.signInWithOtp({ email: em, options: { emailRedirectTo: here() } }); mail.disabled = false;
    if (error) { msg.textContent = tr('err'); return; }
    // installed iPhone apps don't share storage with Safari, so the emailed code is the reliable route
    box.querySelector('[data-to]').textContent = em; s1.hidden = true; s2.hidden = false; codeIn.value = ''; codeIn.focus();
  };
  const verify = async () => {
    const token = codeIn.value.replace(/\D/g, ''); if (token.length < 6) return; msg.textContent = '';
    const { error } = await sb.auth.verifyOtp({ email: em, token, type: 'email' });
    if (error) msg.textContent = tr('err'); else close();
  };
  mail.onclick = send; emIn.onkeydown = (e) => { if (e.key === 'Enter') send(); };
  box.querySelector('[data-verify]').onclick = verify; codeIn.onkeydown = (e) => { if (e.key === 'Enter') verify(); };
  codeIn.oninput = () => { const t = codeIn.value.replace(/\D/g, ''); if (t.length === 6) verify(); };
  box.querySelector('[data-back]').onclick = () => { s2.hidden = true; s1.hidden = false; msg.textContent = ''; emIn.focus(); };
}

async function paintButton() {
  const b = document.getElementById('bAccount'); if (!b) return; const s = await session();
  b.textContent = s ? '👤 ' + (profile ? profile.username : tr('acc')) + ' ☁️' : '👤 ' + tr('acc');
}
const btn = document.getElementById('bAccount'); if (btn) { btn.onclick = () => openAccount(); paintButton(); }
if (sb) { ensureUsername(); if (REQUIRED) session().then((s) => { if (!s) openAccount({ required: true }); }); }
