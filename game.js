import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildCity, moveCity } from './city.js';
import { makeAudio } from './audio.js';
import { CASE_TXT, CASES } from './cases.js';
import { batchNode } from './batch.js';
import { CHAR, loadCharacters, canGLB, makeGLBAvatar, updateCharacters, loadFull } from './chars.js';
import { TV, t, tList, setLang, detectLang, getLang, LANGS, DICT } from './i18n.js';
import { EXTRA, EXTRA2, EXTRA3, EXTRA4, EXTRA5, EXTRA6, EXTRA7, EXTRA8, EXTRA9, EXTRA10, EXTRA11, EXTRA12, EXTRA13, EXTRA14, EXTRA15, EXTRA16, EXTRA17, EXTRA18, EXTRA19, EXTRA20 } from './i18n_mgr.js';
for (const l in EXTRA) Object.assign(DICT[l], EXTRA[l], EXTRA2[l], EXTRA3[l], EXTRA4[l], EXTRA5[l], EXTRA6[l], EXTRA7[l], EXTRA8[l], EXTRA9[l], EXTRA10[l], EXTRA11[l], EXTRA12[l], EXTRA13[l], EXTRA14[l], EXTRA15[l], EXTRA16[l], EXTRA17[l], EXTRA18[l], EXTRA19[l], EXTRA20[l]);
const AU = makeAudio();

/* =========================================================
   Life Crisis Tycoon — London prototype (build 2)
   ========================================================= */
const $ = (id) => document.getElementById(id);
let RNG = Math.random;
const rnd = (a) => a[Math.floor(RNG() * a.length)];
const crnd = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const money = (n) => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US');
const saveKey = (c) => 'ahq_' + (c || 'london') + '_v2';
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let x = Math.imul(a ^ a >>> 15, 1 | a); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }

// ---------------- data ----------------
const PROBLEMS = {
  doom: { e: '📱', room: 'detox', fee: 180 }, group: { e: '💬', room: 'detox', fee: 200 },
  sunday: { e: '😰', room: 'nap', fee: 190 }, burn: { e: '🔥', room: 'nap', fee: 240 }, gloom: { e: '🌧️', room: 'nap', fee: 210 },
  rent: { e: '🏠', room: 'budget', fee: 260 }, subs: { e: '💳', room: 'budget', fee: 220 }, flat: { e: '🛏️', room: 'budget', fee: 230 },
  boss: { e: '😤', room: 'career', fee: 280 }, ladder: { e: '🪜', room: 'career', fee: 300 },
  ghosted: { e: '👻', room: 'social', fee: 230 }, apps: { e: '💔', room: 'social', fee: 210 }, lonely: { e: '🫂', room: 'social', fee: 240 },
  toddler: { e: '🧸', room: 'parent', fee: 250 }, schoolrun: { e: '🎒', room: 'parent', fee: 230 },
  tablet: { e: '🎮', room: 'parent', fee: 240, fam: true }, homework: { e: '📝', room: 'parent', fee: 230, fam: true }, sugar: { e: '🍭', room: 'parent', fee: 220, fam: true },
  moving: { e: '📦', room: 'moving', fee: 260 }, newcity: { e: '🗺️', room: 'moving', fee: 240 },
  tummy: { e: '🤢', room: 'pharmacy', fee: 170 }, headache: { e: '🤕', room: 'pharmacy', fee: 160 }, screeneyes: { e: '🥲', room: 'pharmacy', fee: 150 },
  filter: { e: '🤳', room: 'glowup', fee: 280 }, haircut: { e: '💇', room: 'glowup', fee: 220 }, botoxfomo: { e: '💉', room: 'glowup', fee: 260 },
  topper: { e: '📚', room: 'career', fee: 260, city: 'mumbai' }, sharmaji: { e: '🏆', room: 'therapy', fee: 290, city: 'mumbai' }, wedding: { e: '💸', room: 'wedding', fee: 320, city: 'mumbai' }, train: { e: '🚆', room: 'nap', fee: 220, city: 'mumbai' },
  overtime: { e: '🌃', room: 'jjim', fee: 280, city: 'seoul' }, hagwon: { e: '✏️', room: 'therapy', fee: 290, city: 'seoul' }, beauty: { e: '🪞', room: 'glowup', fee: 300, city: 'seoul' }, nunchi: { e: '👀', room: 'social', fee: 250, city: 'seoul' },
  commute: { e: '🚗', room: 'nap', fee: 240, city: 'saopaulo' }, novela: { e: '📺', room: 'detox', fee: 230, city: 'saopaulo' }, saudade: { e: '🥹', room: 'roda', fee: 280, city: 'saopaulo' },
  hustle: { e: '💼', room: 'garage', fee: 270, city: 'lagos' }, fuel: { e: '⛽', room: 'budget', fee: 230, city: 'lagos' }, goslow: { e: '🚦', room: 'nap', fee: 210, city: 'lagos' }, aunty: { e: '💍', room: 'social', fee: 240, city: 'lagos' },
  paperwork: { e: '📑', room: 'ahwa', fee: 290, city: 'cairo' }, honk: { e: '📯', room: 'nap', fee: 240, city: 'cairo' }, heatgrump: { e: '🥵', room: 'pharmacy', fee: 220, city: 'cairo' },
  rentshock: { e: '🏙️', room: 'budget', fee: 300, city: 'newyork' }, grind: { e: '☕', room: 'yoga', fee: 320, city: 'newyork' }, swipe: { e: '📲', room: 'social', fee: 260, city: 'newyork' }, roomie: { e: '🛋️', room: 'therapy', fee: 290, city: 'newyork' },
  ahorita: { e: '⏳', room: 'career', fee: 270, city: 'mexico' }, quake: { e: '🫨', room: 'therapy', fee: 300, city: 'mexico' }, antojo: { e: '🌮', room: 'pharmacy', fee: 220, city: 'mexico' }, coraje: { e: '😤', room: 'lucha', fee: 290, city: 'mexico' },
  quarter: { e: '🫠', room: 'therapy', fee: 340, myst: true }, thirty: { e: '🎂', room: 'career', fee: 320, myst: true }, situation: { e: '🫤', room: 'social', fee: 300, myst: true }, mercury: { e: '🪐', room: 'nap', fee: 310, myst: true },
  lowmood: { e: '🪫', room: 'therapy', fee: 300, care: true }, impostor: { e: '🎭', room: 'therapy', fee: 290 }, overthink: { e: '🌀', room: 'therapy', fee: 280 },
};
const ROOMS = {
  budget: { e: '💸', cost: 2500, role: 'coach', time: 8, pill: '#A86A1E', floor: '#E7C08C' },
  nap: { e: '😴', cost: 3000, role: 'guide', time: 10, pill: '#7F68C9', floor: '#D8CCF4' },
  detox: { e: '📵', cost: 2200, role: 'guide', time: 7, pill: '#1F74C4', floor: '#CFE6F7' },
  career: { e: '💼', cost: 2800, role: 'coach', time: 9, pill: '#C2577A', floor: '#F2D6DE' },
  cafe: { e: '🍵', cost: 1800, role: null, pill: '#2E7D4F', floor: '#E8C796' },
  lab: { e: '🔬', cost: 4000, role: 'researcher', time: 0, pill: '#3B4A6B', floor: '#E3E8EE' },
  social: { e: '🥂', cost: 2600, role: 'guide', time: 9, pill: '#E0567F', floor: '#FBD9E3' },
  parent: { e: '🧸', cost: 2600, role: 'coach', time: 8, pill: '#E08A2E', floor: '#FFE6B8' },
  moving: { e: '📦', cost: 2400, role: 'coach', time: 8, pill: '#8A6A45', floor: '#EBDCC6' },
  pharmacy: { e: '💊', cost: 2000, role: 'pharmacist', time: 5, pill: '#2BB5A6', floor: '#DFF5F1' },
  glowup: { e: '✨', cost: 3000, role: 'guide', time: 9, pill: '#D4537E', floor: '#FBEAF0' },
  wedding: { e: '💍', cost: 2800, role: 'coach', time: 10, pill: '#D4537E', floor: '#FBE3EC', city: 'mumbai' },
  jjim: { e: '♨️', cost: 2800, role: 'guide', time: 10, pill: '#C2703A', floor: '#F2DCC6', city: 'seoul' },
  yoga: { e: '🧘', cost: 3000, role: 'guide', time: 10, pill: '#3B8D99', floor: '#D6EEF0', city: 'newyork' },
  lucha: { e: '🤼', cost: 2800, role: 'guide', time: 9, pill: '#D63A7A', floor: '#F7D6E4', city: 'mexico' },
  ahwa: { e: '🫖', cost: 2700, role: 'guide', time: 9, pill: '#B5793A', floor: '#F1DFC2', city: 'cairo' },
  roda: { e: '🥁', cost: 2600, role: 'guide', time: 9, pill: '#2E9E5B', floor: '#D8F0D8', city: 'saopaulo' },
  garage: { e: '🔧', cost: 2600, role: 'coach', time: 9, pill: '#E3B341', floor: '#F2E2B8', city: 'lagos' },
  shop: { e: '🛒', cost: 2200, role: 'host', time: 0, pill: '#E9785F', floor: '#FCE3D8', shop: true },
  staffroom: { e: '☕', cost: 1500, role: null, pill: '#8A6A45', floor: '#F1E4CC', staffOnly: true },
  toilet: { e: '🚻', cost: 1200, role: null, pill: '#5AB8F0', floor: '#E6F3FC', loo: true },
  therapy: { e: '🛋️', cost: 3200, role: 'therapist', time: 11, pill: '#0E6E2C', floor: '#D7EBDD' },
};
const ROLES = {
  host: { uni: '#FFD25E', pants: '#2F3A52', wage: [600, 950], bg: '#FFF3CF', strip: '#F2C14E' },
  coach: { uni: '#16963C', pants: '#2F3A52', wage: [800, 1400], bg: '#DDF3E2', strip: '#7ACB4E' },
  guide: { uni: '#B9A6E8', pants: '#B9A6E8', wage: [700, 1200], bg: '#ECE6FA', strip: '#B57BE8' },
  maint: { uni: '#FF6B5B', pants: '#FF6B5B', wage: [500, 800], bg: '#FFE4DF', strip: '#FF9F43' },
  researcher: { uni: '#FFFFFF', pants: '#2F3A52', wage: [900, 1500], bg: '#E3ECF5', strip: '#5AB8F0' },
  pharmacist: { uni: '#FFFFFF', pants: '#2BB5A6', wage: [700, 1100], bg: '#DFF5F1', strip: '#2BB5A6' },
  therapist: { uni: '#0E6E2C', pants: '#3B4A6B', wage: [1000, 1600], bg: '#D7EBDD', strip: '#2E7D4F' },
};
const TRAITS = [
  { n: 'Actually Reads Emails', t: 'good', speed: 1.2 }, { n: 'Spreadsheet Wizard', t: 'good', speed: 1.15 }, { n: 'Calm Voice', t: 'good', calm: 0.7 }, { n: 'Has a Dog', t: 'good', vibe: 1 },
  { n: 'Replies in Voice Notes', t: 'bad', speed: 0.85 }, { n: 'Quiet Quitter', t: 'bad', speed: 0.8 }, { n: 'Always on LinkedIn', t: 'bad', wageUp: 1.1 },
  { n: 'Gym Rat', t: 'fun' }, { n: 'Plant Parent', t: 'fun' }, { n: 'Main Character', t: 'fun' }, { n: 'Astrology Fan', t: 'fun' },
];
const PROJECTS = { nap: { cost: 120, e: '😴' }, mute: { cost: 120, e: '🔇' }, sheet: { cost: 120, e: '📊' }, bins: { cost: 90, e: '🗑️' }, oat: { cost: 80, e: '🥛' }, rent: { cost: 1e9, e: '🏠' } };
for (const k of ['quarter', 'thirty', 'situation', 'mercury']) PROJECTS['m_' + k] = { cost: 100, e: '❓', myst: k };
const EMERGENCIES = { subway: { room: 'yoga', probs: ['grind'], city: 'newyork' }, replica: { room: 'therapy', probs: ['quake'], city: 'mexico' }, stamps: { room: 'ahwa', probs: ['paperwork'], city: 'cairo' }, weddingseason: { room: 'wedding', probs: ['wedding'], city: 'mumbai' }, crunch: { room: 'jjim', probs: ['overtime'], city: 'seoul' }, gridlock: { room: 'nap', probs: ['commute'], city: 'saopaulo' }, blackout: { room: 'garage', probs: ['hustle', 'fuel'], city: 'lagos' }, valentine: { room: 'social', probs: ['ghosted', 'apps', 'lonely'] }, rentriot: { room: 'budget', probs: ['rent', 'flat', 'subs'] }, strike: { room: 'nap', probs: ['sunday', 'burn', 'gloom'], city: 'london' }, layoff: { room: 'career', probs: ['boss', 'ladder'] }, bills: { room: 'budget', probs: ['rent', 'subs', 'flat'] } };
const CITY_NAMES = { newyork: ['Jess', 'Marcus', 'Priya', 'Danny', 'Aaliyah', 'Ethan', 'Mei', 'Carlos', 'Rachel', 'Malik', 'Sofia', 'Tyler', 'Grace', 'Omar', 'Brooke', 'Kenji'], mexico: ['Sofía', 'Diego', 'Valeria', 'Luis', 'Ximena', 'Carlos', 'Fernanda', 'Jorge', 'Mariana', 'Alejandro', 'Daniela', 'Mateo', 'Lupita', 'Emiliano', 'Camila', 'Andrés'], cairo: ['Omar', 'Noor', 'Yasmin', 'Karim', 'Mariam', 'Ahmed', 'Salma', 'Youssef', 'Hana', 'Mostafa', 'Laila', 'Tarek', 'Nadia', 'Amr', 'Dina', 'Sherif'] };
const FIRST = ['Priya', 'Marcus', 'Jade', 'Omar', 'Zoe', 'Kai', 'Amara', 'Leo', 'Noor', 'Mateo', 'Hana', 'Tunde', 'Ines', 'Sam', 'Riya', 'Ezra', 'Lola', 'Dev', 'Maya', 'Femi', 'Chloe', 'Arjun', 'Sofia', 'Kwame', 'Yuki', 'Min-jun', 'Lucas', 'Aiko'];
const LAST = ['Shah', 'Bello', 'Kim', 'Haddad', 'Okafor', 'Nguyen', 'Silva', 'Brown', 'Patel', 'Rossi', 'Mensah', 'Garcia', 'Ito', 'Kowalski', 'Adeyemi', 'Murphy', 'Park', 'Dubois'];
const CITIES = {
  london: { lvl: 0, region: 'rg.europe', cash: 15000, rent: 2400, rain: 0.45, pin: [44.8, 23.4], desc: 'map.desc', tag: 'brief.tag', brief: 'brief.desc', rules: [['🌧️', 'brief.r1'], ['📝', 'brief.r2'], ['🧍', 'brief.r3']], chips: [['b', 'chip.rain'], ['b', 'chip.planning'], ['r', 'chip.strike']], start: 'start.landlord',
    goals: [[['helped', 45], ['vibes', 60]], [['cash', 45000], ['helped', 110]], [['cash', 80000], ['vibes', 85]]] },
  lagos: { lvl: 1, region: 'rg.africa', unlock: 'london', cash: 14000, rent: 2600, rain: 0.25, pin: [45.1, 52.0], desc: 'lg.desc', tag: 'lg.tag', brief: 'lg.brief', rules: [['⚡', 'lg.r1'], ['💼', 'lg.r2'], ['🚦', 'lg.r3']], chips: [['b', 'lg.c1'], ['b', 'lg.c2'], ['r', 'lg.c3']], start: 'lg.landlord', power: true, hustle: true, waves: true,
    goals: [[['helped', 70], ['vibes', 60]], [['cash', 70000], ['helped', 540]], [['wave', 45], ['cash', 135000]]] },
  mumbai: { lvl: 2, region: 'rg.asia', unlock: 'lagos', cash: 13000, rent: 2200, rain: 0.5, monsoon: true, pin: [67.4, 45.0], desc: 'mb.desc', tag: 'mb.tag', brief: 'mb.brief', rules: [['🌧️', 'mb.r1'], ['👨‍👩‍👧', 'mb.r2'], ['💍', 'mb.r3']], chips: [['b', 'mb.c1'], ['b', 'mb.c2'], ['r', 'mb.c3']], start: 'mb.landlord', groups: { chance: 0.22, kind: 'families' },
    goals: [[['helped', 110], ['vibes', 60]], [['cash', 90000], ['families', 25]], [['wedding', 55], ['vibes', 85]]] },
  seoul: { lvl: 3, region: 'rg.asia', unlock: 'mumbai', cash: 12000, rent: 3000, rain: 0.3, night: true, pin: [82.7, 32.0], desc: 'se.desc', tag: 'se.tag', brief: 'se.brief', rules: [['🌙', 'se.r1'], ['💼', 'se.r2'], ['🪞', 'se.r3']], chips: [['b', 'se.c1'], ['b', 'se.c2'], ['r', 'se.c3']], start: 'se.landlord',
    goals: [[['helped', 125], ['vibes', 65]], [['cash', 90000], ['helped', 630]], [['night', 450], ['helped', 1350]]] },
  saopaulo: { lvl: 4, region: 'rg.americas', unlock: 'seoul', cash: 12000, rent: 2500, rain: 0.3, waves: true, pin: [27.3, 73.2], desc: 'sp.desc', tag: 'sp.tag', brief: 'sp.brief', rules: [['🚗', 'sp.r1'], ['🥳', 'sp.r2'], ['📺', 'sp.r3']], chips: [['b', 'sp.c1'], ['b', 'sp.c2'], ['r', 'sp.c3']], start: 'sp.landlord', groups: { chance: 0.3, kind: 'groups' },
    goals: [[['helped', 145], ['vibes', 65]], [['cash', 110000], ['groups', 70]], [['groups', 145], ['vibes', 80]]] },
  cairo: { lvl: 5, region: 'rg.africa', unlock: 'saopaulo', cash: 12000, rent: 2500, sig: 'paperwork', rain: 0.05, hot: true, evening: true, pin: [53.9, 36.9], desc: 'cr.desc', tag: 'cr.tag', brief: 'cr.brief', rules: [['🥵', 'cr.r1'], ['🌆', 'cr.r2'], ['📑', 'cr.r3']], chips: [['b', 'cr.c1'], ['b', 'cr.c2'], ['r', 'cr.c3']], start: 'cr.landlord',
    goals: [[['helped', 160], ['vibes', 65]], [['cash', 100000], ['tea', 50]], [['evening', 450], ['vibes', 82]]] },
  mexico: { lvl: 6, region: 'rg.americas', unlock: 'cairo', cash: 12000, rent: 2600, rain: 0.25, quake: true, altitude: true, sig: 'coraje', pin: [13.1, 41.0], desc: 'mx.desc', tag: 'mx.tag', brief: 'mx.brief', rules: [['🚨', 'mx.r1'], ['⛰️', 'mx.r2'], ['🤼', 'mx.r3']], chips: [['b', 'mx.c1'], ['b', 'mx.c2'], ['r', 'mx.c3']], start: 'mx.landlord',
    goals: [[['helped', 175], ['vibes', 65]], [['cash', 110000], ['lucha', 55]], [['quake', 60], ['vibes', 84]]] },
  newyork: { lvl: 7, region: 'rg.americas', unlock: 'mexico', cash: 14000, rent: 3600, rain: 0.3, tips: true, impatient: true, sig: 'grind', pin: [23.8, 28.3], desc: 'ny.desc', tag: 'ny.tag', brief: 'ny.brief', rules: [['💸', 'ny.r1'], ['⏱️', 'ny.r2'], ['🧘', 'ny.r3']], chips: [['b', 'ny.c1'], ['b', 'ny.c2'], ['r', 'ny.c3']], start: 'ny.landlord',
    goals: [[['helped', 190], ['vibes', 68]], [['cash', 150000], ['yoga', 60]], [['tips', 300], ['vibes', 86]]] },
};
const LOCKED_PINS = [];
const metric = (s, m) => (m === 'helped' ? s.served : m === 'vibes' ? s.vibes : m === 'cash' ? s.cash : (s.cnt || {})[m] || 0);
function incCnt(k) { S.cnt = S.cnt || {}; S.cnt[k] = (S.cnt[k] || 0) + 1; }
const isNight = () => cityOf().night && S.t > DAY_LEN * 0.66;
const mkGoals = (arr) => arr.map((parts, i) => ({ k: 'g' + (i + 1), parts, ok: (s) => parts.every(([m, v]) => metric(s, m) >= v) }));
let GOALS = mkGoals(CITIES.london.goals);
const goalText = (G) => G.parts.map(([m, v]) => t('gp.' + m, { n: m === 'cash' ? money(v) : v })).join(' · ');
const cityOf = () => CITIES[(S && S.city) || 'london'];
const DAY_LEN = 90, RENT_EVERY = 7, BILL_K = 2.5, WAGE_K = 2.0, ELEC_K = 1.5, // 90 s days; weekly bills scaled so cost per real minute stays balanced // weekly bills (rent ×1.5, wages ×1.2 of the old 4-day amounts — balanced by bot runs so a sensible HQ makes a profit)
  // weekly bills; amounts scaled from the old 4-day cycle so the economy keeps its balance
  ANNEX_COST = 8000, QUICK_LEN = 180;
let RENT = 2400;
const isMystK = (k) => PROBLEMS[k] && PROBLEMS[k].myst && !S.research.done.includes('m_' + k);
const pn = (k) => (isMystK(k) ? '???' : t('p.' + k)), rn = (k) => t('r.' + k), roleN = (k) => t('role.' + k), trN = (n) => t('t.' + n), dayN = (d) => t('day.n', { d });

// ---------------- state ----------------
let S;
function newState() {
  return { v: 2, mode: 'career', cash: 15000, vibes: 60, day: 1, t: 0, served: 0, left: 0, earned: 0, stars: 0, annex: 'locked', annexDay: 0,
    rooms: [], staff: [], chat: [], unread: 0, nextId: 1, rainy: false,
    research: { done: [], active: null, pts: 0 }, nextInspect: 3, inspectAt: -1, nextEm: 2, emAt: -1, em: null, qt: QUICK_LEN, pepT: 0, pepCd: 0, tut: -1, tips: {}, desk: { x: 5.25, z: 5.25, r: Math.PI / 4 } };
}
function save() { if (!S || S.mode !== 'career') return; try { if (inGame) S.vis = R.visitors.filter((v) => !['exit', 'angry', 'toShop', 'shopping'].includes(v.state)).map(snapVisitor); localStorage.setItem(saveKey(S.city), JSON.stringify(S)); const p = profile(); p.last = S.city || 'london'; p.stars = p.stars || {}; p.stars[S.city || 'london'] = Math.max(p.stars[S.city || 'london'] || 0, S.stars); localStorage.setItem('ahq_profile', JSON.stringify(p)); } catch (e) {} }
function load(c) { try { const s = JSON.parse(localStorage.getItem(saveKey(c))); if (s && s.v === 2) return s; } catch (e) {} return null; }

// ---------------- three setup ----------------
const canvas = $('c');
const GFX = (() => { let q = null; try { q = localStorage.getItem('ahq_gfx'); } catch (e) {}
  let hint = null; try { hint = localStorage.getItem('ahq_gfx_hint2'); } catch (e) {}
  const weak = hint === 'low' || (navigator.deviceMemory && navigator.deviceMemory <= 3);
  const mode = q === 'high' || q === 'low' ? q : weak ? 'low' : 'high';
  return { pref: q || 'auto', mode, low: mode === 'low', batch: true }; })();
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(GFX.low ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, 2.5));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#DCE6EC');
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.22;
const hemi = new THREE.HemisphereLight('#FFE9D2', '#B39C82', 0.62); scene.add(hemi);
const fill = new THREE.DirectionalLight('#E6ECFF', 0.3); fill.position.set(-14, 12, -10); scene.add(fill);
const sun = new THREE.DirectionalLight('#FFD9AC', 3.1);
sun.position.set(16, 24, 10); sun.castShadow = true; sun.shadow.mapSize.set(GFX.low ? 1024 : 2048, GFX.low ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -20, right: 22, top: 20, bottom: -20, near: 1, far: 80 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
scene.add(sun); sun.target.position.set(-1, 0, 2); scene.add(sun.target);
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
const view = { tx: -0.6, tz: -1.6, half: 15.5, yaw: Math.PI / 4, pitch: 0.53, yawT: null };
function placeCam() {
  const a = innerWidth / innerHeight;
  cam.left = -view.half * a; cam.right = view.half * a; cam.top = view.half; cam.bottom = -view.half; cam.updateProjectionMatrix();
  const D = 65, cp = Math.cos(view.pitch);
  cam.position.set(view.tx + Math.sin(view.yaw) * cp * D, Math.sin(view.pitch) * D, view.tz + Math.cos(view.yaw) * cp * D); cam.lookAt(view.tx, 0, view.tz); cam.updateMatrixWorld();
  updateCutaway();
}
const GHOST = new Map();
function ghostOf(m) { let g = GHOST.get(m); if (!g) { g = m.clone(); g.transparent = true; g.opacity = 0.38; g.depthWrite = false; GHOST.set(m, g); } return g; }
function fadeNode(node, on) {
  if (node.userData.faded === on) return; node.userData.faded = on;
  node.traverse((o) => { if (!o.isMesh || Array.isArray(o.material)) return; if (!o.userData.solidMat) { o.userData.solidMat = o.material; o.userData.cs0 = o.castShadow; } o.material = on ? ghostOf(o.userData.solidMat) : o.userData.solidMat; o.castShadow = !on && o.userData.cs0 !== false; });
}
function updateCutaway() {
  if (typeof world === 'undefined') return;
  const cx = Math.sin(view.yaw), cz = Math.cos(view.yaw);
  for (const w of world.cutWalls || []) { const n = w.userData.n; w.visible = n[0] * cx + n[1] * cz < 0.2; }
  // walls (and doors) facing the camera keep their real height but turn see-through, so proportions stay right
  // Theme Hospital / Two Point style: a wall stays full height only when nothing walkable lies behind it from the camera
  // (outer back walls). Every other wall — and the door in it — drops to the same low stub, so heights stay coherent.
  const cut = (n, p) => { const f = n[0] * cx + n[1] * cz; if (f > 0.2) return true; if (!p || typeof inFloor !== 'function') return false; return inFloor(p[0] + n[0] * 0.7, p[1] + n[1] * 0.7) || inFloor(p[0] + n[0] * 0.7 + 0.01, p[1] + n[1] * 0.7 + 0.01); };
  for (const w of world.roomCut || []) w.scale.y = cut(w.userData.n, w.userData.p) ? 0.22 : 1;
  for (const d of world.doors || []) d.g.scale.y = cut(d.g.userData.n, [d.x, d.z]) ? 0.22 : 1;
  const tan = Math.tan(view.pitch);
  for (const b of world.cityB || []) {
    const dx = b.x - view.tx, dz = b.z - view.tz, along = dx * cx + dz * cz;
    const perp = Math.abs(dx * cz - dz * cx);
    const occl = along > -b.r && perp < 18 + b.r && b.h / tan > along - b.r - 9;
    if (b.lm) b.o.visible = !occl; else b.o.scale.y = occl ? Math.max(0.06, Math.min(1, 1.6 / b.h)) : 1;
  }
}
function resize() { renderer.setSize(innerWidth, innerHeight, false); placeCam(); }
addEventListener('resize', resize);

// ---------------- helpers ----------------
const MC = {}, GC = {};
function mat(c, o = {}) {
  const k = c + '|' + (o.r ?? '') + (o.e ?? '') + (o.ei ?? '') + (o.op ?? '') + (o.m ?? '') + (o.mapK ?? '');
  if (!MC[k]) MC[k] = new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.7, metalness: o.m ?? 0, emissive: o.e ?? '#000000', emissiveIntensity: o.ei ?? 1, transparent: o.op != null, opacity: o.op ?? 1, map: o.map || null });
  return MC[k];
}
function rbox(w, h, d, c, r = 0.06, o) {
  const rr = Math.max(0.005, Math.min(r, w / 2 - 0.002, h / 2 - 0.002, d / 2 - 0.002));
  const k = 'b' + w + '|' + h + '|' + d + '|' + rr;
  if (!GC[k]) GC[k] = new RoundedBoxGeometry(w, h, d, GFX.low ? 1 : 2, rr);
  const m = new THREE.Mesh(GC[k], mat(c, o)); m.castShadow = m.receiveShadow = true; return m;
}
function cyl(rt, rb, h, c, o, seg = GFX.low ? 12 : 20) {
  const k = 'c' + rt + '|' + rb + '|' + h + '|' + seg;
  if (!GC[k]) GC[k] = new THREE.CylinderGeometry(rt, rb, h, seg);
  const m = new THREE.Mesh(GC[k], mat(c, o)); m.castShadow = m.receiveShadow = true; return m;
}
function sph(r, c, o) {
  const k = 's' + r;
  if (!GC[k]) GC[k] = GFX.low ? new THREE.SphereGeometry(r, 12, 8) : new THREE.SphereGeometry(r, 20, 14);
  const m = new THREE.Mesh(GC[k], mat(c, o)); m.castShadow = m.receiveShadow = true; return m;
}
function put(o, x, y, z, p = scene) { o.position.set(x, y, z); p.add(o); return o; }
function grp(x = 0, z = 0, rot = 0, p = scene) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; p.add(g); return g; }
function canvasTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  if (rep) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(rep[0], rep[1]); }
  return tx;
}
const woodTex = (a, b, rep) => canvasTex(128, 128, (g, w) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(0, i * 16, w, 16); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, i * 16, w, 1); } }, rep);
const tileTex = (a, b, rep) => canvasTex(64, 64, (g) => { g.fillStyle = a; g.fillRect(0, 0, 64, 64); g.fillStyle = b; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32); }, rep);

// ---------------- people ----------------
const SKIN = ['#F3D2B3', '#E8BE98', '#C68B5E', '#9A6440', '#6B4127', '#4A2D1C'];
const HAIR = ['#1C120C', '#2B1D14', '#5A3A22', '#7A3B1E', '#C98E4B', '#E9EEF2', '#FF8FAB', '#5B8DEF', '#3A2A2A'];
const SHIRTS = ['#E9785F', '#5AB8F0', '#F4EFE6', '#7F68C9', '#FF9F43', '#2BB5A6', '#E86A8A', '#8A9A5B', '#3B4A6B', '#C9B6F2', '#F2C14E'];
const STYLES = ['short', 'long', 'bun', 'curly', 'beanie', 'beard', 'hijab', 'bald'];
// Appearance entry point: GLB avatar when available for this kind/outfit, else the procedural one (fallback).
function outfitKey(kind, o) { return kind === 'staff' ? o.role : kind === 'manager' ? (o.model || 'mgr_h') : (o.vm && CHAR.A.full[o.vm] ? o.vm : 'casual'); }
// ---- modelled visitors: 28 people; who shows up depends on the city's population, never on the problem they bring ----
// h = height in m (HUD placement), kid = only comes along with a family group
const VIS = { v01: { h: 1.65 }, v02: { h: 1.8 }, v03: { h: 1.68 }, v04: { h: 1.74 }, v05: { h: 1.62 }, v06: { h: 1.75 }, v07: { h: 1.63 }, v08: { h: 1.76 }, v09: { h: 1.65 }, v10: { h: 1.35, chair: true }, v11: { h: 1.64 }, v12: { h: 1.8 }, v13: { h: 1.66 }, v14: { h: 1.78 },
  v15: { h: 1.8 }, v16: { h: 1.74 }, v17: { h: 1.6 }, v18: { h: 1.7 }, v19: { h: 1.6 }, v20: { h: 1.63 }, v21: { h: 1.56 }, v22: { h: 1.78 }, v23: { h: 1.66 }, v24: { h: 1.8 }, v25: { h: 1.15, kid: 1 }, v26: { h: 1.28, kid: 1 }, v27: { h: 1.2, kid: 1 }, v28: { h: 1.22, kid: 1 } };
const VIS_POOL = {
  london: { v01: 3, v02: 3, v03: 4, v04: 4, v05: 3, v06: 3, v07: 2, v08: 2, v09: 2, v10: 1, v11: 3, v12: 4, v15: 1, v22: 1, v25: 1, v26: 1, v27: 1, v28: 1 },
  lagos: { v01: 4, v02: 4, v11: 4, v13: 6, v14: 5, v15: 6, v16: 5, v10: 1, v12: 1, v03: 1, v06: 1, v25: 2, v26: 2 },
  mumbai: { v05: 5, v06: 5, v17: 6, v18: 5, v19: 6, v10: 1, v03: 1, v02: 1, v27: 3 },
  seoul: { v07: 5, v08: 5, v20: 6, v21: 5, v22: 6, v10: 1, v03: 1, v12: 1, v02: 1, v28: 3 },
  newyork: { v01: 3, v02: 3, v03: 3, v04: 3, v05: 2, v06: 2, v07: 2, v08: 2, v09: 3, v10: 1, v11: 3, v12: 3, v13: 2, v15: 2, v17: 2, v20: 2, v22: 2, v23: 2, v24: 2, v25: 2, v26: 2, v27: 2, v28: 2 },
  mexico: { v09: 5, v24: 5, v23: 4, v03: 2, v04: 2, v12: 2, v01: 2, v02: 2, v11: 1, v10: 1, v25: 2, v26: 2, v27: 1 },
  cairo: { v13: 3, v14: 2, v17: 4, v18: 4, v19: 3, v05: 3, v06: 3, v01: 2, v02: 2, v15: 2, v16: 2, v10: 1, v25: 2, v26: 2, v27: 2 },
  saopaulo: { v09: 5, v24: 5, v23: 3, v03: 3, v04: 3, v12: 3, v02: 3, v01: 2, v11: 2, v07: 1, v10: 1, v25: 1, v26: 1, v27: 1 },
};
const visPool = (c) => VIS_POOL[c || (S && S.city) || 'london'] || VIS_POOL.london;
function pickVis(kid, noChair) {
  const P = visPool(), ks = Object.keys(P).filter((k) => !!VIS[k].kid === !!kid && !(noChair && VIS[k].chair)); if (!ks.length) return null;
  let r = RNG() * ks.reduce((a, k) => a + P[k], 0); for (const k of ks) { r -= P[k]; if (r <= 0) return k; } return ks[ks.length - 1];
}
const VIS_MALE = new Set(['v02', 'v04', 'v06', 'v08', 'v10', 'v12', 'v14', 'v15', 'v16', 'v18', 'v22', 'v23', 'v24', 'v26', 'v28']);
// body language by problem (shared clips, bought once): how they walk, wait and sit
const PSTYLE = {}; const sty = (ks, st) => ks.split(' ').forEach((k) => (PSTYLE[k] = st));
sty('doom group apps filter novela', { walk: 'WalkText' });
sty('burn sunday gloom overtime commute goslow train lowmood', { walk: 'WalkTired', idle: 'IdleBreath', sit: 'SitDoze' });
sty('headache screeneyes', { idle: 'IdleHead', phone: 'IdleHead' }); sty('tummy', { walk: 'WalkTired', idle: 'IdleHead' });
sty('overthink mercury quarter impostor thirty situation ladder saudade nunchi newcity moving', { walk: 'WalkThink', idle: 'IdleConfused' });
sty('grind rentshock', { walk: 'WalkQuick', sit: 'SitCross' }); sty('swipe', { walk: 'WalkText' }); sty('roomie', { walk: 'WalkThink', idle: 'IdleConfused' });
sty('ahorita', { walk: 'WalkTired', idle: 'IdleBreath' }); sty('quake coraje', { walk: 'WalkQuick', idle: 'IdleConfused' }); sty('antojo', { walk: 'WalkTired', idle: 'IdleHead' });
sty('heatgrump honk', { walk: 'WalkTired', idle: 'IdleHead' }); sty('paperwork', { walk: 'WalkQuick', idle: 'IdleConfused' });
sty('boss hustle rent fuel subs flat', { walk: 'WalkQuick', sit: 'SitCross' });
sty('haircut botoxfomo beauty', { idle: 'IdleMirror', phone: 'IdleMirror' }); sty('lonely ghosted', { walk: 'WalkTired', idle: 'IdleBreath' });
sty('schoolrun toddler tablet homework sugar', { walk: 'WalkQuick' });
const styleFor = (prob) => Object.assign({ angry: 'IdleAngry' }, PSTYLE[prob] || {});
const EXTRA_VIS = ['v16', 'v08', 'v15', 'v22']; // inspector + the "crew"
function visPerson(key, fb) { if (CHAR.A.full[key]) { const a = person({ vm: key, tall: VIS[key].h / 1.75 }, 'visitor'); if (a.userData.p.glb) return a; } loadFull(key); return person(fb); }
function preloadVisitors(c) { if (CHAR.status !== 'ready' || !CHAR.man || !CHAR.man.visitors) return; for (const k of Object.keys(visPool(c))) loadFull(k); for (const k of EXTRA_VIS.concat(['v25', 'v26', 'v27', 'v28'])) loadFull(k); }
function visitorPose(v) {
  const p = v.av.userData.p, sp = v.state === 'wait' ? v.spot : v.state === 'treat' ? v.rspot : v.state === 'loo' ? v.lspot : v.state === 'shopping' ? v.sspot : null;
  poseStand(p); if (sp && sp.sit) poseSit(p, sp.lie); if (['queue', 'wait', 'shopping'].includes(v.state)) posePhone(p);
}
function swapVisitorAvatar(v) {
  const old = v.av, av = person(v.look, 'visitor'); if (!av.userData.p.glb) return;
  av.position.copy(old.position); av.rotation.copy(old.rotation); scene.remove(old); scene.add(av); av.userData.p.waitPose = old.userData.p.waitPose; if (v.cured && av.userData.p.anim && av.userData.p.anim.calm) av.userData.p.anim.calm(); v.av = av; v.gag = addGag(av, v.prob, v.look); visitorPose(v);
}
function person(o, kind) {
  if (kind && canGLB(kind, outfitKey(kind, o))) { try { return makeGLBAvatar(o, kind, outfitKey(kind, o)); } catch (e) { CHAR.errors.push('avatar ' + e.message); } }
  return proceduralPerson(o);
}
function proceduralPerson(o) {
  const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
  const sx = o.wide || 1, sy = o.tall || 1; body.scale.set(sx, sy, sx);
  const legs = [], knees = [], arms = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(s * 0.1, 0.55, 0); body.add(hip);
    put(rbox(0.17, 0.3, 0.19, o.pants, 0.07), 0, -0.15, 0, hip);
    const knee = new THREE.Group(); knee.position.set(0, -0.28, 0); hip.add(knee);
    put(rbox(0.16, 0.25, 0.18, o.pants, 0.06), 0, -0.12, 0, knee);
    put(rbox(0.18, 0.08, 0.26, o.shoes || '#2A2A2E', 0.035), 0, -0.24, 0.04, knee);
    legs.push(hip); knees.push(knee);
  }
  put(rbox(0.5, 0.56, 0.32, o.shirt, 0.15), 0, 0.83, 0, body);
  if (o.coat) put(rbox(0.54, 0.7, 0.36, '#FFFFFF', 0.12), 0, 0.78, 0, body);
  if (o.inner) put(rbox(0.2, 0.4, 0.02, o.inner, 0.01), 0, 0.9, 0.18 + (o.coat ? 0.02 : 0), body);
  if (o.skirt) put(cyl(0.27, 0.36, 0.42, o.skirt), 0, 0.44, 0, body);
  if (o.tie) put(rbox(0.07, 0.3, 0.02, o.tie, 0.01), 0, 0.86, 0.185, body);
  if (o.hood) { const hd = rbox(0.42, 0.14, 0.22, o.shirt, 0.07); put(hd, 0, 1.1, -0.16, body); }
  if (o.apron) put(rbox(0.44, 0.34, 0.04, '#F4EFE6', 0.02), 0, 0.72, 0.17, body);
  if (o.belt) put(rbox(0.54, 0.12, 0.36, '#8B6A45', 0.04), 0, 0.6, 0, body);
  if (o.lanyard) put(rbox(0.1, 0.13, 0.02, '#FFFFFF', 0.01), 0, 0.9, o.coat ? 0.2 : 0.17, body);
  if (o.mat) { const m = cyl(0.09, 0.09, 0.5, '#9B86E0'); m.rotation.z = Math.PI / 2; put(m, 0, 1.05, -0.22, body); }
  if (o.clip) put(rbox(0.22, 0.3, 0.03, '#8B6A45', 0.01), 0.18, 0.85, 0.25, body);
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * 0.3, 1.06, 0); body.add(sh);
    put(rbox(0.13, 0.42, 0.15, o.coat ? '#FFFFFF' : o.shirt, 0.06), 0, -0.2, 0, sh);
    put(sph(0.07, o.skin), 0, -0.43, 0.01, sh); arms.push(sh);
  }
  const phone = rbox(0.13, 0.21, 0.03, '#23262D', 0.015); phone.rotation.x = -0.5; put(phone, 0, 0.98, 0.36, body); phone.visible = false;
  const head = new THREE.Group(); head.position.set(0, 1.38, 0); body.add(head); head.scale.set(1 / sx, 1 / sy, 1 / sx);
  const st = o.style;
  if (st === 'hijab') { put(sph(0.29, o.hair), 0, 0.01, -0.04, head); put(rbox(0.56, 0.28, 0.36, o.hair, 0.14), 0, -0.28, -0.01, head); put(sph(0.215, o.skin), 0, -0.01, 0.07, head); }
  else {
    put(sph(0.25, o.skin), 0, 0, 0, head);
    if (st !== 'bald') { const cap = sph(0.262, o.hair); cap.scale.set(1, 0.72, 1.02); put(cap, 0, 0.08, -0.025, head); } else put(sph(0.06, o.hair), 0, 0.2, -0.18, head);
    if (st === 'long') put(rbox(0.48, 0.5, 0.18, o.hair, 0.08), 0, -0.18, -0.13, head);
    if (st === 'bun') put(sph(0.12, o.hair), 0, 0.3, -0.06, head);
    if (st === 'curly') for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; put(sph(0.11, o.hair), Math.cos(a) * 0.22, 0.12, Math.sin(a) * 0.2 - 0.03, head); }
    if (st === 'beanie') put(cyl(0.25, 0.27, 0.22, o.hair), 0, 0.17, -0.01, head);
    if (st === 'beard') put(rbox(0.36, 0.16, 0.2, o.hair, 0.08), 0, -0.15, 0.13, head);
  }
  if (o.cap) { put(cyl(0.27, 0.27, 0.14, o.cap), 0, 0.2, 0, head); const br = rbox(0.3, 0.03, 0.2, o.cap, 0.01); put(br, 0, 0.14, 0.24, head); }
  if (o.goggles) put(rbox(0.4, 0.08, 0.1, '#BFE6F6', 0.03), 0, 0.2, 0.17, head);
  if (o.nose) put(sph(0.07, o.skin), 0, -0.03, 0.25, head);
  const fz = st === 'hijab' ? 0.27 : 0.235;
  for (const s of [-1, 1]) put(sph(0.034, '#2A2020', { r: 0.3 }), s * 0.085, 0.04, fz - 0.01, head);
  for (const s of [-1, 1]) put(sph(0.04, '#F08C8C', { op: 0.45 }), s * 0.14, -0.05, fz - 0.03, head);
  if (o.glasses) for (const s of [-1, 1]) { const ring = new THREE.Mesh(GC.ring || (GC.ring = new THREE.TorusGeometry(0.065, 0.013, 6, 18)), mat('#2A2020')); put(ring, s * 0.085, 0.04, fz + 0.01, head); }
  if (o.headset) { const hb = new THREE.Mesh(GC.hb || (GC.hb = new THREE.TorusGeometry(0.27, 0.025, 6, 20, Math.PI)), mat('#2F3640')); put(hb, 0, 0.02, 0, head); }
  root.userData.p = { body, legs, knees, arms, phone, head, sy };
  if (GFX.batch) { const od = { owner: root }; batchNode(body, new Set([...legs, ...arms, phone]), { userData: od }); for (const l of legs) batchNode(l, new Set(knees), { userData: od }); for (const k of knees) batchNode(k, new Set(), { userData: od }); for (const a of arms) batchNode(a, new Set(), { userData: od }); }
  root.traverse((m) => { if (m.isMesh) m.userData.owner = root; });
  return root;
}
function poseStand(p) { if (p.anim) return p.anim.set('idle'); p.legs.forEach((l) => l.rotation.x = 0); p.knees.forEach((k) => k.rotation.x = 0); p.arms.forEach((a) => { a.rotation.x = 0; a.rotation.z = 0; }); p.body.position.y = 0; p.phone.visible = false; }
function poseSit(p, lie) { if (p.anim) return p.anim.set(lie ? 'lie' : 'sit'); p.legs.forEach((l) => l.rotation.x = -Math.PI / 2); p.knees.forEach((k) => k.rotation.x = Math.PI / 2); p.arms.forEach((a) => a.rotation.x = -0.5); }
function poseWalk(p, ph, amp = 0.55, speed = 2.3) {
  if (p.anim) return p.anim.set('walk', speed / 2.3);
  p.legs[0].rotation.x = Math.sin(ph) * amp; p.legs[1].rotation.x = -Math.sin(ph) * amp;
  p.knees[0].rotation.x = Math.max(0, -Math.sin(ph)) * 0.7; p.knees[1].rotation.x = Math.max(0, Math.sin(ph)) * 0.7;
  p.arms[0].rotation.x = -Math.sin(ph) * amp * 0.8; p.arms[1].rotation.x = Math.sin(ph) * amp * 0.8;
  p.body.position.y = Math.abs(Math.sin(ph)) * 0.05;
}
function poseWork(p, sit) { if (p.anim) return p.anim.set(sit ? 'worksit' : 'work'); if (sit) poseSit(p); }
function posePhone(p) { if (p.anim) { const sit = /sit/i.test(p.anim.state || ''); return p.anim.set(sit ? (p.waitPose === 'idle' ? 'sit' : 'sitphone') : p.waitPose || 'phone'); } p.arms.forEach((a) => a.rotation.x = -1.1); p.phone.visible = true; }

// ---------------- world ----------------
// spd: treatment speed — the bigger room is better equipped (regular +30%, large +15% on each of its 2 stations)
const SIZES = { s: { W: 4, D: 4, st: 1, cost: 0.7, vibe: 0.4, cafe: 0.8, spd: 1 }, m: { W: 6, D: 6, st: 1, cost: 1, vibe: 0.9, cafe: 0.7, spd: 1.3 }, l: { W: 8, D: 6, spd: 1.15, st: 2, cost: 1.8, vibe: 1.5, cafe: 0.6 } };
const roomCost = (type, size) => Math.round(ROOMS[type].cost * SIZES[size].cost / 50) * 50;
function roomRect(r) { const z = SIZES[r.size]; const side = Math.abs(Math.sin(r.a)) > 0.5; const w = side ? z.D : z.W, d = side ? z.W : z.D; return { x0: r.x - w / 2, x1: r.x + w / 2, z0: r.z - d / 2, z1: r.z + d / 2, w, d }; }
const toW = (r, lx, lz) => ({ x: r.x + lx * Math.cos(r.a) + lz * Math.sin(r.a), z: r.z - lx * Math.sin(r.a) + lz * Math.cos(r.a) });
const doorPt = (r, out = 0) => toW(r, 0, SIZES[r.size].D / 2 + out);
// --- walk grid (0.5 m cells) + A* ---
const G0x = -30, G0z = -32, GCs = 0.5, GW = 120, GH = 92;
let gridBlk = new Uint8Array(GW * GH);
// which room each cell is in (0 = hall/corridor) and where each room's door is: a step may only change room through a door, so nobody walks through a wall
let gridRid = new Int16Array(GW * GH), gridDoors = [null];
function crossOK(a, b) { const ra = gridRid[a], rb = gridRid[b]; if (ra === rb) return true;
  const ia = a % GW, ib = b % GW, mx = G0x + ((ia + ib) / 2 + 0.5) * GCs, mz = G0z + (((a - ia) / GW + (b - ib) / GW) / 2 + 0.5) * GCs;
  for (const r of [ra, rb]) if (r) { const d = gridDoors[r]; if (!d || Math.hypot(mx - d.x, mz - d.z) > 0.6) return false; }
  return true; }
const ci = (x, z) => [Math.floor((x - G0x) / GCs), Math.floor((z - G0z) / GCs)];
const cc = (i, j) => ({ x: G0x + (i + 0.5) * GCs, z: G0z + (j + 0.5) * GCs });
const PLOTS = {
  // every edge sits on the 2 m room module (x ≡ 0.5 mod 2): 4, 6 and 8 m rooms plus 2 m corridors tile with no leftover strips
  london: { main: [[-13.5, 6.5, -7.5, 6.5]], lots: [[6.5, 14.5, -7.5, 6.5], [-19.5, -13.5, -7.5, 6.5]], cost: 8000 },
  lagos: { main: [[-17.5, 6.5, -3.5, 6.5], [-5.5, 2.5, -11.5, -3.5]], lots: [[6.5, 14.5, -3.5, 6.5], [-17.5, -5.5, -11.5, -3.5]], cost: 9000 },
  mumbai: { main: [[-11.5, 6.5, -7.5, 6.5], [-11.5, -1.5, -13.5, -7.5]], lots: [[6.5, 12.5, -1.5, 6.5], [-1.5, 6.5, -13.5, -7.5]], cost: 12000 },
  seoul: { main: [[-9.5, 6.5, -7.5, 6.5], [-15.5, 2.5, -13.5, -7.5]], lots: [[-15.5, -9.5, -7.5, 2.5], [6.5, 12.5, -7.5, 6.5]], cost: 12000 },
  newyork: { main: [[-11.5, 6.5, -11.5, 6.5]], lots: [[6.5, 12.5, -11.5, 6.5], [-17.5, -11.5, -5.5, 6.5]], cost: 18000 },
  mexico: { main: [[-13.5, 6.5, -9.5, 6.5], [-19.5, -13.5, -3.5, 6.5]], lots: [[6.5, 14.5, -9.5, 2.5], [-19.5, -13.5, -11.5, -3.5]], cost: 14000 },
  cairo: { main: [[-15.5, 6.5, -9.5, 6.5]], holes: [[-15.5, -9.5, -9.5, -5.5]], lots: [[6.5, 14.5, -9.5, 2.5], [-15.5, -5.5, -15.5, -9.5]], cost: 13000 },
  saopaulo: { main: [[-17.5, 6.5, -11.5, 6.5]], holes: [[-11.5, -3.5, -7.5, -1.5]], lots: [[6.5, 14.5, -11.5, 0.5], [-21.5, -17.5, -11.5, 4.5]], cost: 14000 },
};
for (const P of Object.values(PLOTS)) { const rs = P.main.concat(P.lots), x0 = Math.min(...rs.map((r) => r[0])), x1 = Math.max(...rs.map((r) => r[1])), z0 = Math.min(...rs.map((r) => r[2])), z1 = Math.max(...rs.map((r) => r[3]));
  P.lots.push([x0, x1, z0 - 8, z0], [x0, x1, z0 - 16, z0 - 8], [x1, x1 + 8, z0 - 16, z1]); }
const plotOf = (c) => PLOTS[c || (S && S.city) || 'london'] || PLOTS.london;
const inR = (r, x, z) => x > r[0] && x < r[1] && z > r[2] && z < r[3];
const lotSt = (i) => (!S ? 'locked' : i === 0 ? S.annex || 'locked' : i === 1 ? S.annex2 || 'locked' : (S.lotsX && S.lotsX[i]) || 'locked');
const lotDay = (i) => (i === 0 ? S.annexDay : i === 1 ? S.annexDay2 || 0 : (S.lotsXDay && S.lotsXDay[i]) || 0);
function setLot(i, st, day) { if (i === 0) { S.annex = st; if (day != null) S.annexDay = day; } else if (i === 1) { S.annex2 = st; if (day != null) S.annexDay2 = day; } else { (S.lotsX = S.lotsX || {})[i] = st; if (day != null) (S.lotsXDay = S.lotsXDay || {})[i] = day; } }
const lotCost = (i, c) => Math.round(plotOf(c).cost * [1, 1.7, 1.3, 1.6, 2][i] / 500) * 500;
const lotOpen = (i) => i < 2 || lotSt(i - 1) === 'owned'; // the big extra lots open one after another
const ownedLots = (c) => plotOf(c).lots.map((_, i) => !!(S && (!c || S.city === c) && lotSt(i) === 'owned'));
function inFloorC(c, own, x, z) { const P = plotOf(c); if ((P.holes || []).some((h) => inR(h, x, z))) return false; if (P.main.some((r) => inR(r, x, z))) return true; return P.lots.some((L, i) => own[i] && inR(L, x, z)); }
function inFloor(x, z) { return inFloorC(null, ownedLots(), x, z); }
function plotBox(c) { const P = plotOf(c), rs = P.main.concat(P.lots); return [Math.min(...rs.map((r) => r[0])), Math.max(...rs.map((r) => r[1])), Math.min(...rs.map((r) => r[2])), Math.max(...rs.map((r) => r[3]))]; }
function plazaX(c) { const b = plotBox(c); return [b[0] - 1.6, b[1] + 1.2]; }
function baseWalk(x, z) { if (inFloor(x, z)) return true; const [a, b] = plazaX(); return x > a && x < b && z > 6.5 && z < 12.6; }
const LOB = 0.5; // lobby inner edge, on the room module
function buildable(x, z) { return inFloor(x, z) && !(x > LOB && x < 6.5 && z > LOB && z < 6.5); }
function reachIn(blk, a, b, q) { // flood fill limited to the room rectangle
  const [si, sj] = ci(a.x, a.z), [ti, tj] = ci(b.x, b.z), [i0, j0] = ci(q.x0, q.z0), [i1, j1] = ci(q.x1, q.z1); const seen = new Set([si + sj * GW]), st = [[si, sj]];
  while (st.length) { const [i, j] = st.pop(); if (Math.abs(i - ti) + Math.abs(j - tj) <= 1) return true;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + di, nj = j + dj, k = ni + nj * GW; if (ni < i0 || nj < j0 || ni > i1 || nj > j1 || seen.has(k) || blk[k]) continue; seen.add(k); st.push([ni, nj]); } }
  return false;
}
function markRoom(r, blk) {
  const q = roomRect(r), dp = doorPt(r, 0), rm = R.rooms && R.rooms[r.id];
  if (rm && rm.obs) { const keep = rm.spots.concat(rm.staffSpots.filter(Boolean)).concat([doorPt(r, -0.6)]);
    for (const b of rm.obs) { const [i0, j0] = ci(b[0] - 0.12, b[2] - 0.12), [i1, j1] = ci(b[1] + 0.12, b[3] + 0.12);
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { if (i < 0 || j < 0 || i >= GW || j >= GH) continue; const p = cc(i, j); if (keep.some((k) => Math.hypot(k.x - p.x, k.z - p.z) < 0.5)) continue; blk[j * GW + i] = 1; } }
    // never wall a seat off: if a spot can't be reached from the door, open a lane straight to it
    const din = doorPt(r, -0.6);
    for (const k of keep) { if (reachIn(blk, din, k, q)) continue; const n = Math.ceil(Math.hypot(k.x - din.x, k.z - din.z) / 0.2);
      for (let t = 0; t <= n; t++) { const x = din.x + (k.x - din.x) * t / n, z = din.z + (k.z - din.z) * t / n; for (const [ox, oz] of [[0, 0], [0.25, 0], [-0.25, 0], [0, 0.25], [0, -0.25]]) { const [i, j] = ci(x + ox, z + oz); if (i >= 0 && j >= 0 && i < GW && j < GH) { const p = cc(i, j); if (p.x > q.x0 + 0.3 && p.x < q.x1 - 0.3 && p.z > q.z0 + 0.3 && p.z < q.z1 - 0.3) blk[j * GW + i] = 0; } } } } }
  const [i0, j0] = ci(q.x0 + 0.01, q.z0 + 0.01), [i1, j1] = ci(q.x1 - 0.01, q.z1 - 0.01);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    if (i < 0 || j < 0 || i >= GW || j >= GH) continue;
    const p = cc(i, j); const ring = p.x - q.x0 < 0.5 || q.x1 - p.x < 0.5 || p.z - q.z0 < 0.5 || q.z1 - p.z < 0.5;
    if (ring && Math.hypot(p.x - dp.x, p.z - dp.z) > 0.6) blk[j * GW + i] = 1;
  }
}
function markObstacles(blk) {
  const box = (cx, cz, w, d, rot) => { const c = Math.cos(rot || 0), s = Math.sin(rot || 0), R = Math.hypot(w, d) / 2 + 0.3;
    const [i0, j0] = ci(cx - R, cz - R), [i1, j1] = ci(cx + R, cz + R);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { if (i < 0 || j < 0 || i >= GW || j >= GH) continue; const p = cc(i, j), dx = p.x - cx, dz = p.z - cz, lx = dx * c - dz * s, lz = dx * s + dz * c; if (Math.abs(lx) < w / 2 + 0.15 && Math.abs(lz) < d / 2 + 0.15) blk[j * GW + i] = 1; } };
  if (!S) return;
  box(1.15, 4.2, 2.9, 0.9, Math.PI / 2);
  if (S.desk) for (const D of desks()) box(D.x, D.z, 2.5, 0.9, D.r);
  for (const [x, z] of [[6.1, 2.6], [1.0, 6.0], [2.6, 1.0]]) box(x, z, 0.5, 0.5, 0);
  for (const d of S.decor || []) box(d.x, d.z, 0.7, 0.7, d.r || 0);
}
function makeGrid(rooms) {
  const blk = new Uint8Array(GW * GH);
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const p = cc(i, j); blk[j * GW + i] = baseWalk(p.x, p.z) ? 0 : 1; }
  for (const r of rooms) markRoom(r, blk);
  markObstacles(blk);
  if (blk !== undefined && rooms === (S && S.rooms)) { const rid = new Int16Array(GW * GH), doors = [null];
    rooms.forEach((r, k) => { const q = roomRect(r), [i0, j0] = ci(q.x0 + 0.01, q.z0 + 0.01), [i1, j1] = ci(q.x1 - 0.01, q.z1 - 0.01); doors.push(doorPt(r, 0));
      for (let j = Math.max(0, j0); j <= Math.min(GH - 1, j1); j++) for (let i = Math.max(0, i0); i <= Math.min(GW - 1, i1); i++) rid[j * GW + i] = k + 1; });
    gridRid = rid; gridDoors = doors; }
  return blk;
}
function rebuildGrid() { gridBlk = makeGrid(S.rooms); }
const free = (blk, i, j) => i >= 0 && j >= 0 && i < GW && j < GH && !blk[j * GW + i];
function reach(blk, from, to) {
  const [si, sj] = ci(from.x, from.z), [ti, tj] = ci(to.x, to.z); if (!free(blk, ti, tj)) return false;
  const seen = new Uint8Array(GW * GH), q = [si + sj * GW]; seen[q[0]] = 1;
  while (q.length) { const c = q.pop(), i = c % GW, j = (c - i) / GW; if (i === ti && j === tj) return true;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + di, nj = j + dj; if (free(blk, ni, nj) && !seen[nj * GW + ni]) { seen[nj * GW + ni] = 1; q.push(nj * GW + ni); } } }
  return false;
}
// exact grid traversal (every cell the segment touches, both cells at a corner); cb(i, j, pi, pj) must accept each step
function walkCells(ax, az, bx, bz, cb) {
  let [i, j] = ci(ax, az); const [ti, tj] = ci(bx, bz), dx = bx - ax, dz = bz - az, sx = Math.sign(dx), sz = Math.sign(dz);
  const tdx = dx ? GCs / Math.abs(dx) : Infinity, tdz = dz ? GCs / Math.abs(dz) : Infinity;
  let tmx = dx ? (sx > 0 ? G0x + (i + 1) * GCs - ax : ax - (G0x + i * GCs)) / Math.abs(dx) : Infinity, tmz = dz ? (sz > 0 ? G0z + (j + 1) * GCs - az : az - (G0z + j * GCs)) / Math.abs(dz) : Infinity;
  for (let n = 0; n < 600 && (i !== ti || j !== tj); n++) {
    const pi = i, pj = j;
    if (Math.abs(tmx - tmz) < 1e-9) { if (!cb(i + sx, j, pi, pj) || !cb(i, j + sz, pi, pj)) return false; i += sx; j += sz; tmx += tdx; tmz += tdz; }
    else if (tmx < tmz) { i += sx; tmx += tdx; } else { j += sz; tmz += tdz; }
    if (!cb(i, j, pi, pj)) return false;
  }
  return true;
}
// straight walk a→b allowed? no blocked cell on the way (the end may be a seat), and no wall crossed — checked on the centre line and on both shoulders
function los(a, b) {
  const [ti, tj] = ci(b.x, b.z), inB = (i, j) => i >= 0 && j >= 0 && i < GW && j < GH;
  const step = (i, j, pi, pj, centre) => { if (!inB(i, j) || !inB(pi, pj)) return false; if (centre && !(i === ti && j === tj) && gridBlk[j * GW + i]) return false; return crossOK(pj * GW + pi, j * GW + i); };
  if (!walkCells(a.x, a.z, b.x, b.z, (i, j, pi, pj) => step(i, j, pi, pj, true))) return false;
  const d = Math.hypot(b.x - a.x, b.z - a.z); if (d < 0.05) return true; const nx = -(b.z - a.z) / d * 0.2, nz = (b.x - a.x) / d * 0.2;
  for (const k of [1, -1]) if (!walkCells(a.x + nx * k, a.z + nz * k, b.x + nx * k, b.z + nz * k, (i, j, pi, pj) => step(i, j, pi, pj, false))) return false;
  return true;
}
function findPath(from, to) {
  const [si, sj] = ci(from.x, from.z), [ti, tj] = ci(to.x, to.z);
  const N = GW * GH, inB = (i, j) => i >= 0 && j >= 0 && i < GW && j < GH;
  if (inB(si, sj) && !inB(ti, tj)) { const ex = clamp(to.x, G0x + 0.3, G0x + GW * GCs - 0.3), ez = clamp(to.z, G0z + 0.3, G0z + GH * GCs - 0.3); return findPath(from, { x: ex, z: ez }).concat([{ x: to.x, z: to.z }]); } // leaving the map: walk to its edge properly, then out
  if (!inB(si, sj) || !inB(ti, tj)) return [{ x: to.x, z: to.z }];
  const gS = new Float32Array(N).fill(1e9), par = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
  const s = sj * GW + si, tg = tj * GW + ti; gS[s] = 0; const open = [[Math.hypot(ti - si, tj - sj), s]];
  const hpush = (e) => { open.push(e); let i = open.length - 1; while (i) { const p = (i - 1) >> 1; if (open[p][0] <= open[i][0]) break; [open[p], open[i]] = [open[i], open[p]]; i = p; } };
  const hpop = () => { const top = open[0], last = open.pop(); if (open.length) { open[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < open.length && open[l][0] < open[m][0]) m = l; if (r < open.length && open[r][0] < open[m][0]) m = r; if (m === i) break; [open[m], open[i]] = [open[i], open[m]]; i = m; } } return top; };
  // someone standing on a blocked cell (a seat against the wall, a staff spot) may step out through blocked cells of their own room; same to reach a blocked target
  const sB = gridBlk[s], tB = gridBlk[tg], near = (n, c) => { const a = n % GW, b = c % GW; return Math.abs(a - b) <= 3 && Math.abs((n - a) / GW - (c - b) / GW) <= 3; };
  const ok = (i, j, from) => { if (!inB(i, j)) return false; const n = j * GW + i; if (from != null && !crossOK(from, n)) return false;
    return !gridBlk[n] || n === tg || n === s || (sB && gridRid[n] && gridRid[n] === gridRid[s]) || (tB && gridRid[n] && gridRid[n] === gridRid[tg]) || (sB && near(n, s)) || (tB && near(n, tg)); };
  let found = false, best = s, bh = 1e9;
  while (open.length) {
    const [, c] = hpop();
    if (closed[c]) continue; closed[c] = 1; if (c === tg) { found = true; break; }
    const i = c % GW, j = (c - i) / GW, hh = Math.hypot(ti - i, tj - j); if (hh < bh) { bh = hh; best = c; }
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const ni = i + di, nj = j + dj; if (!ok(ni, nj, c)) continue;
      if (di && dj && (!ok(i + di, j, c) || !ok(i, j + dj, c))) continue;
      const n = nj * GW + ni, ng = gS[c] + (di && dj ? 1.414 : 1) + (gridBlk[n] && n !== tg ? 4 : 0); // squeezing past furniture only when there's no other way
      if (ng < gS[n]) { gS[n] = ng; par[n] = c; hpush([ng + Math.hypot(ti - ni, tj - nj), n]); }
    }
  }
  const end = found ? tg : best;
  if (end === s) return found ? [{ x: to.x, z: to.z }] : []; // never a straight line through a wall
  const cells = []; for (let c = end; c !== -1 && c !== s; c = par[c]) cells.push(c); cells.reverse();
  const pts = cells.map((c) => cc(c % GW, (c - (c % GW)) / GW)); if (found) pts[pts.length - 1] = { x: to.x, z: to.z };
  const out = []; let cur = { x: from.x, z: from.z }, k = 0;
  while (k < pts.length) { let far = k; for (let m = pts.length - 1; m > k; m--) if (los(cur, pts[m])) { far = m; break; } out.push(pts[far]); cur = pts[far]; k = far + 1; }
  return out;
}
const W_H = 2.6, T = 0.24;
function wallSeg(x0, z0, x1, z1, h, c, parent) {
  const alongX = Math.abs(z1 - z0) < 1e-6, len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
  put(rbox(alongX ? len : T, h, alongX ? T : len, c, 0.04), (x0 + x1) / 2, h / 2 + 0.1, (z0 + z1) / 2, parent);
  put(rbox(alongX ? len + 0.02 : T + 0.05, 0.07, alongX ? T + 0.05 : len + 0.02, '#FFFFFF', 0.03), (x0 + x1) / 2, h + 0.13, (z0 + z1) / 2, parent);
}
function floorPlane(x0, x1, z0, z1, m, y = 0.1, parent = scene) {
  const f = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.04, z1 - z0), m); f.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); f.receiveShadow = true; parent.add(f); return f;
}
function plant(x, z, s = 1, pot = '#E9785F', p = scene) {
  const g = grp(x, z, 0, p); g.position.y = 0.1;
  put(cyl(0.22 * s, 0.17 * s, 0.38 * s, pot), 0, 0.19 * s, 0, g);
  [[0, 0.6, 0, 0.26], [0.16, 0.5, 0.08, 0.2], [-0.15, 0.52, -0.05, 0.2], [0.05, 0.78, -0.06, 0.18]].forEach((q, i) => put(sph(q[3] * s, ['#4E9E58', '#6DBA63', '#3F8A4D'][i % 3], { r: 0.85 }), q[0] * s, q[1] * s, q[2] * s, g));
  if (pot !== '#E3B341') { const v = ['plant_s', 'plant_m', 'plant_l'][Math.abs(Math.round(x * 7.3 + z * 3.1)) % 3]; glbSwap(g, v, { h: { plant_s: 0.72, plant_m: 0.95, plant_l: 1.1 }[v] * s }); }
  return g;
}
const world = { roomGroups: {}, lotGroup: null, decor: {} };
function buildWorld() {
  const ground = new THREE.Mesh(new THREE.BoxGeometry(90, 0.2, 90), mat('#FFFFFF', { r: 0.9, map: tileTex('#C9D5DA', '#C2CFD5', [36, 36]), mapK: 'g' }));
  ground.position.set(3, -0.62, 3); ground.receiveShadow = true; scene.add(ground); world.ground = ground;
  const desk = grp(5.25, 5.25, Math.PI / 4); world.desk = desk;
  put(rbox(2.3, 1.0, 0.7, '#16963C', 0.12), 0, 0.6, 0, desk); put(rbox(2.5, 0.1, 0.9, '#FFFFFF', 0.05), 0, 1.15, -0.05, desk);
  put(rbox(2.1, 0.1, 0.05, '#FFD25E', 0.02, { e: '#FFC94A', ei: 0.8 }), 0, 0.72, 0.36, desk); put(rbox(0.5, 0.36, 0.05, '#2F3640', 0.02), -0.75, 1.42, -0.3, desk);
  put(sph(0.09, '#E3B341', { m: 0.7, r: 0.25 }), 0.6, 1.26, 0.1, desk);
  desk.traverse((m) => { if (m.isMesh) m.userData.desk = true; });
  setTimeout(() => glbSwap(desk, 'desk', { len: 2.5, y: 0.1, keep: (c) => c === world.deskRing }), 0); // modelled in Blender
  const dr = new THREE.Mesh(new THREE.RingGeometry(1.35, 1.55, 40), new THREE.MeshBasicMaterial({ color: '#7ACB4E', transparent: true, opacity: 0.85 })); dr.rotation.x = -Math.PI / 2; dr.position.y = 0.14; dr.visible = false; desk.add(dr); world.deskRing = dr;
  const sofa = grp(1.15, 4.2, Math.PI / 2);
  put(rbox(2.6, 0.45, 0.9, '#FF8FAB', 0.16), 0, 0.33, 0, sofa); put(rbox(2.6, 0.7, 0.3, '#FF8FAB', 0.14), 0, 0.7, -0.35, sofa);
  put(rbox(0.3, 0.6, 0.9, '#F07C9A', 0.12), -1.3, 0.5, 0, sofa); put(rbox(0.3, 0.6, 0.9, '#F07C9A', 0.12), 1.3, 0.5, 0, sofa); glbSwap(sofa, 'sofa', { len: 2.7, h: 1.0, y: 0.1 });
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.02, 40), mat('#2BB5A6', { r: 1 })); rug.position.set(2.6, 0.13, 3.6); rug.receiveShadow = true; scene.add(rug);
  plant(6.1, 2.6, 1.1, '#FFFFFF'); plant(1.0, 6.0, 1, '#E9785F'); plant(2.6, 1.0, 0.9, '#FFD25E');
  buildCityDecor('london');
  buildAnnexLot();
}
// ---------------- modelled props (London art pilot) ----------------
// Each prop is first built from primitives (instant, and the fallback); the Meshy model then replaces it when loaded.
// ?props=0 turns them off. Models live in models/props/<name>.js (base64 GLB, 2–12k triangles, WebP textures).
const PROPS_ON = new URLSearchParams(location.search).get('props') !== '0';
const PROP_CACHE = {};
function propModel(name) {
  return PROP_CACHE[name] || (PROP_CACHE[name] = (async () => {
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    const b64 = (await import('./models/props/' + name + '.js')).default; const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const gl = await new Promise((res, rej) => new GLTFLoader().parse(bin.buffer, '', res, rej));
    gl.scene.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; const mt = m.material; if (mt && mt.isMeshStandardMaterial) { mt.metalness = 0; mt.roughness = 0.8; mt.envMapIntensity = 0.6; if (mt.map) mt.map.anisotropy = 4; } } });
    return gl.scene;
  })());
}
// o: { h: height } and/or { len: longest horizontal size } (both → non-uniform), rot: extra yaw, y: base height, keep: fn(child) → keep it
function glbSwap(g, name, o = {}) {
  if (!PROPS_ON || !g) return; g.userData.swap = true; // keeps the batcher out of it
  propModel(name).then((src) => {
    if (!g.parent) return;
    const m = src.clone(); m.rotation.y = o.rot || 0;
    const b = new THREE.Box3().setFromObject(m), sz = b.getSize(new THREE.Vector3());
    const sl = o.len ? o.len / Math.max(sz.x, sz.z) : null, sh = o.h ? o.h / sz.y : null;
    const k = sl || sh || 1; m.scale.set(k, sh && sl ? sh : k, k);
    let rid; g.traverse((c) => { if (c.userData.roomId != null && rid == null) rid = c.userData.roomId; });
    for (const c of g.children.slice()) if (!(o.keep && o.keep(c))) g.remove(c);
    m.position.y = o.y || 0; g.add(m); g.userData.glb = name;
    if (rid != null) m.traverse((c) => { if (c.isMesh) c.userData.roomId = rid; });
  }).catch((e) => console.warn('[props]', name, e.message));
}
let cityScene = null;
const SIGN_TEX = canvasTex(1024, 220, (g) => { g.fillStyle = '#16963C'; g.fillRect(0, 0, 1024, 220); g.fillStyle = '#fff'; g.font = '700 104px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillText('Life Crisis', 512, 150); });
const GARDEN_OK = () => S && S.garden && (!S.rainy || S.gardenRoof) && (() => { const o = outsideT(); return o > (S.gardenHeat ? -2 : 8) && o < (S.gardenCool ? 42 : 34); })(); // roof = rain-proof, heaters/fans widen the usable temperatures
function gardenBuild(g, pa, pb) { // grass, planters and benches on both sides of the entrance; benches become outdoor waiting seats
  for (let i = WAIT_SPOTS.length - 1; i >= 0; i--) if (WAIT_SPOTS[i].out) WAIT_SPOTS.splice(i, 1);
  const spots = [], sides = [[pa + 0.6, -0.6], [7.6, pb - 0.6]];
  for (const [a, b] of sides) { if (b - a < 2.5) continue;
    floorPlane(a, b, 7.2, 11.6, mat('#8DBF6A', { r: 1 }), 0.09, g);
    const n = Math.min(4, Math.floor((b - a) / 2.6));
    for (let k = 0; k < n; k++) { const bx = a + 1.3 + k * ((b - a - 2.6) / Math.max(1, n - 1 || 1)); const bz = 9.2;
      const bench = grp(bx, bz, Math.PI, g); put(rbox(1.5, 0.08, 0.45, '#B5793A', 0.03), 0, 0.45, 0, bench); put(rbox(1.5, 0.45, 0.07, '#B5793A', 0.03), 0, 0.7, 0.22, bench); for (const sx of [-0.65, 0.65]) put(rbox(0.07, 0.42, 0.4, '#5A3A22', 0.02), sx, 0.24, 0, bench);
      for (const sx of [-0.38, 0.38]) spots.push({ x: bx + sx, z: bz - 0.05, rot: Math.PI, sit: true, y: 0.02, out: true, busy: null });
      if (S.gardenRoof) { for (const [px, pz] of [[-1.1, -0.6], [1.1, -0.6], [-1.1, 0.8], [1.1, 0.8]]) put(cyl(0.05, 0.05, 2.3, '#5A6470'), bx + px, 1.25, bz + pz, g); const gl = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.05, 1.8), mat('#BFE6F6', { r: 0.1, op: 0.45 })); gl.position.set(bx, 2.42, bz + 0.1); g.add(gl); put(rbox(2.7, 0.06, 0.08, '#5A6470', 0.02), bx, 2.44, bz + 1.0, g); put(rbox(2.7, 0.06, 0.08, '#5A6470', 0.02), bx, 2.44, bz - 0.8, g); }
      if (S.gardenHeat) { const hx = bx + (k % 2 ? -1.0 : 1.0); put(cyl(0.05, 0.12, 1.8, '#4A4F57'), hx, 1.0, bz + 0.9, g); put(new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.25, 12), mat('#8A8E96', { m: 0.5 })), hx, 2.0, bz + 0.9, g); put(sph(0.08, '#FF8A3D', { e: '#FF6A1A', ei: 1.4 }), hx, 1.8, bz + 0.9, g); }
      if (S.gardenCool) { const fx = bx + (k % 2 ? 1.0 : -1.0); put(cyl(0.04, 0.04, 2.1, '#C9CED6'), fx, 1.05, bz + 0.9, g); put(cyl(0.25, 0.25, 0.08, '#5AB8F0', { op: 0.8 }), fx, 2.1, bz + 0.9, g); const um = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.35, 16), mat('#F4EFE6', { r: 0.9 })); um.position.set(fx, 2.35, bz + 0.9); g.add(um); }
      { const pg = grp(bx + (k % 2 ? 1.1 : -1.1), 10.9, 0, g); put(rbox(1.0, 0.4, 0.36, '#E3D3BA', 0.04), 0, 0.3, 0, pg); put(sph(0.22, '#7DB54B'), 0, 0.55, 0, pg); glbSwap(pg, 'planter', { len: 1.1, y: 0.1 }); } }
    for (let x = a + 0.8; x < b - 0.4; x += 2.2) { const f = sph(0.18, ['#FF8FAB', '#FFD25E', '#B57BE8'][Math.floor(x) % 3 < 0 ? 0 : Math.floor(x) % 3]); f.scale.y = 0.6; put(f, x, 0.2, 7.6, g); } }
  WAIT_SPOTS.unshift(...spots); gardenRain();
}
function gardenRain() { const ok = GARDEN_OK(); for (const s of WAIT_SPOTS) if (s.out) s.blocked = !ok; }
function buildShell(c) {
  if (world.shellG) scene.remove(world.shellG); const g = new THREE.Group(); scene.add(g); world.shellG = g; world.cutWalls = [];
  const own = ownedLots(c), P = plotOf(c), rs = P.main.concat(P.lots.filter((_, i) => own[i])), fl = mat('#EFEAE0', { r: 0.9 });
  for (const r of rs) { put(rbox(r[1] - r[0] + 0.3, 0.62, r[3] - r[2] + 0.3, '#E9E1D3', 0.06), (r[0] + r[1]) / 2, -0.25, (r[2] + r[3]) / 2, g); floorPlane(r[0], r[1], r[2], r[3], fl, 0.08, g); }
  floorPlane(LOB, 6.5, LOB, 6.5, mat('#FFFFFF', { map: tileTex('#EAF6F4', '#D9EEEA', [6, 6]), r: 0.5, mapK: 'w' }), 0.1, g);
  const [pa, pb] = plazaX(c), pl = new THREE.Mesh(new THREE.BoxGeometry(pb - pa, 0.5, 6), mat('#FFFFFF', { r: 0.9, map: tileTex('#E4E7EB', '#DADFE4', [Math.round((pb - pa) / 2), 3]), mapK: 'p' + c })); pl.position.set((pa + pb) / 2, -0.17, 9.6); pl.receiveShadow = true; g.add(pl);
  if (S && S.garden && S.city === c) gardenBuild(g, pa, pb); else for (let i = WAIT_SPOTS.length - 1; i >= 0; i--) if (WAIT_SPOTS[i].out) WAIT_SPOTS.splice(i, 1);
  for (const h of P.holes || []) { floorPlane(h[0], h[1], h[2], h[3], mat('#8DBF6A', { r: 1 }), 0.09, g); const cx = (h[0] + h[1]) / 2, cz = (h[2] + h[3]) / 2; put(cyl(1.0, 1.1, 0.4, '#C9CED6'), cx, 0.3, cz, g); put(cyl(0.8, 0.8, 0.05, '#7EC8E3', { r: 0.2 }), cx, 0.5, cz, g); for (const [dx, dz] of [[-2.6, -1.8], [2.6, 1.8], [-2.6, 1.8], [2.6, -1.8]]) plant(cx + dx, cz + dz, 1.4, '#C9A06B', g); }
  // boundary walls from a 0.5 grid
  const box = plotBox(c), inF = (x, z) => inFloorC(c, own, x, z), E = {};
  for (let x = box[0] + 0.25; x < box[1]; x += 0.5) for (let z = box[2] + 0.25; z < box[3]; z += 0.5) {
    if (!inF(x, z)) continue;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx * 0.5, nz = z + dz * 0.5; if (inF(nx, nz)) continue;
      if (dz === 1 && nz > 6.5) continue;
      const k = dz ? 'h' + (z + dz * 0.25).toFixed(2) + ':' + dz : 'v' + (x + dx * 0.25).toFixed(2) + ':' + dx;
      (E[k] = E[k] || []).push(dz ? x : z);
    }
  }
  const segs = [];
  for (const k in E) { const v = E[k].sort((a, b) => a - b), line = +k.slice(1).split(':')[0], n = +k.split(':')[1], hz = k[0] === 'h'; let s = v[0], p = v[0];
    for (let i = 1; i <= v.length; i++) { if (i < v.length && Math.abs(v[i] - p - 0.5) < 0.01) { p = v[i]; continue; } segs.push({ hz, line, a: s - 0.25, b: p + 0.25, n }); if (i < v.length) { s = p = v[i]; } } }
  let best = null;
  for (const s of segs) {
    const wg = new THREE.Group(); g.add(wg); const nx = s.hz ? 0 : s.n, nz = s.hz ? s.n : 0; wg.userData.n = [nx, nz]; world.cutWalls.push(wg);
    const col = s.hz ? '#F3EEE6' : '#EDE6F6';
    if (s.hz) { wallSeg(s.a, s.line, s.b, s.line, W_H, col, wg); wallSeg(s.a, s.line, s.b, s.line, 0.35, col, g); } else { wallSeg(s.line, s.a, s.line, s.b, W_H, col, wg); wallSeg(s.line, s.a, s.line, s.b, 0.35, col, g); }
    const L = s.b - s.a, inn = -(T / 2 + 0.03);
    for (let u = s.a + 3.2; u < s.b - 1.5; u += 6.5) { const wx = s.hz ? u : s.line + nx * inn, wz = s.hz ? s.line + nz * inn : u; put(rbox(s.hz ? 1.5 : 0.06, 1.2, s.hz ? 0.06 : 1.5, '#FFFFFF', 0.03), wx, 1.7, wz, wg); put(rbox(s.hz ? 1.3 : 0.05, 1.0, s.hz ? 0.05 : 1.3, '#A8D8EE', 0.02, { e: '#BFE6F6', ei: 0.3, r: 0.15 }), wx - nx * 0.03, 1.7, wz - nz * 0.03, wg); }
    for (let u = s.a + 0.5, i = 0; u < s.b - 0.3; u += 1.05, i++) for (let k = 0; k < 2 + (i * 7) % 3; k++) put(sph(0.11 - k * 0.012, k % 2 ? '#5DAE5E' : '#3F8A4D', { r: 0.85 }), s.hz ? u : s.line - nx * 0.1, W_H + 0.05 - k * 0.16, s.hz ? s.line - nz * 0.1 : u, wg);
    if (s.hz && s.n === -1 && (!best || L > best.L)) best = { s, wg, L };
  }
  if (GFX.batch) { for (const w of world.cutWalls) batchNode(w); const st = new Set(world.cutWalls); g.traverse((o) => { if (o.userData.swap) st.add(o); }); batchNode(g, st); }
  if (best) { const s = best.s, cx = (s.a + s.b) / 2; const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.0), new THREE.MeshStandardMaterial({ map: SIGN_TEX, emissive: '#ffffff', emissiveMap: SIGN_TEX, emissiveIntensity: 0.15 })); put(sg, cx, 3.3, s.line + 0.12, best.wg); put(rbox(4.8, 1.15, 0.1, '#0E6E2C', 0.04), cx, 3.3, s.line + 0.05, best.wg); }
  updateCutaway();
}
// per-city light. London: rainy late-afternoon — lavender sky, warm low sun, wet glossy pavement, lit windows (step 6 of the London look)
const CITY_LIGHT = {
  _: { hemi: ['#FFE9D2', '#B39C82', 0.62], sun: ['#FFD9AC', 3.1], fill: ['#E6ECFF', 0.3] },
  newyork: { hemi: ['#E3E9F5', '#8A8578', 0.64], sun: ['#FFE6C4', 2.9], fill: ['#D7E2FF', 0.38], fog: [80, 170] },
  mexico: { hemi: ['#FFE9D8', '#9C8A74', 0.68], sun: ['#FFE2B8', 3.3], fill: ['#E8F0FF', 0.32], fog: [90, 180] },
  cairo: { hemi: ['#FFE4C2', '#B08A5E', 0.66], sun: ['#FFC98A', 3.2], fill: ['#FFE9CF', 0.3], fog: [80, 170] },
  london: { hemi: ['#E2D3F2', '#8C7B6C', 0.66], sun: ['#FFB781', 2.6], fill: ['#C9C2FF', 0.42], wet: true, fog: [70, 150] },
};
function buildCityDecor(kind) {
  if (cityScene === kind) { buildShell(kind); buildAnnexLot(kind); return; } cityScene = kind;
  if (world.cityG) scene.remove(world.cityG); const cg = new THREE.Group(); scene.add(cg); world.cityG = cg;
  const res = buildCity(kind, cg, { THREE, put, rbox, cyl, sph, grp, mat, canvasTex, low: GFX.low, glb: kind === 'london' ? glbSwap : null }, plotBox(kind));
  scene.background = new THREE.Color(res.bg); const L = CITY_LIGHT[kind] || CITY_LIGHT._;
  world.ground.material = mat('#FFFFFF', { r: L.wet ? 0.38 : 0.9, map: tileTex(res.ground[0], res.ground[1], [36, 36]), mapK: 'g' + kind });
  hemi.color.set(L.hemi[0]); hemi.groundColor.set(L.hemi[1]); hemi.intensity = L.hemi[2]; sun.color.set(L.sun[0]); sun.intensity = L.sun[1]; fill.color.set(L.fill[0]); fill.intensity = L.fill[1];
  scene.fog = L.fog ? new THREE.Fog(res.bg, L.fog[0], L.fog[1]) : null;
  if (GFX.batch) { const stop = new Set([...res.buildings.map((b) => b.o), ...res.movers.filter((m) => m.o).map((m) => m.o)]); cg.traverse((o) => { if (o.userData.swap) stop.add(o); }); for (const b of res.buildings) batchNode(b.o); batchNode(cg, stop); }
  world.cityB = res.buildings; world.movers = res.movers; moveCity(world.movers, 0); updateCutaway();
  buildShell(kind); buildAnnexLot(kind);
}
function buildAnnexLot(c) {
  c = c || (S && S.city) || 'london';
  if (world.lotGroup) { scene.remove(world.lotGroup); world.lotGroup = null; }
  const g = new THREE.Group(); scene.add(g); world.lotGroup = g;
  const sig = c + ownedLots(c).join(',') + (S && S.city === c ? ['garden', 'gardenRoof', 'gardenHeat', 'gardenCool'].map((k) => (S[k] ? 1 : 0)).join('') : ''); if (world.shellOwn !== sig) { world.shellOwn = sig; buildShell(c); }
  plotOf(c).lots.forEach((L, i) => {
    const st = S && S.city === c ? lotSt(i) : 'locked', cx = (L[0] + L[1]) / 2, cz = (L[2] + L[3]) / 2;
    if (st === 'owned') return;
    put(rbox(L[1] - L[0] - 0.2, 0.3, L[3] - L[2] - 0.2, '#CBBFA9', 0.06), cx, -0.4, cz, g);
    floorPlane(L[0] + 0.1, L[1] - 0.1, L[2] + 0.1, L[3] - 0.1, mat('#C2B59C', { r: 1 }), -0.24, g);
    if (st === 'pending') { for (let k = 0; k < 4; k++) put(cyl(0.05, 0.05, 2.4, '#E3B341'), L[0] + 1 + k * (L[1] - L[0] - 2) / 3, 0.95, L[2] + 1, g); put(rbox(L[1] - L[0] - 2, 0.1, 0.1, '#E3B341', 0.02), cx, 2.0, L[2] + 1, g); put(rbox(L[1] - L[0] - 2, 0.1, 0.1, '#E3B341', 0.02), cx, 1.2, L[2] + 1, g); }
    else { const s = grp(cx, cz, 0, g); put(cyl(0.05, 0.05, 1.6, '#8B6A45'), 0, 0.5, 0, s); put(rbox(1.4, 0.8, 0.08, '#FFD25E', 0.04), 0, 1.4, 0, s); }
  });
}
function lotOwned(i) {
  setLot(i, 'owned'); buildAnnexLot(); rebuildGrid();
  const L = plotOf().lots[i];
  for (const r of S.rooms) { const q = roomRect(r); if (q.x0 <= L[1] + 0.1 && q.x1 >= L[0] - 0.1 && q.z0 <= L[3] + 0.1 && q.z1 >= L[2] - 0.1) { evictRoom(r.id); buildRoom(r); } }
  assignStaff(); chat(t('from.council'), t('council.ok'), '📝'); toast('🏗️ ' + t('lot.ready'), 2600); say('lot', t('lot.ready'), 0); save();
}

// ---------------- rooms ----------------
const R = { rooms: {}, staff: [], visitors: [], deskQ: [], deskQs: [], litter: [], rats: [], inspector: null, later: [] }; R.deskQs[0] = R.deskQ;
// Room style kit (v2 look): thick rounded matte walls, cream cap, darker skirting, optional ivy + fairy lights.
const WALL_CUT = 0.22, ROOM_H = 2.5, DOOR_H = 2.15, DOOR_W = 1.15; // walls taller than people (~1.75 m), one modern door per room
const ROOM_STYLE = { nap: { wall: '#E4D6F6', cap: '#FFF7EC', base: '#BFA6E6', floor: '#EFE4FA', ivy: true, lights: true, h: ROOM_H } };
// soft pastel wall per room (from its colour), cream rounded caps and posts — same family as the nap room
const _mix = (a, b, k) => { const A = new THREE.Color(a), B = new THREE.Color(b); return '#' + A.lerp(B, k).getHexString(); };
const WALL_TINT = { yoga: '#D3ECEE', lucha: '#F6D3E2', ahwa: '#F0DCC0', budget: '#F3D9B8', detox: '#D3E6F4', career: '#F2D6DE', cafe: '#D6EBDD', lab: '#DCE2EC', social: '#F8D7E2', parent: '#FBE2C0', moving: '#EADCC8', pharmacy: '#D2EDE6', glowup: '#F8DCE8', wedding: '#F8DCE6', jjim: '#F0D9C4', roda: '#D7EDD5', garage: '#F2E3BD', shop: '#F9DCCF', staffroom: '#EDE2CF', toilet: '#D9ECF8', therapy: '#D5E6D9' };
for (const [k, c] of Object.entries(WALL_TINT)) ROOM_STYLE[k] = { wall: c, cap: '#FFF7EC', base: _mix(c, ROOMS[k] ? ROOMS[k].pill : '#8A8E96', 0.35), ivy: ['cafe', 'therapy', 'social', 'staffroom'].includes(k), lights: ['cafe', 'social', 'glowup'].includes(k), h: ROOM_H, posts: true };
ROOM_STYLE.nap.posts = true;
function leaf(r, c, o) { const k = 'L' + r; if (!GC[k]) GC[k] = new THREE.IcosahedronGeometry(r, 1); const m = new THREE.Mesh(GC[k], mat(c, o)); m.castShadow = false; m.receiveShadow = false; return m; }
function wallSegS(x0, z0, x1, z1, S, parent) {
  const alongX = Math.abs(z1 - z0) < 1e-6, len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0), th = 0.3, h = S.h, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (len < 0.05) return;
  put(rbox(alongX ? len : th, h, alongX ? th : len, S.wall, 0.1, { r: 0.95 }), cx, h / 2 + 0.1, cz, parent);
  put(rbox(alongX ? len + 0.06 : th + 0.12, 0.12, alongX ? th + 0.12 : len + 0.06, S.cap, 0.06, { r: 0.9 }), cx, h + 0.15, cz, parent);
  put(rbox(alongX ? len + 0.02 : th + 0.06, 0.16, alongX ? th + 0.06 : len + 0.02, S.base, 0.05, { r: 0.95 }), cx, 0.2, cz, parent);
  if (S.posts) for (const [px, pz] of [[x0, z0], [x1, z1]]) { put(cyl(0.21, 0.23, h + 0.08, S.cap, { r: 0.9 }), px, (h + 0.08) / 2 + 0.1, pz, parent); const top = sph(0.22, S.cap, { r: 0.9 }); top.scale.y = 0.45; put(top, px, h + 0.2, pz, parent); }
  if (S.ivy && len > 1.2) for (let u = 0.35; u < len - 0.2; u += 0.42) { const k = Math.floor(u * 7) % 3, px = alongX ? Math.min(x0, x1) + u : cx, pz = alongX ? cz : Math.min(z0, z1) + u;
    put(leaf(0.12, ['#5E9E5A', '#4E8F4F', '#79B266'][k], { r: 0.95 }), px, h + 0.22, pz, parent);
    if (k !== 1) for (let d = 1; d <= 1 + (k === 2 ? 1 : 0); d++) put(leaf(0.075, '#5E9E5A', { r: 0.95 }), px + (alongX ? 0 : 0.17), h + 0.18 - d * 0.2, pz + (alongX ? 0.17 : 0), parent); }
  if (S.lights && len > 1.5) for (let u = 0.6; u < len - 0.3; u += 0.75) put(leaf(0.045, '#FFE2A8', { e: '#FFD27A', ei: 1.6 }), alongX ? Math.min(x0, x1) + u : cx, h + 0.02 - Math.abs(Math.sin(u * 2.1)) * 0.12, alongX ? cz : Math.min(z0, z1) + u, parent);
}
function wallWithGap(x0, z0, x1, z1, gap, g, S) {
  const seg = (a, b, c, d) => (S ? wallSegS(a, b, c, d, S, g) : wallSeg(a, b, c, d, ROOM_H, '#FFFFFF', g));
  if (!gap) { seg(x0, z0, x1, z1); return; }
  const alongX = Math.abs(z1 - z0) < 1e-6, a = alongX ? x0 : z0, b = alongX ? x1 : z1, c = gap, hw = DOOR_W / 2 + 0.08;
  if (c - hw - a > 0.2) alongX ? seg(a, z0, c - hw, z0) : seg(x0, a, x0, c - hw);
  if (b - (c + hw) > 0.2) alongX ? seg(c + hw, z0, b, z0) : seg(x0, c + hw, x0, b);
}
function buildRoom(r) {
  if (world.roomGroups[r.id]) { const og = world.roomGroups[r.id]; if (og.parent) og.parent.remove(og); }
  const g = new THREE.Group(); scene.add(g); world.roomGroups[r.id] = g;
  const def = ROOMS[r.type], Z = SIZES[r.size], q = roomRect(r), dp = doorPt(r, 0);
  const RS = ROOM_STYLE[r.type];
  const fm = RS && RS.floor ? mat(RS.floor, { r: 1 }) : r.type === 'budget' || r.type === 'cafe' ? mat('#FFFFFF', { map: woodTex(def.floor, '#D9AE78', [3, 3]), mapK: 'w' + r.type }) : mat(def.floor, { r: 0.9 });
  floorPlane(q.x0 + 0.04, q.x1 - 0.04, q.z0 + 0.04, q.z1 - 0.04, fm, 0.11, g);
  const near = (a, b) => Math.abs(a - b) < 0.05;
  const outer = (x, z, nz) => !inFloor(x, z) && !(nz > 0 && z > 6.5), mx = (q.x0 + q.x1) / 2, mz = (q.z0 + q.z1) / 2;
  const wallG = []; const side = (nx, nz) => { const sg = new THREE.Group(); g.add(sg); sg.userData.n = [nx, nz]; sg.userData.p = [nx ? (nx < 0 ? q.x0 : q.x1) : mx, nz ? (nz < 0 ? q.z0 : q.z1) : mz]; wallG.push(sg); return sg; };
  if (!outer(mx, q.z0 - 0.3, -1)) wallWithGap(q.x0, q.z0, q.x1, q.z0, near(dp.z, q.z0) ? dp.x : 0, side(0, -1), RS);
  if (!outer(mx, q.z1 + 0.3, 1)) wallWithGap(q.x0, q.z1, q.x1, q.z1, near(dp.z, q.z1) ? dp.x : 0, side(0, 1), RS);
  if (!outer(q.x0 - 0.3, mz, 0)) wallWithGap(q.x0, q.z0, q.x0, q.z1, near(dp.x, q.x0) ? dp.z : 0, side(-1, 0), RS);
  if (!outer(q.x1 + 0.3, mz, 0)) wallWithGap(q.x1, q.z0, q.x1, q.z1, near(dp.x, q.x1) ? dp.z : 0, side(1, 0), RS);
  const door = buildDoor(r, g, RS, def); // not cut away: the door keeps its real height so the scale reads right
  const room = { id: r.id, type: r.type, size: r.size, def: r, spots: [], staffSpots: [], staff: new Array(Z.st).fill(null), cx: r.x, cz: r.z, door };
  const K = clamp(Math.min(Z.W / Z.st, Z.D) / 6.2, 0.6, 1);
  for (let i = 0; i < Z.st; i++) {
    const lx = Z.st === 2 ? (i ? Z.W / 4 : -Z.W / 4) : 0, c = toW(r, lx, 0);
    const sg = grp(c.x, c.z, r.a, g); const tmp = { spots: [], staffSpot: null, sz: r.size, w: Z.W / Z.st };
    furniture[r.type](sg, 0, 0, tmp, K);
    fitFurniture(sg, tmp, Z.W / Z.st, Z.D, RS ? 0.2 : 0.16);
    const conv = (p) => { const w = toW(r, lx + p.x, p.z); return { ...p, x: w.x, z: w.z, rot: (p.rot || 0) + r.a }; };
    for (const sp of tmp.spots) room.spots.push({ ...conv(sp), st: i, busy: null });
    room.staffSpots[i] = tmp.staffSpot ? conv(tmp.staffSpot) : null;
  }
  const pc = toW(r, Z.W / 2 - 0.6, -Z.D / 2 + 0.7); plant(pc.x, pc.z, 0.9, '#FFFFFF', g);
  // furniture footprints become obstacles for the walk grid (people go around sofas, desks, poufs, machines…)
  { g.updateMatrixWorld(true); const skip = new Set([...wallG, door.g]), bx = new THREE.Box3(), obs = [];
    const walk = (o) => { for (const c of o.children) { if (skip.has(c)) continue; if (c.isMesh) { bx.setFromObject(c); const sx = bx.max.x - bx.min.x, sz = bx.max.z - bx.min.z; if (bx.max.y > 0.3 && bx.min.y < 1.0 && sx < 3.6 && sz < 3.6 && sx * sz > 0.01) obs.push([bx.min.x, bx.max.x, bx.min.z, bx.max.z]); } walk(c); } };
    walk(g); room.obs = obs; }
  if (GFX.batch) { for (const w of wallG) batchNode(w, new Set(), { userData: { roomId: r.id } }); batchNode(door.g, new Set([...door.leaves, door.top].filter(Boolean)), { userData: { roomId: r.id } }); const st = new Set([...wallG, door.g]); g.traverse((o) => { if (o.userData.swap) st.add(o); }); batchNode(g, st, { userData: { roomId: r.id } }); }
  world.roomCut = (world.roomCut || []).filter((w) => w.parent && w.parent.parent).concat(wallG); updateCutaway();
  g.traverse((m) => { if (m.isMesh) m.userData.roomId = r.id; });
  R.rooms[r.id] = room; if (S && S.rooms) rebuildGrid();
}
// swinging double door in the 2 m wall gap: opens inward when someone comes close, closes behind them
const doorMats = {};
function buildDoor(r, parent, RS, def) {
  const dp = doorPt(r, 0), H = RS ? RS.h : ROOM_H, g = grp(dp.x, dp.z, r.a, parent); g.userData.n = [Math.sin(r.a), Math.cos(r.a)];
  const wallC = RS ? RS.wall : '#FFFFFF', frame = '#3B3F46', slab = RS ? RS.base : def.pill || '#7ACB4E', th = RS ? 0.3 : T, ow = DOOR_W + 0.16;
  // frame (thin dark jambs + head) and the wall piece above the door
  for (const sx of [-1, 1]) put(rbox(0.08, DOOR_H + 0.04, th + 0.04, frame, 0.02, { r: 0.6 }), sx * (DOOR_W / 2 + 0.04), (DOOR_H + 0.04) / 2 + 0.1, 0, g);
  put(rbox(ow, 0.08, th + 0.04, frame, 0.02, { r: 0.6 }), 0, DOOR_H + 0.14, 0, g);
  const top = H > DOOR_H + 0.2 ? put(rbox(ow, H - DOOR_H - 0.14, th, wallC, 0.03, { r: 0.95 }), 0, (H + DOOR_H + 0.14) / 2 + 0.1, 0, g) : null;
  // one flush slab door, hinged on the left, with a narrow vision strip and a long bar handle
  const piv = grp(-DOOR_W / 2, 0, 0, g); piv.position.y = 0.1;
  put(rbox(DOOR_W - 0.04, DOOR_H - 0.02, 0.05, slab, 0.015, { r: 0.75 }), DOOR_W / 2, DOOR_H / 2, 0, piv);
  put(rbox(0.14, DOOR_H * 0.55, 0.06, '#CFEFF7', 0.01, { r: 0.15, op: 0.7 }), DOOR_W * 0.3, DOOR_H * 0.58, 0, piv);
  for (const sz of [-1, 1]) put(rbox(0.035, 0.55, 0.035, '#2B2E33', 0.015, { m: 0.7, r: 0.3 }), DOOR_W - 0.16, DOOR_H * 0.48, sz * 0.07, piv);
  const d = { g, leaves: [piv], top, x: dp.x, z: dp.z, open: 0 };
  (world.doors = (world.doors || []).filter((o) => o.g.parent && o.g.parent.parent)).push(d);
  return d;
}
// how loud a sound at p is: full when it's around the centre of the view, silent off-screen
function hearVol(p) { const d = Math.hypot(p.x - view.tx, p.z - view.tz); return clamp(1.15 - d / (view.half * 0.9), 0, 1); }
let ambT = 3;
function ambience(dt) {
  ambT -= dt; if (ambT > 0) return; ambT = 2.2 + Math.random() * 2.5;
  const sleepers = R.visitors.filter((v) => v.state === 'treat' && v.rspot && v.rspot.lie);
  if (sleepers.length) { const v = rnd(sleepers); AU.sfx('snore', hearVol(v.av.position) * 0.9); }
  else if (Math.random() < 0.15) { const w = R.visitors.filter((v) => v.state === 'wait'); if (w.length) { const v = rnd(w); AU.sfx('yawn', hearVol(v.av.position) * 0.6); } }
}
function doorsUpdate(dt) {
  ambience(dt);
  const ds = world.doors; if (!ds || !ds.length) return;
  const movers = []; for (const v of R.visitors) movers.push(v.av.position); for (const rs of R.staff) movers.push(rs.av.position); if (R.mgr && R.mgr.av) movers.push(R.mgr.av.position);
  for (const d of ds) {
    if (!d.g.parent) continue;
    let want = 0; for (const p of movers) if (Math.abs(p.x - d.x) < 1.25 && Math.abs(p.z - d.z) < 1.25) { want = 1; break; }
    if (want && d.open < 0.05) AU.sfx('door', hearVol(d) * 0.8);
    if (!want && d.open > 0.12 && d.open * (1 - Math.min(1, dt * 4)) <= 0.12) AU.sfx('doorShut', hearVol(d) * 0.6);
    d.open += (want - d.open) * Math.min(1, dt * (want ? 9 : 4));
    const e = d.open * d.open * (3 - 2 * d.open);
    d.leaves[0].rotation.y = e * 1.5; // swings into the room
  }
}
// keep every piece of furniture inside the room: push it back from the walls (and the seats/spots that go with it)
const _fb = new THREE.Box3();
function fitFurniture(sg, tmp, w, d, m) {
  const p0 = sg.position.clone(), r0 = sg.rotation.y; sg.position.set(0, 0, 0); sg.rotation.y = 0; sg.updateMatrixWorld(true);
  const lim = [-w / 2 + m, w / 2 - m, -d / 2 + m, d / 2 - m];
  for (const c of sg.children) {
    _fb.setFromObject(c); if (_fb.isEmpty() || _fb.max.y < 0.2) continue;
    const sx = _fb.max.x - _fb.min.x, sz = _fb.max.z - _fb.min.z, hung = _fb.min.y > 0.5 && Math.min(sx, sz) < 0.2; // wall-hung: only slide along the wall
    let dx = 0, dz = 0;
    if (_fb.min.x < lim[0]) dx = lim[0] - _fb.min.x; else if (_fb.max.x > lim[1]) dx = lim[1] - _fb.max.x;
    if (_fb.min.z < lim[2]) dz = lim[2] - _fb.min.z; else if (_fb.max.z > lim[3]) dz = lim[3] - _fb.max.z;
    if (hung) { if (sz < sx) dz = 0; else dx = 0; }
    if (!dx && !dz) continue;
    const near = (sp) => sp && sp.x > _fb.min.x - 0.35 && sp.x < _fb.max.x + 0.35 && sp.z > _fb.min.z - 0.35 && sp.z < _fb.max.z + 0.35;
    for (const sp of tmp.spots.concat(tmp.staffSpot ? [tmp.staffSpot] : [])) if (near(sp)) { sp.x += dx; sp.z += dz; }
    c.position.x += dx; c.position.z += dz;
  }
  sg.position.copy(p0); sg.rotation.y = r0; sg.updateMatrixWorld(true);
}
function chair(g, x, z, rot, col) { const c = grp(x, z, rot, g); put(rbox(0.6, 0.1, 0.55, col, 0.04), 0, 0.5, 0, c); put(rbox(0.6, 0.65, 0.1, col, 0.04), 0, 0.88, -0.28, c); put(cyl(0.04, 0.04, 0.42, '#555'), 0, 0.25, 0, c); }
// group rooms seat more people as they grow: 2 (small) · 4 (normal) · 6 (large = 2 stations × 3)
const seatsN = (room) => ({ s: 2, m: 4, l: 3 }[room.sz] || 2);
function bedXs(room, bw) { const n = room.sz ? { s: 2, m: 4, l: 3 }[room.sz] : 2, W = (room.w || 6) - 0.5, sp = Math.min(1.5, W / n); return Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * sp); }
const CAPC = {};
function capOf(type, size) { const k = type + size; if (CAPC[k] != null) return CAPC[k]; const Z = SIZES[size], K = clamp(Math.min(Z.W / Z.st, Z.D) / 6.2, 0.6, 1); let n = 0; for (let i = 0; i < Z.st; i++) { const tmp = { spots: [], staffSpot: null, sz: size, w: Z.W / Z.st }; try { furniture[type](new THREE.Group(), 0, 0, tmp, K); } catch (e) {} n += tmp.spots.length; } return (CAPC[k] = n); }
const furniture = {
  budget(g, cx, cz, room, K = 1) {
    const d = grp(cx, cz - 0.6 * K, 0, g);
    put(rbox(2.2, 0.12, 1.0, '#C98F5A', 0.05), 0, 0.86, 0, d); put(rbox(0.45, 0.78, 0.85, '#B07B49', 0.05), -0.8, 0.46, 0, d); put(rbox(0.45, 0.78, 0.85, '#B07B49', 0.05), 0.8, 0.46, 0, d);
    put(rbox(0.9, 0.58, 0.06, '#2F3640', 0.03), 0, 1.32, -0.25, d); put(rbox(0.8, 0.48, 0.02, '#9FE8D8', 0.01, { e: '#7FD8C6', ei: 0.5 }), 0, 1.32, -0.21, d);
    put(cyl(0.07, 0.06, 0.14, '#FFFFFF'), 0.8, 1.0, 0.2, d); glbSwap(d, 'budgetdesk', { len: 2.2, h: 1.15, y: 0.12 });
    chair(g, cx, cz - 1.6 * K, 0, '#2BB5A6'); chair(g, cx, cz + 0.45 * K, Math.PI, '#E9785F');
    const sh = grp(cx + 2.2 * K, cz - 2.7 * K, 0, g); put(rbox(1.3, 1.9, 0.5, '#B98552', 0.04), 0, 1.05, 0, sh);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) put(rbox(0.15, 0.4, 0.32, ['#2BB5A6', '#E9785F', '#5AB8F0', '#FFC83D', '#7F68C9'][(i + r) % 5], 0.02), -0.44 + i * 0.22, 0.5 + r * 0.6, 0.12, sh);
    room.staffSpot = { x: cx, z: cz - 1.6 * K, rot: 0, sit: true, y: 0.02 };
    room.spots.push({ x: cx, z: cz + 0.45 * K, rot: Math.PI, sit: true, y: 0.02, busy: null });
  },
  career(g, cx, cz, room, K = 1) {
    const d = grp(cx, cz - 0.6 * K, 0, g);
    put(rbox(2.2, 0.12, 1.0, '#F4EFE6', 0.05), 0, 0.86, 0, d); put(rbox(2.0, 0.76, 0.1, '#C2577A', 0.03), 0, 0.46, 0.4, d);
    put(rbox(0.9, 0.58, 0.06, '#2F3640', 0.03), 0, 1.32, -0.25, d); put(rbox(0.8, 0.48, 0.02, '#FFD6E0', 0.01, { e: '#FFC2D1', ei: 0.4 }), 0, 1.32, -0.21, d);
    chair(g, cx, cz - 1.6 * K, 0, '#3B4A6B'); chair(g, cx, cz + 0.45 * K, Math.PI, '#FFD25E');
    const wb = grp(cx - 2.2 * K, cz - 2.95 * K, 0, g); put(rbox(1.6, 1.0, 0.06, '#FFFFFF', 0.03), 0, 1.6, 0, wb); put(rbox(1.0, 0.06, 0.02, '#16963C', 0.01), -0.1, 1.7, 0.04, wb); put(rbox(0.6, 0.06, 0.02, '#D93A3F', 0.01), 0.1, 1.5, 0.04, wb);
    const ladder = grp(cx + 2.3 * K, cz - 2.6 * K, 0, g); for (const sx of [-0.25, 0.25]) put(rbox(0.06, 2.0, 0.06, '#B98552', 0.02), sx, 1.1, 0, ladder); for (let i = 0; i < 5; i++) put(rbox(0.5, 0.05, 0.05, '#B98552', 0.02), 0, 0.4 + i * 0.38, 0, ladder);
    room.staffSpot = { x: cx, z: cz - 1.6 * K, rot: 0, sit: true, y: 0.02 };
    room.spots.push({ x: cx, z: cz + 0.45 * K, rot: Math.PI, sit: true, y: 0.02, busy: null });
  },
  nap(g, cx, cz, room, K = 1) {
    const BL = ['#B9A6E8', '#9FDCC4', '#F6B8C8', '#FFD9A0'];
    bedXs(room, 1.15).forEach((ox, i) => {
      const p = grp(cx + ox, cz - 1.2 * K, 0, g);
      put(rbox(1.2, 0.36, 2.05, '#FFFFFF', 0.17, { r: 0.85 }), 0, 0.28, 0, p);
      put(rbox(1.04, 0.15, 1.85, '#FFF8F0', 0.07, { r: 1 }), 0, 0.52, 0.03, p);
      put(rbox(1.07, 0.12, 1.15, BL[i % 4], 0.06, { r: 1 }), 0, 0.6, 0.38, p);
      put(rbox(1.09, 0.1, 0.2, '#FFFFFF', 0.05, { r: 1 }), 0, 0.64, -0.17, p);
      put(rbox(0.62, 0.15, 0.34, '#FFFFFF', 0.075, { r: 1 }), 0, 0.66, -0.62, p);
      put(rbox(1.3, 1.25, 0.32, '#FFFFFF', 0.16, { r: 0.85 }), 0, 0.72, -0.98, p);
      put(rbox(1.3, 0.16, 0.78, '#FFFFFF', 0.08, { r: 0.85 }), 0, 1.32, -0.68, p);
      put(rbox(1.0, 0.04, 0.5, BL[i % 4], 0.02, { e: BL[i % 4], ei: 0.35 }), 0, 1.23, -0.68, p);
      room.spots.push({ x: cx + ox, z: cz - 0.7 * K, rot: 0, sit: true, lie: true, y: 0.12, busy: null });
    });
    const moon = new THREE.Mesh(GC.moon || (GC.moon = new THREE.TorusGeometry(0.42, 0.09, 10, 30, Math.PI * 1.3)), mat('#FFD36E', { e: '#FFC94A', ei: 1.3 }));
    moon.rotation.z = 0.6; put(moon, cx - 0.2 * K, 2.05, cz - 3.0 * K + 0.2, g);
    for (const [sx, sy] of [[0.7, 2.3], [1.0, 1.85], [-0.9, 2.25]]) put(sph(0.06, '#FFE2A8', { e: '#FFD27A', ei: 1.5 }), cx + sx * K, sy, cz - 3.0 * K + 0.22, g);
    const rug = new THREE.Mesh(GC.rugN || (GC.rugN = new THREE.CylinderGeometry(1.15, 1.15, 0.03, 40)), mat('#C2A8F0', { r: 1 })); rug.position.set(cx, 0.14, cz + 1.35 * K); rug.receiveShadow = true; g.add(rug);
    const rim = new THREE.Mesh(GC.rugR || (GC.rugR = new THREE.TorusGeometry(1.15, 0.05, 6, 40)), mat('#A88BE0', { r: 1 })); rim.rotation.x = Math.PI / 2; rim.position.set(cx, 0.15, cz + 1.35 * K); g.add(rim);
    const pouf = sph(0.34, '#FFD25E', { r: 0.95 }); pouf.scale.set(1, 0.62, 1); put(pouf, cx - 0.75 * K, 0.33, cz + 1.75 * K, g);
    plant(cx + room.w / 2 - 0.55, cz + 2.2 * K, 0.85, '#F4EFE6', g);
    if (room.sz !== 's') { const st = grp(cx - room.w / 2 + 0.45, cz + 0.5 * K, 0, g); put(cyl(0.22, 0.22, 0.5, '#E9D3B5', { r: 0.9 }), 0, 0.35, 0, st); put(cyl(0.03, 0.03, 0.4, '#8B6A45'), 0, 0.78, 0, st); put(new THREE.Mesh(GC.shade || (GC.shade = new THREE.CylinderGeometry(0.1, 0.18, 0.2, 16)), mat('#FFF1D6', { e: '#FFE2A8', ei: 0.8 })), 0, 1.02, 0, st); }
    room.staffSpot = { x: cx + 0.2 * K, z: cz + 1.4 * K, rot: Math.PI / 4, sit: false, y: 0 };
  },

  detox(g, cx, cz, room, K = 1) {
    const lock = grp(cx + 1.8 * K, cz - 2.6 * K, 0, g); put(rbox(1.6, 1.6, 0.6, '#5AB8F0', 0.08), 0, 0.9, 0, lock);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) put(rbox(0.32, 0.38, 0.03, '#E6F3FC', 0.02), -0.55 + i * 0.37, 0.4 + r * 0.48, 0.31, lock); glbSwap(lock, 'locker', { h: 1.8, y: 0.1 });
    const bean = sph(0.55, '#FFB067'); bean.scale.set(1, 0.6, 1); const bg = grp(cx - 0.9 * K, cz - 0.4 * K, Math.PI / 4, g); put(bean, 0, 0.38, 0, bg); glbSwap(bg, 'beanbag', { h: 0.72, y: 0.1 });
    const tent = new THREE.Mesh(new THREE.ConeGeometry(1.1 * K, 1.8 * K, 4), mat('#F4EFE6')); tent.rotation.y = Math.PI / 4; put(tent, cx - 2.0 * K, 0.1 + 0.9 * K, cz - 2.2 * K, g);
    room.spots.push({ x: cx - 0.9 * K, z: cz - 0.4 * K, rot: Math.PI / 4, sit: true, y: 0.0, busy: null });
    room.staffSpot = { x: cx + 0.6 * K, z: cz + 0.8 * K, rot: -Math.PI / 4, sit: false, y: 0 };
  },
  cafe(g, cx, cz, room, K = 1) {
    // counter against the back wall, sized to the room; barista between counter and wall, facing the customers
    const W = room.w || 6, D = SIZES[room.sz || 'm'].D, cw = Math.min(3.0, W - 1.4), ccx = cx - W / 2 + 0.45 + cw / 2, ccz = cz - D / 2 + 1.15;
    const c = grp(ccx, ccz, 0, g);
    put(rbox(cw, 1.0, 0.8, '#7CC4A4', 0.06), 0, 0.6, 0, c); put(rbox(cw + 0.15, 0.1, 0.95, '#E8C796', 0.04), 0, 1.15, 0, c);
    put(rbox(0.45, 0.5, 0.45, '#C0C6CC', 0.06, { m: 0.5, r: 0.3 }), -cw / 2 + 0.4, 1.45, 0, c);
    const gl = rbox(Math.min(0.8, cw * 0.3), 0.45, 0.6, '#FFFFFF', 0.05, { op: 0.35, r: 0.05 }); gl.castShadow = false; put(gl, cw / 2 - 0.5, 1.43, 0, c);
    ['#FF8FAB', '#FFD36E', '#9FD8B8', '#C9B6F2'].forEach((col, i) => put(cyl(0.08, 0.08, 0.07, col), cw / 2 - 0.65 + (i % 2) * 0.3, 1.3, -0.12 + Math.floor(i / 2) * 0.24, c)); glbSwap(c, 'cafecounter', { len: cw + 0.1, h: 1.65, y: 0.1 });
    const tabs = W >= 6 ? [[cx + 0.9 * K, cz + 0.5 * K], [cx - 0.8 * K, cz + 1.6 * K]] : [[cx + 0.6, cz + D / 2 - 1.1]];
    for (const [tx, tz] of tabs) { const tb = grp(tx, tz, 0, g); put(cyl(0.42, 0.42, 0.06, '#FFFFFF'), 0, 0.82, 0, tb); put(cyl(0.05, 0.05, 0.72, '#7A8088'), 0, 0.46, 0, tb); put(cyl(0.07, 0.06, 0.15, '#7CC4A4'), 0.12, 0.93, 0.05, tb); }
    const b = CHAR.A.full.host ? person({ role: 'host' }, 'staff') : person({ skin: crnd(SKIN), shirt: '#2E3A36', pants: '#2E3A36', hair: '#FF8FAB', style: 'bun', apron: true }); b.position.set(ccx, 0.1, ccz - 0.75); g.add(b);
  },
  social(g, cx, cz, room, K = 1) {
    const tb = grp(cx, cz - 0.3 * K, 0, g); put(cyl(0.7, 0.7, 0.08, '#FFFFFF'), 0, 0.82, 0, tb); put(cyl(0.08, 0.1, 0.75, '#7A8088'), 0, 0.42, 0, tb);
    put(cyl(0.05, 0.04, 0.22, '#E0567F', { op: 0.85 }), -0.2, 0.97, 0.1, tb); put(cyl(0.05, 0.04, 0.22, '#FFD25E', { op: 0.85 }), 0.22, 0.97, -0.05, tb); put(sph(0.12, '#FF8FAB'), 0, 0.95, -0.25, tb);
    { const n = seatsN(room), tz = cz - 0.3 * K, R0 = 1.05 * Math.max(K, 0.8); for (let i = 0; i < n; i++) { const a = Math.PI + (i * 2 * Math.PI) / n + (n === 3 ? 0.4 : 0), x = cx + Math.cos(a) * R0, z = tz + Math.sin(a) * R0, rot = Math.atan2(cx - x, tz - z); const st = grp(x, z, rot, g); put(cyl(0.25, 0.22, 0.5, '#E0567F'), 0, 0.3, 0, st); room.spots.push({ x, z, rot, sit: true, y: 0.05, busy: null }); } }
    for (let i = 0; i < 7; i++) put(sph(0.08, ['#FFD25E', '#FF8FAB', '#7ACB4E', '#5AB8F0'][i % 4], { e: ['#FFD25E', '#FF8FAB', '#7ACB4E', '#5AB8F0'][i % 4], ei: 0.8 }), cx + (-1.8 + i * 0.6) * K, 2.2 - Math.abs(i - 3) * 0.08, cz - 2.6 * K, g);
    const sofa = grp(cx + 1.8 * K, cz + 1.6 * K, -Math.PI / 2, g); put(rbox(1.6, 0.4, 0.7, '#B57BE8', 0.14), 0, 0.3, 0, sofa); put(rbox(1.6, 0.55, 0.22, '#B57BE8', 0.1), 0, 0.62, -0.28, sofa);
    room.staffSpot = { x: cx, z: cz + 1.1 * K, rot: Math.PI, sit: false, y: 0 };
  },
  parent(g, cx, cz, room, K = 1) {
    const mat2 = new THREE.Mesh(new THREE.BoxGeometry(2.2 * K + 0.6, 0.03, 2.0 * K + 0.6), mat('#7ACB4E', { r: 1 })); mat2.position.set(cx + 0.4 * K, 0.14, cz - 0.6 * K); mat2.receiveShadow = true; g.add(mat2);
    ['#E9785F', '#5AB8F0', '#FFD25E', '#B57BE8', '#2BB5A6'].forEach((c, i) => put(rbox(0.32, 0.32, 0.32, c, 0.05), cx + (-0.3 + (i % 3) * 0.4) * K, 0.32 + Math.floor(i / 3) * 0.32, cz - 1.0 * K, g));
    const sl = grp(cx + 2.0 * K, cz - 2.2 * K, -Math.PI / 4, g); put(rbox(0.6, 0.06, 1.6, '#FF8FAB', 0.03), 0, 0.6, 0, sl); sl.children[0].rotation.x = 0.55; put(rbox(0.5, 1.1, 0.5, '#FFD25E', 0.06), 0, 0.6, -0.9, sl);
    const bean = sph(0.55, '#E08A2E'); bean.scale.set(1, 0.6, 1); put(bean, cx - 1.4 * K, 0.38, cz + 0.4 * K, g);
    room.spots.push({ x: cx - 1.4 * K, z: cz + 0.4 * K, rot: Math.PI / 4, sit: true, y: 0, busy: null });
    room.staffSpot = { x: cx + 0.2 * K, z: cz + 1.2 * K, rot: -Math.PI * 0.8, sit: false, y: 0 };
  },
  moving(g, cx, cz, room, K = 1) {
    const d = grp(cx, cz - 0.6 * K, 0, g);
    put(rbox(2.0, 0.12, 0.9, '#F4EFE6', 0.05), 0, 0.86, 0, d); put(rbox(1.9, 0.76, 0.1, '#8A6A45', 0.03), 0, 0.46, 0.36, d);
    put(rbox(1.0, 0.6, 0.05, '#FFFFFF', 0.02), 0, 1.3, -0.35, d); put(rbox(0.9, 0.5, 0.02, '#9FD8B8', 0.01), 0, 1.3, -0.32, d);
    for (let i = 0; i < 4; i++) put(rbox(0.6, 0.45, 0.5, '#C9A06B', 0.03), cx + (2.0 + (i % 2) * 0.1) * K, 0.33 + Math.floor(i / 2) * 0.46, cz + (-2.4 + (i % 2) * 0.65) * K, g);
    chair(g, cx, cz - 1.5 * K, 0, '#8A6A45'); chair(g, cx, cz + 0.4 * K, Math.PI, '#FFD25E');
    room.staffSpot = { x: cx, z: cz - 1.5 * K, rot: 0, sit: true, y: 0.02 };
    room.spots.push({ x: cx, z: cz + 0.4 * K, rot: Math.PI, sit: true, y: 0.02, busy: null });
  },
  therapy(g, cx, cz, room, K = 1) {
    const cs = grp(cx + 0.6 * K, cz - 0.6 * K, -Math.PI / 2, g);
    put(rbox(1.9, 0.4, 0.75, '#2E7D4F', 0.16), 0, 0.32, 0, cs); put(rbox(0.5, 0.45, 0.75, '#2E7D4F', 0.16), -0.75, 0.6, 0, cs); glbSwap(cs, 'daybed', { len: 1.95, h: 0.8, rot: -Math.PI / 2, y: 0.12 });
    const ac = grp(cx - 1.0 * K, cz - 1.4 * K, Math.PI / 4, g); put(rbox(0.8, 0.45, 0.75, '#F2C14E', 0.14), 0, 0.32, 0, ac); put(rbox(0.8, 0.6, 0.2, '#F2C14E', 0.1), 0, 0.7, -0.3, ac); glbSwap(ac, 'armchair', { len: 0.85, h: 1.0, y: 0.12 });
    const lp = grp(cx - 1.9 * K, cz - 2.4 * K, 0, g); put(cyl(0.03, 0.03, 1.5, '#3B4A6B'), 0, 0.85, 0, lp); put(cyl(0.18, 0.28, 0.3, '#FFF3CF', { e: '#FFE7A8', ei: 0.8 }), 0, 1.65, 0, lp);
    { const tt = grp(cx + 0.6 * K - 1.1, cz - 0.6 * K, 0, g); put(rbox(0.25, 0.15, 0.18, '#FFFFFF', 0.03), 0, 0.58, 0, tt); glbSwap(tt, 'sidetable', { h: 0.78, y: 0.1 }); }
    room.spots.push({ x: cx + 0.6 * K, z: cz - 0.6 * K, rot: -Math.PI / 2, sit: true, y: 0.05, busy: null });
    room.staffSpot = { x: cx - 1.0 * K, z: cz - 1.4 * K, rot: Math.PI / 4, sit: true, y: 0.02 };
  },
  pharmacy(g, cx, cz, room, K = 1) {
    const c = grp(cx, cz - 0.9 * K, 0, g);
    put(rbox(2.4, 1.0, 0.7, '#2BB5A6', 0.08), 0, 0.6, 0, c); put(rbox(2.55, 0.08, 0.85, '#FFFFFF', 0.03), 0, 1.13, 0, c);
    put(rbox(0.5, 0.5, 0.05, '#FFFFFF', 0.02), 0.9, 1.5, 0.3, c); put(rbox(0.12, 0.36, 0.06, '#7ACB4E', 0.01, { e: '#7ACB4E', ei: 0.6 }), 0.9, 1.5, 0.34, c); put(rbox(0.36, 0.12, 0.06, '#7ACB4E', 0.01, { e: '#7ACB4E', ei: 0.6 }), 0.9, 1.5, 0.34, c);
    const sh = grp(cx, cz - 2.6 * K, 0, g); put(rbox(2.6, 2.0, 0.45, '#F4EFE6', 0.04), 0, 1.1, 0, sh);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 8; i++) put(cyl(0.08, 0.08, 0.26, ['#FF8FAB', '#FFD25E', '#5AB8F0', '#7ACB4E', '#B57BE8'][(i + r) % 5]), -1.05 + i * 0.3, 0.6 + r * 0.6, 0.15, sh);
    room.staffSpot = { x: cx, z: cz - 1.6 * K, rot: 0, sit: false, y: 0 };
    room.spots.push({ x: cx, z: cz - 0.1 * K, rot: Math.PI, sit: false, y: 0, busy: null });
  },
  glowup(g, cx, cz, room, K = 1) {
    const mr = grp(cx, cz - 2.5 * K, 0, g); put(rbox(1.6, 1.3, 0.08, '#FFFFFF', 0.04), 0, 1.5, 0, mr); put(rbox(1.4, 1.1, 0.03, '#E6F1FB', 0.02, { e: '#FFFFFF', ei: 0.3 }), 0, 1.5, 0.05, mr);
    for (let i = 0; i < 6; i++) put(sph(0.06, '#FFF3CF', { e: '#FFE7A8', ei: 1.4 }), -0.7 + i * 0.28, 2.2, 0.06, mr);
    put(rbox(1.6, 0.08, 0.5, '#F4C0D1', 0.03), 0, 0.85, 0.25, mr);
    const ch = grp(cx, cz - 1.2 * K, 0, g); put(cyl(0.3, 0.35, 0.12, '#2F3A52'), 0, 0.12, 0, ch); put(cyl(0.06, 0.06, 0.35, '#C0C6CC', { m: 0.6, r: 0.3 }), 0, 0.3, 0, ch);
    put(rbox(0.65, 0.18, 0.6, '#D4537E', 0.08), 0, 0.52, 0, ch); put(rbox(0.65, 0.75, 0.15, '#D4537E', 0.07), 0, 0.88, 0.3, ch);
    const rl = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 8, 24), mat('#FFFFFF', { e: '#FFFFFF', ei: 1.2 })); put(rl, cx + 1.5 * K, 1.7, cz - 1.0 * K, g); put(cyl(0.03, 0.03, 1.6, '#2F3640'), cx + 1.5 * K, 0.9, cz - 1.0 * K, g);
    room.spots.push({ x: cx, z: cz - 1.2 * K, rot: Math.PI, sit: true, y: 0.08, busy: null });
    room.staffSpot = { x: cx - 0.8 * K, z: cz - 1.5 * K, rot: Math.PI * 0.75, sit: false, y: 0 };
  },
  wedding(g, cx, cz, room, K = 1) {
    const ar = grp(cx, cz - 2.5 * K, 0, g); for (const sx of [-0.9, 0.9]) put(cyl(0.08, 0.08, 2.0, '#F2C14E', { m: 0.5, r: 0.3 }), sx, 1.0, 0, ar); const top = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 8, 24, Math.PI), mat('#F2C14E', { m: 0.5, r: 0.3 })); put(top, 0, 2.0, 0, ar);
    for (let i = 0; i < 9; i++) { const a = i / 8 * Math.PI; put(sph(0.12, ['#FF8FAB', '#FFFFFF', '#FFD25E'][i % 3]), Math.cos(a) * 0.9, 2.0 + Math.sin(a) * 0.9, 0.05, ar); }
    const d = grp(cx, cz - 0.7 * K, 0, g); put(rbox(2.0, 0.12, 0.9, '#FFFFFF', 0.05), 0, 0.86, 0, d); put(rbox(1.8, 0.76, 0.1, '#D4537E', 0.03), 0, 0.46, 0.38, d);
    for (let i = 0; i < 5; i++) put(rbox(0.3, 0.03, 0.22, ['#F2C14E', '#FF8FAB', '#FFFFFF'][i % 3], 0.01), -0.5 + i * 0.05, 0.94 + i * 0.03, -0.1, d); put(rbox(0.5, 0.35, 0.05, '#2F3640', 0.02), 0.55, 1.15, -0.2, d);
    chair(g, cx, cz - 1.6 * K, 0, '#D4537E'); chair(g, cx, cz + 0.3 * K, Math.PI, '#F2C14E');
    room.staffSpot = { x: cx, z: cz - 1.6 * K, rot: 0, sit: true, y: 0.02 };
    room.spots.push({ x: cx, z: cz + 0.3 * K, rot: Math.PI, sit: true, y: 0.02, busy: null });
  },
  jjim(g, cx, cz, room, K = 1) {
    for (const ox of bedXs(room, 1.0)) { const m = rbox(1.0, 0.08, 1.9, '#E9785F', 0.03); put(m, cx + ox, 0.16, cz - 1.0 * K, g); put(rbox(0.5, 0.12, 0.3, '#FFFFFF', 0.05), cx + ox, 0.25, cz - 1.75 * K, g); room.spots.push({ x: cx + ox, z: cz - 0.9 * K, rot: 0, sit: true, lie: true, y: 0.05, busy: null }); }
    const bk = grp(cx + 2.0 * K, cz + 1.0 * K, 0, g); put(cyl(0.35, 0.28, 0.3, '#A0794E'), 0, 0.25, 0, bk); for (let i = 0; i < 6; i++) { const e = sph(0.09, '#F4E2C4'); e.scale.y = 1.3; put(e, -0.15 + (i % 3) * 0.15, 0.45, -0.07 + Math.floor(i / 3) * 0.14, bk); }
    const st = grp(cx - 2.2 * K, cz - 2.6 * K, 0, g); put(rbox(1.2, 1.6, 0.5, '#C2703A', 0.06), 0, 0.85, 0, st); put(rbox(1.0, 0.4, 0.05, '#FFB067', 0.02, { e: '#FFB067', ei: 0.8 }), 0, 1.2, 0.26, st);
    room.staffSpot = { x: cx + 0.2 * K, z: cz + 1.3 * K, rot: Math.PI, sit: false, y: 0 };
  },
  yoga(g, cx, cz, room, K = 1) {
    const win = grp(cx, cz - 2.75 * K, 0, g); put(rbox(3.4 * K, 1.4, 0.06, '#BFE6F6', 0.02, { e: '#9FCBE8', ei: 0.25 }), 0, 1.5, 0, win); for (let i = 0; i < 7; i++) put(rbox(0.32, 0.4 + (i * 37 % 9) / 10, 0.02, '#5E6B78', 0.01), -1.4 * K + i * 0.47 * K, 1.0 + (0.4 + (i * 37 % 9) / 10) / 2, 0.04, win);
    put(rbox(0.9, 0.06, 0.6, '#3B8D99', 0.02), cx, 0.13, cz - 1.7 * K, g); room.staffSpot = { x: cx, z: cz - 1.7 * K, rot: 0, sit: false, y: 0.03 };
    const n = seatsN(room), pos = [[-0.8, 0], [0.8, 0], [-0.8, 1.3], [0.8, 1.3], [-2.0, 0.6], [2.0, 0.6]];
    for (let i = 0; i < n; i++) { const [px, pz] = pos[i], x = cx + px * K, z = cz + (pz - 0.2) * K; put(rbox(0.65, 0.03, 1.5, ['#E85A9C', '#7ACB4E', '#F2C14E', '#B57BE8', '#5AB8F0', '#E9785F'][i], 0.01), x, 0.12, z, g); room.spots.push({ x, z, rot: Math.PI, sit: true, y: 0.02, busy: null }); }
    plant(cx - 2.3 * K, cz - 2.3 * K, 0.9, '#FFFFFF', g); plant(cx + 2.3 * K, cz - 2.3 * K, 0.9, '#FFFFFF', g);
  },
  lucha(g, cx, cz, room, K = 1) {
    const rz = cz - 0.7 * K, rs = 1.5 * K; put(rbox(rs * 2, 0.3, rs * 2, '#2F3A52', 0.05), cx, 0.25, rz, g); put(rbox(rs * 2 - 0.1, 0.04, rs * 2 - 0.1, '#5AB8F0', 0.02), cx, 0.42, rz, g);
    for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(cyl(0.06, 0.06, 1.1, ['#D63A7A', '#F7C531', '#5AB8F0', '#7ACB4E'][(px + 1) + (pz + 1) / 2]), cx + px * rs, 0.95, rz + pz * rs, g);
    for (const h of [0.75, 1.05]) { put(rbox(rs * 2, 0.03, 0.03, '#F4EFE6', 0.01), cx, h, rz - rs, g); put(rbox(rs * 2, 0.03, 0.03, '#F4EFE6', 0.01), cx, h, rz + rs, g); put(rbox(0.03, 0.03, rs * 2, '#F4EFE6', 0.01), cx - rs, h, rz, g); put(rbox(0.03, 0.03, rs * 2, '#F4EFE6', 0.01), cx + rs, h, rz, g); }
    put(cyl(0.22, 0.22, 0.9, '#B5793A'), cx + 2.1 * K, 1.0, cz - 2.2 * K, g); put(cyl(0.02, 0.02, 0.6, '#5A6470'), cx + 2.1 * K, 1.75, cz - 2.2 * K, g);
    const n = seatsN(room), xs = [-1.3, 1.3, -0.45, 0.45, -2.1, 2.1];
    for (let i = 0; i < n; i++) { const x = cx + xs[i] * K, z = cz + 1.45 * K; put(rbox(0.5, 0.42, 0.5, '#D63A7A', 0.1), x, 0.31, z, g); room.spots.push({ x, z, rot: Math.PI, sit: true, y: 0.08, busy: null }); }
    room.staffSpot = { x: cx, z: rz + 0.3, rot: 0, sit: false, y: 0.22 };
  },
  ahwa(g, cx, cz, room, K = 1) {
    const ct = grp(cx, cz - 2.4 * K, 0, g); put(rbox(2.4, 0.95, 0.6, '#8A5A32', 0.06), 0, 0.58, 0, ct); put(rbox(2.5, 0.08, 0.7, '#E8D3B0', 0.03), 0, 1.08, 0, ct);
    put(cyl(0.16, 0.2, 0.3, '#C9A54A', { m: 0.6, r: 0.3 }), -0.6, 1.27, 0, ct); put(sph(0.1, '#C9A54A', { m: 0.6, r: 0.3 }), -0.6, 1.45, 0, ct); for (let i = 0; i < 4; i++) put(cyl(0.05, 0.04, 0.1, '#F4EFE6'), 0.1 + i * 0.22, 1.17, 0.05, ct);
    const tables = [[-0.9, -0.5], [0.9, -0.5], [-0.9, 1.0], [0.9, 1.0]], n = seatsN(room);
    for (let i = 0; i < n; i++) { const [tx, tz] = tables[Math.floor(i / 2) % tables.length], side = i % 2 ? 1 : -1, x = cx + (tx + side * 0.5) * K, z = cz + tz * K;
      if (i % 2 === 0) { put(cyl(0.32, 0.32, 0.05, '#E8D3B0'), cx + tx * K, 0.62, z, g); put(cyl(0.05, 0.08, 0.5, '#6B4E2E'), cx + tx * K, 0.36, z, g); put(rbox(0.36, 0.03, 0.24, '#5A3A22', 0.01), cx + tx * K, 0.66, z, g); put(cyl(0.04, 0.035, 0.08, '#F4EFE6'), cx + tx * K + 0.18, 0.69, z + 0.12, g); }
      put(cyl(0.18, 0.16, 0.42, '#B5793A'), x, 0.31, z, g); room.spots.push({ x, z, rot: side > 0 ? -Math.PI / 2 : Math.PI / 2, sit: true, y: 0.06, busy: null }); }
    room.staffSpot = { x: cx + 0.5 * K, z: cz - 1.8 * K, rot: Math.PI, sit: false, y: 0 };
  },
  roda(g, cx, cz, room, K = 1) {
    const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.5 * K + 0.4, 1.5 * K + 0.4, 0.02, 32), mat('#FFD25E', { r: 1 })); rug.position.set(cx, 0.13, cz - 0.6 * K); g.add(rug);
    for (const [a, sit] of [[Math.PI * 0.75, true], [Math.PI * 1.25, true], [Math.PI * 1.0, true], [Math.PI * 1.6, true], [Math.PI * 0.45, true], [Math.PI * 1.85, true]].slice(0, seatsN(room)).concat([[Math.PI * 0.25, false]])) { const x = cx + Math.cos(a) * 1.1 * K, z = cz - 0.6 * K + Math.sin(a) * 1.1 * K; put(cyl(0.22, 0.2, 0.45, '#2E9E5B'), x, 0.33, z, g); if (sit) room.spots.push({ x, z, rot: -a + Math.PI / 2 + Math.PI, sit: true, y: 0.08, busy: null }); }
    put(cyl(0.25, 0.25, 0.5, '#E9785F'), cx, 0.35, cz - 0.6 * K, g); put(cyl(0.26, 0.26, 0.04, '#F4EFE6'), cx, 0.62, cz - 0.6 * K, g);
    const gt = grp(cx + 2.0 * K, cz - 2.3 * K, 0.4, g); put(rbox(0.5, 0.7, 0.15, '#A0794E', 0.15), 0, 0.5, 0, gt); put(rbox(0.1, 0.8, 0.05, '#5A3A22', 0.02), 0, 1.2, 0, gt);
    room.staffSpot = { x: cx + Math.cos(Math.PI * 0.25) * 1.1 * K, z: cz - 0.6 * K + Math.sin(Math.PI * 0.25) * 1.1 * K, rot: -Math.PI * 0.75, sit: true, y: 0.08 };
  },
  garage(g, cx, cz, room, K = 1) {
    const wb = grp(cx, cz - 2.6 * K, 0, g); put(rbox(2.6, 1.6, 0.12, '#8A6A45', 0.03), 0, 1.3, 0, wb); for (let i = 0; i < 6; i++) put(rbox(0.1, 0.5, 0.06, ['#C0C6CC', '#E9785F', '#FFD25E'][i % 3], 0.02, { m: 0.4 }), -1 + i * 0.4, 1.4, 0.1, wb);
    const tb = grp(cx, cz - 1.0 * K, 0, g); put(rbox(2.2, 0.1, 0.9, '#E3B341', 0.03), 0, 0.85, 0, tb); for (const sx of [-0.95, 0.95]) put(rbox(0.1, 0.8, 0.8, '#2F3A52', 0.02), sx, 0.42, 0, tb);
    put(rbox(0.7, 0.45, 0.05, '#2F3640', 0.02), -0.5, 1.15, -0.2, tb); put(rbox(0.6, 0.35, 0.02, '#BFE6F6', 0.01, { e: '#BFE6F6', ei: 0.5 }), -0.5, 1.15, -0.17, tb); put(rbox(0.5, 0.35, 0.4, '#C9A06B', 0.03), 0.6, 1.08, 0, tb);
    chair(g, cx, cz - 1.9 * K, 0, '#2F3A52'); chair(g, cx, cz - 0.1 * K, Math.PI, '#E3B341');
    room.staffSpot = { x: cx, z: cz - 1.9 * K, rot: 0, sit: true, y: 0.02 };
    room.spots.push({ x: cx, z: cz - 0.1 * K, rot: Math.PI, sit: true, y: 0.02, busy: null });
  },
  shop(g, cx, cz, room, K = 1) {
    const goods = ['#FF8FAB', '#FFD25E', '#7ACB4E', '#5AB8F0', '#B57BE8', '#E9785F', '#F4EFE6'];
    for (const [ox, oz] of [[-1.6, -2.5], [0.4, -2.5]]) { const sh = grp(cx + ox * K, cz + oz * K, 0, g); put(rbox(1.7, 1.6, 0.45, '#F4EFE6', 0.04), 0, 0.9, 0, sh); for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) put(rbox(0.22, 0.3, 0.25, goods[(i + r * 2 + Math.round(ox)) % goods.length], 0.03), -0.6 + i * 0.3, 0.45 + r * 0.48, 0.12, sh); }
    const fr = grp(cx + 2.2 * K, cz - 2.3 * K, 0, g); put(rbox(0.9, 1.9, 0.6, '#FFFFFF', 0.05), 0, 1.05, 0, fr); put(rbox(0.75, 1.6, 0.04, '#BFE6F6', 0.02, { e: '#BFE6F6', ei: 0.4 }), 0, 1.05, 0.31, fr); for (let i = 0; i < 4; i++) put(cyl(0.06, 0.06, 0.22, ['#7ACB4E', '#FFD25E'][i % 2]), -0.2 + (i % 2) * 0.35, 0.6 + Math.floor(i / 2) * 0.6, 0.15, fr);
    const till = grp(cx + 1.2 * K, cz + 0.6 * K, -Math.PI / 2, g); put(rbox(1.6, 0.95, 0.6, '#E9785F', 0.06), 0, 0.57, 0, till); put(rbox(0.4, 0.3, 0.3, '#2F3640', 0.03), 0.4, 1.2, 0, till);
    room.staffSpot = { x: cx + 1.8 * K, z: cz + 0.6 * K, rot: -Math.PI / 2, sit: false, y: 0 };
    for (const [ox, oz, rot] of [[-1.6, -1.6, Math.PI], [0.4, -1.6, Math.PI], [2.2, -1.5, Math.PI], [-0.6, -1.6, Math.PI]].slice(0, seatsN(room))) room.spots.push({ x: cx + ox * K, z: cz + oz * K, rot, sit: false, y: 0, busy: null });
  },
  staffroom(g, cx, cz, room, K = 1) {
    const so = grp(cx - 0.6 * K, cz - 1.8 * K, 0, g); put(rbox(2.4, 0.42, 0.85, '#FFB067', 0.15), 0, 0.32, 0, so); put(rbox(2.4, 0.6, 0.25, '#FFB067', 0.1), 0, 0.68, -0.33, so); glbSwap(so, 'sofa', { len: 2.5, h: 1.0, y: 0.12 });
    for (const ox of [-0.7, 0.7]) room.spots.push({ x: cx - 0.6 * K + ox, z: cz - 1.75 * K, rot: 0, sit: true, y: 0.05, busy: null });
    const tb = grp(cx - 0.6 * K, cz - 0.6 * K, 0, g); put(cyl(0.45, 0.45, 0.06, '#FFFFFF'), 0, 0.55, 0, tb); put(cyl(0.06, 0.06, 0.5, '#7A8088'), 0, 0.28, 0, tb); put(cyl(0.07, 0.06, 0.14, '#E9785F'), 0.1, 0.65, 0, tb);
    const cm = grp(cx + 1.9 * K, cz - 2.2 * K, 0, g); put(rbox(0.9, 1.0, 0.6, '#2F3A52', 0.06), 0, 0.6, 0, cm); put(rbox(0.5, 0.4, 0.5, '#C0C6CC', 0.05, { m: 0.5, r: 0.3 }), 0, 1.3, 0, cm); glbSwap(cm, 'kitchenette', { len: 1.4, y: 0.1 });
    const nb = seatsN(room) - 2; for (const [bx, bz, br, bc] of [[1.4, 0.6, -Math.PI * 0.75, '#7ACB4E'], [-1.6, 1.0, Math.PI * 0.75, '#FFB067']].slice(0, nb)) { const bb = sph(0.5, bc); bb.scale.set(1, 0.6, 1); put(bb, cx + bx * K, 0.35, cz + bz * K, g); room.spots.push({ x: cx + bx * K, z: cz + bz * K, rot: br, sit: true, y: 0, busy: null }); }
  },
  toilet(g, cx, cz, room, K = 1) {
    const n = room.sz ? { s: 2, m: 4, l: 3 }[room.sz] : K < 0.8 ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const x = cx + (i - (n - 1) / 2) * 1.25;
      if (!PROPS_ON) put(rbox(0.06, 1.5, 1.1, '#FFFFFF', 0.02), x + 0.6, 0.85, cz - 0.9 * K - 0.25, g); // the modelled cubicle brings its own walls
      const wc = grp(x, cz - 0.9 * K - 0.55, 0, g); put(rbox(0.42, 0.42, 0.5, '#FFFFFF', 0.12, { r: 0.25 }), 0, 0.3, 0.05, wc); put(rbox(0.45, 0.45, 0.16, '#F4F7FA', 0.05), 0, 0.6, -0.2, wc); glbSwap(wc, 'toilet', { y: 0.1 });
      put(rbox(0.9, 1.2, 0.05, ['#5AB8F0', '#FF8FAB', '#7ACB4E'][i % 3], 0.02), x, 0.75, cz - 0.9 * K + 0.32, g).visible = false;
      room.spots.push({ x, z: cz - 0.9 * K - 0.5, rot: 0, sit: true, y: 0.1, busy: null });
    }
    const sk = grp(cx + 1.2 * K, cz + 1.4 * K, -Math.PI / 2, g); put(rbox(1.2, 0.8, 0.5, '#FFFFFF', 0.06), 0, 0.5, 0, sk); put(rbox(0.9, 0.6, 0.04, '#BFE6F6', 0.02, { e: '#BFE6F6', ei: 0.4 }), 0, 1.5, -0.22, sk);
  },
  lab(g, cx, cz, room, K = 1) {
    const d = grp(cx - 0.4 * K, cz - 1.2 * K, 0, g);
    put(rbox(2.6, 0.12, 1.0, '#FFFFFF', 0.05), 0, 0.9, 0, d); put(rbox(2.5, 0.8, 0.9, '#C9D6E3', 0.05), 0, 0.46, 0, d);
    put(cyl(0.12, 0.16, 0.5, '#3B4A6B'), -0.8, 1.2, -0.1, d); put(cyl(0.05, 0.05, 0.35, '#3B4A6B'), -0.8, 1.55, 0.05, d);
    ['#7ACB4E', '#FF8FAB', '#5AB8F0', '#FFD25E'].forEach((col, i) => put(cyl(0.05, 0.05, 0.28, col, { op: 0.8 }), 0.2 + i * 0.16, 1.1, 0.15, d));
    put(rbox(0.8, 0.5, 0.06, '#2F3640', 0.03), 0.6, 1.3, -0.3, d); put(rbox(0.7, 0.4, 0.02, '#BFE6F6', 0.01, { e: '#BFE6F6', ei: 0.5 }), 0.6, 1.3, -0.26, d);
    chair(g, cx - 0.4 * K, cz - 2.2 * K, 0, '#5AB8F0');
    const board = grp(cx + 2.2 * K, cz - 2.95 * K, 0, g); put(rbox(1.6, 1.1, 0.06, '#FFFFFF', 0.03), 0, 1.6, 0, board);
    for (let i = 0; i < 4; i++) put(rbox(0.25, 0.25, 0.02, ['#FFD25E', '#FF8FAB', '#7ACB4E', '#5AB8F0'][i], 0.01), -0.5 + i * 0.33, 1.65, 0.04, board);
    room.staffSpot = { x: cx - 0.4 * K, z: cz - 2.2 * K, rot: 0, sit: true, y: 0.02 };
  },
};

// ---------------- staff ----------------
function makeCandidate(role) {
  const r = ROLES[role]; const traits = [];
  const pool = TRAITS.slice().sort(() => Math.random() - 0.5);
  traits.push(pool.find((x) => x.t === 'good').n);
  traits.push(pool.find((x) => !traits.includes(x.n)).n);
  if (Math.random() < 0.4) { const f = pool.find((x) => x.t === 'fun' && !traits.includes(x.n)); if (f) traits.push(f.n); }
  const skill = 1 + Math.floor(Math.random() * 5);
  let wage = Math.round((r.wage[0] + (r.wage[1] - r.wage[0]) * (skill - 1) / 4 + Math.random() * 80) / 10) * 10;
  if (traits.includes('Always on LinkedIn')) wage = Math.round(wage * 1.1 / 10) * 10;
  return { id: 0, role, name: crnd(FIRST) + ' ' + crnd(LAST), skill, wage, traits,
    look: { skin: crnd(SKIN), hair: crnd(HAIR.slice(0, 7)), style: crnd(STYLES.filter((s) => s !== 'beanie')), tall: 0.9 + Math.random() * 0.25, wide: 0.9 + Math.random() * 0.25, glasses: Math.random() < 0.35, nose: Math.random() < 0.4 } };
}
function staffLook(st) {
  const r = ROLES[st.role], L = { ...st.look, role: st.role, shirt: r.uni, pants: r.pants, shoes: '#F4EFE6' };
  if (st.role === 'host') Object.assign(L, { apron: true, lanyard: true, headset: true });
  if (st.role === 'coach') Object.assign(L, { lanyard: true, inner: '#F4EFE6' });
  if (st.role === 'guide') Object.assign(L, { mat: true, shoes: '#8B6A45' });
  if (st.role === 'maint') Object.assign(L, { cap: '#E9785F', belt: true, inner: '#F4EFE6', shoes: '#8B6A45' });
  if (st.role === 'pharmacist') Object.assign(L, { coat: true, shirt: '#2BB5A6', inner: '#2BB5A6', lanyard: true, glasses: true });
  if (st.role === 'therapist') Object.assign(L, { inner: '#F4EFE6', clip: true, shoes: '#8B6A45' });
  if (st.role === 'researcher') Object.assign(L, { coat: true, shirt: '#5AB8F0', inner: '#5AB8F0', goggles: true, lanyard: true });
  return L;
}
const energyF = (rs) => ((rs.data.energy ?? 1) < 0.25 ? 0.6 : 1) * (rs.data.sadT > 0 ? 0.7 : 1);
function traitVal(st, key, def = 1) { let v = def; for (const n of st.traits) { const x = TRAITS.find((y) => y.n === n); if (x && x[key] != null) v *= x[key]; } return v; }
function spawnStaffAvatar(st) {
  const av = person(staffLook(st), 'staff'); av.position.set(3, 0.1, 11); scene.add(av);
  const rs = { data: st, av, at: null, path: [], ph: 0, mode: 'walk', task: null, work: 0 };
  R.staff.push(rs); return rs;
}
const MAINT_HOME = (i) => ({ x: 5.9 - i * 0.6, z: 1.0, rot: Math.PI / 4, sit: false, y: 0 });
function assignStaff() {
  for (const rs of R.staff) if (rs.at != null && !['desk', 'idle', 'maint'].includes(rs.at) && (!R.rooms[rs.at] || R.rooms[rs.at].staff[rs.st] !== rs)) rs.at = null;
  desks().forEach((_, di) => { if (deskHost(di)) return; const h = R.staff.find((rs) => rs.data.role === 'host' && (!rs.at || rs.at === 'idle')); if (h) { h.at = 'desk'; h.desk = di; goStaff(h, deskSpot(di)); } });
  for (const room of Object.values(R.rooms)) {
    if (!ROOMS[room.type].role) continue;
    room.staff.forEach((s, i) => {
      if (s && R.staff.includes(s) && s.at === room.id && s.st === i) return;
      room.staff[i] = null;
      const c = R.staff.find((rs) => rs.data.role === ROOMS[room.type].role && (rs.at == null || rs.at === 'idle'));
      if (c && room.staffSpots[i]) { c.at = room.id; c.st = i; room.staff[i] = c; goStaff(c, room.staffSpots[i]); }
    });
  }
  let i = 0, m = 0;
  for (const rs of R.staff) {
    if (rs.data.role === 'maint' && (rs.at == null || rs.at === 'idle')) { rs.at = 'maint'; rs.home = MAINT_HOME(m++); goStaff(rs, rs.home); continue; }
    if (rs.at == null) { rs.at = 'idle'; goStaff(rs, { x: 5.6 - i * 0.7, z: 1.6, rot: Math.PI / 4, sit: false, y: 0 }); i++; }
  }
}
const angW = (a) => ((a % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
function turnTo(av, want, dt, k = 6) { av.rotation.y = angW(av.rotation.y + angW(want - av.rotation.y) * Math.min(1, dt * k)); }
// who this staff member is serving right now (desk: the visitor checking in; room: the visitor on one of their spots)
function patientOf(rs) {
  if (rs.at === 'desk') return R.visitors.find((u) => u.state === 'checkin' && (u.desk || 0) === (rs.desk || 0)) || null;
  return R.visitors.find((u) => u.room === rs.at && u.rspot && u.rspot.st === rs.st && (u.state === 'treat' || u.state === 'toRoom')) || null;
}
function staffAttend(rs, dt) {
  if (rs.data.role === 'maint' || !rs.target) return;
  const p = rs.av.userData.p, base = rs.target.rot || 0, sit = !!rs.target.sit, v = patientOf(rs);
  let want = base;
  if (v) { const dx = v.av.position.x - rs.av.position.x, dz = v.av.position.z - rs.av.position.z; if (dx * dx + dz * dz > 0.04) { const d = angW(Math.atan2(dx, dz) - base); want = base + (sit ? clamp(d, -0.7, 0.7) : d); } }
  turnTo(rs.av, want, dt, 5);
  const busy = !!v && (v.state === 'treat' || v.state === 'checkin'); // talk only when someone is actually in front of them
  if (busy !== rs.busyPose) { rs.busyPose = busy; if (busy) poseWork(p, sit); else if (sit) poseSit(p); else poseStand(p); }
  if (!sit && !busy) p.body.position.y = Math.sin(performance.now() / 400 + rs.data.id) * 0.015;
}
function goStaff(rs, spot) { rs.target = spot; rs.path = findPath(rs.av.position, spot); rs.mode = 'walk'; poseStand(rs.av.userData.p); }
// Maintenance: rats first, then mess, then (during a Wi-Fi outage) the router; when all is clean she does her rounds —
// waters the plants, checks the router, walks the floor — instead of standing in a corner.
function routerMesh() {
  if (world.router && world.router.parent) return world.router;
  const g = grp(4.2, 0.62, 0); g.position.y = 1.45; put(rbox(0.42, 0.1, 0.26, '#F4F2EE', 0.03), 0, 0, 0, g);
  for (const x of [-0.14, 0.14]) put(cyl(0.015, 0.015, 0.26, '#2F3640'), x, 0.16, -0.06, g);
  const led = sph(0.03, '#3BD16F', { e: '#3BD16F', ei: 1 }); put(led, 0.12, 0.03, 0.14, g); g.userData.led = led; world.router = g; return g;
}
function maintChores(rs) {
  const out = [], P = (x, z) => ({ position: { x, z } });
  for (const [x, z] of [[6.1, 2.6], [1.0, 6.0], [2.6, 1.0]]) out.push({ kind: 'chore', what: 'water', obj: { mesh: P(x, z) } });
  for (const d of S.decor || []) if (d.k === 'plant') out.push({ kind: 'chore', what: 'water', obj: { mesh: P(d.x, d.z) } });
  out.push({ kind: 'chore', what: 'router', obj: { mesh: P(4.2, 0.62) } });
  for (let k = 0; k < 3; k++) { const x = 1 + Math.random() * 5, z = 1.5 + Math.random() * 5; out.push({ kind: 'chore', what: 'patrol', obj: { mesh: P(x, z) } }); }
  return out.filter((c) => c.obj.mesh.position !== (rs.lastChore && rs.lastChore.obj.mesh.position) && !(rs.lastChore && rs.lastChore.what === c.what && c.what !== 'water'));
}
function maintGo(rs, tg) {
  rs.goingTo = tg; rs.target = tg.what === 'patrol' ? { x: tg.obj.mesh.position.x, z: tg.obj.mesh.position.z, rot: Math.random() * 6.28, sit: false, y: 0 } : cleanSpot(tg.obj.mesh.position, rs.av.position);
  rs.path = findPath(rs.av.position, rs.target); rs.mode = 'walk'; poseStand(rs.av.userData.p);
}
function maintUpdate(rs, dt) {
  const mess = R.rats.length || R.litter.length, wifiDown = S.ev && S.ev.k === 'wifi';
  { const r = routerMesh(); r.userData.led.material.color.set(wifiDown ? '#FF4B4B' : '#3BD16F'); }
  if (rs.mode === 'walk') { // already heading somewhere; a chore gives way to real mess or a broken router
    if (rs.goingTo && rs.goingTo.kind === 'chore' && (mess || (wifiDown && rs.goingTo.what !== 'router'))) { rs.goingTo = null; rs.mode = 'free'; }
    else return;
  }
  if (rs.task) {
    const p = rs.av.userData.p, ch = rs.task.kind === 'chore';
    rs.work -= dt * boost() * energyF(rs);
    if (p.anim) p.anim.set(ch ? (rs.task.what === 'patrol' ? 'idle' : 'work') : 'clean');
    if (!p.anim) { rs.ph += dt * 10; p.arms[1].rotation.x = -1 + Math.sin(rs.ph) * 0.5; }
    if (ch && mess && rs.task.what !== 'router') rs.work = 0; // drop the watering can, there's a mess
    if (rs.work <= 0) {
      if (ch) { if (rs.task.what === 'router' && wifiDown) { endEvent(); chat(rs.data.name + ' · ' + roleN('maint'), t('maint.wifi'), '📶'); } rs.lastChore = rs.task; rs.restT = 1 + Math.random() * 2; }
      else {
        const o = rs.task.obj; scene.remove(o.mesh);
        const list = rs.task.kind === 'rat' ? R.rats : R.litter; const ix = list.indexOf(o); if (ix >= 0) list.splice(ix, 1);
        if (rs.task.kind === 'rat') { S.st = S.st || { prob: {}, room: {}, staff: {}, acc: 0, rats: 0, vip: 0 }; S.st.chased = (S.st.chased || 0) + 1; }
        if (rs.task.kind === 'rat' && Math.random() < 0.5) chat(rs.data.name + ' · ' + roleN('maint'), t('maint.chat'), '🧹');
      }
      rs.task = null; poseStand(rs.av.userData.p); rs.mode = 'free';
    }
    return;
  }
  if (rs.goingTo) { // just arrived
    const g = rs.goingTo; rs.goingTo = null;
    if (g.kind !== 'chore' && !R.rats.includes(g.obj) && !R.litter.includes(g.obj)) return;
    rs.task = g; rs.work = g.kind === 'rat' ? 2.5 : g.kind === 'chore' ? (g.what === 'router' ? (wifiDown ? 6 : 2.5) : g.what === 'water' ? 3 : 1.8) : g.obj.heavy ? 4 : 2.6; return;
  }
  const claimed = new Set(R.staff.filter((x) => x.task || x.goingTo).map((x) => (x.task || x.goingTo).obj));
  const targets = R.rats.map((o) => ({ kind: 'rat', obj: o })).concat(R.litter.map((o) => ({ kind: 'litter', obj: o }))).filter((x) => !claimed.has(x.obj));
  if (targets.length) {
    const p = rs.av.position; targets.sort((a, b) => Math.hypot(a.obj.mesh.position.x - p.x, a.obj.mesh.position.z - p.z) - Math.hypot(b.obj.mesh.position.x - p.x, b.obj.mesh.position.z - p.z));
    maintGo(rs, targets[0]); return;
  }
  if (wifiDown && !R.staff.some((x) => x !== rs && ((x.task && x.task.what === 'router') || (x.goingTo && x.goingTo.what === 'router')))) { maintGo(rs, { kind: 'chore', what: 'router', obj: { mesh: { position: { x: 4.2, z: 0.62 } } } }); return; }
  if (rs.mode !== 'free') return;
  if ((rs.restT = (rs.restT || 0) - dt) > 0) return; // short breather between chores
  const ch = maintChores(rs); if (ch.length) maintGo(rs, rnd(ch));
}
// where to stand to clean something: a free cell next to it (never inside a wall or furniture), facing it
function cleanSpot(o, from) {
  let best = null, bd = 1e9;
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + Math.PI / 4, x = o.x + Math.sin(a) * 0.45, z = o.z + Math.cos(a) * 0.45, [i, j] = ci(x, z);
    if (!free(gridBlk, i, j) || !reach(gridBlk, from, { x, z })) continue; const d = Math.hypot(x - from.x, z - from.z); if (d < bd) { bd = d; best = { x, z }; } }
  if (!best) best = { x: o.x, z: o.z };
  return { x: best.x, z: best.z, rot: Math.atan2(o.x - best.x, o.z - best.z), sit: false, y: 0 };
}

// ---------------- visitors ----------------
// Reception desks: desk 0 is the lobby desk (S.desk); extra desks (S.desks2) can be built anywhere on the floor. Each has its own queue and host.
// The lobby desk can be lengthened into a double counter (two hosts side by side, two lines) instead of building a second desk.
const DESK_HALF = 0.85; // each station sits this far from the centre of a double counter
function seatDesk(i) { const D = S.desk, sg = D.segs[i], sx = (i ? 1 : -1) * DESK_HALF, o = { x: D.x + sx * Math.cos(D.r), z: D.z - sx * Math.sin(D.r), r: D.r }; Object.defineProperty(o, 'lv', { get: () => sg.lv || 1, set: (v) => { sg.lv = v; }, enumerable: true }); return o; }
const deskBase = () => (S.desk && S.desk.segs ? 2 : 1);
const desks = () => (S.desk.segs ? [seatDesk(0), seatDesk(1)] : [S.desk]).concat(S.desks2 || []);
const DQ = (di = 0) => (R.deskQs[di] || (R.deskQs[di] = []));
const allQ = () => R.deskQs.reduce((a, q) => a + q.length, 0);
const deskHost = (di = 0, there) => R.staff.find((rs) => rs.at === 'desk' && (rs.desk || 0) === di && (!there || rs.mode === 'there'));
function deskF(di = 0) { const D = desks()[di] || S.desk; return { x: Math.sin(D.r), z: Math.cos(D.r) }; }
function deskSpot(di = 0) { const D = desks()[di] || S.desk, f = deskF(di); return { x: D.x - f.x * 0.78, z: D.z - f.z * 0.78, rot: D.r, sit: false, y: 0 }; }
function QUEUE(i, di = 0) { const D = desks()[di] || S.desk, f = deskF(di); const k = di ? i : Math.min(i, 2); const b = { x: D.x + f.x * (0.95 + k * 0.72), z: D.z + f.z * (0.95 + k * 0.72) }; if (!di && i > 2) b.z += (i - 2) * 0.72; if (i > 0) { b.x += Math.sin(i * 2.7) * 0.16; b.z += Math.cos(i * 1.9) * 0.08; } return b; } // a loose line, not a parade
function deskMesh() { const m = world.desk.clone(true); m.traverse((o) => { if (o.isMesh) o.userData.desk = true; }); m.children.forEach((c) => { if (c === world.deskRing || c.geometry && c.geometry.type === 'RingGeometry') c.visible = false; }); scene.add(m); return m; }
function placeDesk() {
  const D = S.desk; world.desk.position.set(D.x, 0, D.z); world.desk.rotation.y = D.r; world.desk.scale.x = D.segs ? 1.5 : 1;
  world.desks2 = world.desks2 || []; while (world.desks2.length > (S.desks2 || []).length) scene.remove(world.desks2.pop());
  (S.desks2 || []).forEach((E, i) => { const m = world.desks2[i] || (world.desks2[i] = deskMesh()); m.position.set(E.x, 0, E.z); m.rotation.y = E.r; m.userData.di = i + deskBase(); });
  if (S.rooms) rebuildGrid();
  const hs = deskSpot(), q0 = QUEUE(0);
  const extra = D.segs ? [deskSpot(1), QUEUE(0, 1), QUEUE(1, 1)] : [];
  for (const s of WAIT_SPOTS) s.blocked = Math.hypot(s.x - D.x, s.z - D.z) < (D.segs ? 2.0 : 1.5) || Math.hypot(s.x - hs.x, s.z - hs.z) < 0.8 || Math.hypot(s.x - q0.x, s.z - q0.z) < 0.8 || extra.some((e) => Math.hypot(s.x - e.x, s.z - e.z) < 0.8);
}
const WAIT_SPOTS = [
  { x: 1.3, z: 3.4, rot: Math.PI / 2, sit: true, y: 0.02 }, { x: 1.3, z: 4.2, rot: Math.PI / 2, sit: true, y: 0.02 }, { x: 1.3, z: 5.0, rot: Math.PI / 2, sit: true, y: 0.02 },
  { x: 2.4, z: 2.0, rot: Math.PI / 4 }, { x: 3.2, z: 2.0, rot: Math.PI / 4 }, { x: 4.0, z: 2.0, rot: Math.PI / 4 }, { x: 4.8, z: 2.0, rot: Math.PI / 4 },
  { x: 2.4, z: 2.8, rot: Math.PI / 4 }, { x: 3.4, z: 3.4, rot: Math.PI / 4 }, { x: 2.8, z: 4.6, rot: Math.PI / 4 }, { x: 3.8, z: 4.4, rot: Math.PI / 4 }, { x: 2.0, z: 5.6, rot: Math.PI / 4 },
].map((s) => ({ ...s, busy: null, sit: !!s.sit, y: s.y || 0 }));
const iconCache = {};
function iconTex(e) {
  if (iconCache[e]) return iconCache[e];
  const tx = canvasTex(96, 96, (g) => { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(48, 48, 44, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#14213D'; g.stroke(); g.font = '52px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, 48, 52); });
  return (iconCache[e] = new THREE.SpriteMaterial({ map: tx, depthTest: false }));
}
const barBg = new THREE.SpriteMaterial({ color: '#14213D', depthTest: false }), barFg = {};
function barMat(c) { return barFg[c] || (barFg[c] = new THREE.SpriteMaterial({ color: c, depthTest: false })); }
let spawnKid = false, famNext = false; // kids never come alone: they follow a parent (famNext)
function spawnVisitor(prob, em, vip, look0) {
  if (!prob && S.ad && S.ad.room && RNG() < 0.5) prob = rnd(Object.keys(PROBLEMS).filter((k) => PROBLEMS[k].room === S.ad.room));
  if (!prob && unlocked('lab') && S.mode === 'career' && RNG() < 0.12) prob = rnd(Object.keys(PROBLEMS).filter((k) => PROBLEMS[k].myst && unlocked(PROBLEMS[k].room)));
  const cityOk = (k) => !PROBLEMS[k].city || PROBLEMS[k].city === (S.city || 'london');
  if (!prob) { const pool = Object.keys(PROBLEMS).filter((k) => !PROBLEMS[k].myst && !PROBLEMS[k].fam && cityOk(k) && unlocked(PROBLEMS[k].room)); const w = pool.map((k) => (hasRoom(PROBLEMS[k].room) ? 3 : 1) * (PROBLEMS[k].city ? (cityOf().sig === k ? 4 : 2) : 1)); let r = RNG() * w.reduce((a, b) => a + b, 0); prob = pool[pool.length - 1]; for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) { prob = pool[i]; break; } } }
  const vm = look0 ? null : pickVis(spawnKid, PROBLEMS[prob] && PROBLEMS[prob].room === 'nap');
  const look = look0 || { vm, kid: famNext || ['toddler', 'schoolrun', 'tablet', 'homework', 'sugar'].includes(prob) ? pickVis(true) || 'v25' : null, skin: rnd(SKIN), hair: rnd(HAIR), style: rnd(STYLES), shirt: rnd(SHIRTS), pants: rnd(['#3B4A6B', '#2F3A52', '#5E6B3A', '#7A5A3A', '#2A2A2E', '#8A9AB0']), tall: 0.85 + RNG() * 0.35, wide: 0.85 + RNG() * 0.4, glasses: RNG() < 0.25, nose: RNG() < 0.5, shoes: rnd(['#2A2A2E', '#F4EFE6', '#E9785F']) };
  if (look0 && !look0.vm) look0.vm = pickVis(false, PROBLEMS[prob] && PROBLEMS[prob].room === 'nap'); // visitors from older saves
  if (look.vm && VIS[look.vm]) { look.tall = VIS[look.vm].h / 1.75; look.wide = 1; look.male = VIS_MALE.has(look.vm); look.style2 = styleFor(prob); }
  if (look.vm && !CHAR.A.full[look.vm]) loadFull(look.vm);
  const av = person(look, 'visitor'); av.position.set(1 + Math.random() * 4, 0.1, 12.2); scene.add(av); av.userData.p.waitPose = RNG() < 0.55 ? 'phone' : 'idle';
  const hud = new THREE.Group(); scene.add(hud);
  const icon = new THREE.Sprite(iconTex(em ? '🚨' : '❔')); icon.scale.set(0.55, 0.55, 1); icon.position.set(0, 2.15 * look.tall, 0); icon.renderOrder = 10; hud.add(icon);
  const bg = new THREE.Sprite(barBg); bg.center.set(0, 0.5); bg.scale.set(0.64, 0.1, 1); bg.position.set(-0.226, 1.82 * look.tall, 0.226); bg.renderOrder = 11; hud.add(bg);
  const fg = new THREE.Sprite(barMat('#7ACB4E')); fg.center.set(0, 0.5); fg.scale.set(0.6, 0.06, 1); fg.position.set(-0.212, 1.82 * look.tall, 0.212); fg.renderOrder = 12; hud.add(fg);
  const gag = addGag(av, prob, look);
  const v = { gag, id: S.nextId++, name: rnd(CITY_NAMES[S.city] && RNG() < 0.75 ? CITY_NAMES[S.city] : FIRST), age: 19 + Math.floor(RNG() * 22), prob, known: false, av, hud, icon, bg, fg, pat: 1, prog: 0, state: 'toQueue', path: [], ph: Math.random() * 6, spot: null, room: null, look, em: !!em };
  if (vip) { v.vip = true; v.name = '@' + crnd(['glowwithjade', 'kaivibes', 'lunchbreaklena', 'mainchar.mo', 'softlifesam']); const cr = new THREE.Sprite(iconTex('👑')); cr.scale.set(0.45, 0.45, 1); cr.position.set(0.35, 2.5 * look.tall, -0.35); cr.renderOrder = 10; hud.add(cr); }
  if (em) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.08, 8, 32), mat('#FF2D2D', { e: '#FF2D2D', ei: 1.5 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.06; hud.add(ring); v.emRing = ring; const sb = new THREE.Sprite(iconTex('🚨')); sb.scale.set(0.42, 0.42, 1); sb.position.set(-0.4, 2.45 * look.tall, 0.4); sb.renderOrder = 10; hud.add(sb); v.prio = true; }
  R.visitors.push(v); if (!wavePending) behSpawn(v); if (!em && beh('nolines') && ['grind', 'rentshock'].includes(prob) && DQ(0).length >= 6 && desks().length <= 1) { behSeen('nolines'); floatAt(v.av.position, '🙅 nope'); joinQueue(v); leave(v, false); return v; } if (em) { finishCheckin(v, true); return v; } joinQueue(v); return v;
}

function addGag(av, prob, look) {
  const gg = new THREE.Group(); av.add(gg); const top = 2.55 * (look.tall || 1);
  if (prob === 'gloom' || prob === 'lowmood') { for (const [x, z, r] of [[0, 0, 0.2], [0.18, 0.02, 0.15], [-0.18, 0.02, 0.15]]) put(sph(r, '#8E99A8'), x, top + 0.1, z, gg); for (let i = 0; i < 3; i++) put(cyl(0.015, 0.015, 0.15, '#5AB8F0'), -0.12 + i * 0.12, top - 0.15, 0, gg); }
  if (prob === 'burn') { const f = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 10), mat('#FF7A2E', { e: '#FF7A2E', ei: 1.2 })); put(f, 0, top - 0.05, 0, gg); }
  if (prob === 'ghosted') { const gh = new THREE.Group(); put(sph(0.16, '#FFFFFF', { op: 0.85 }), 0, 0.15, 0, gh); const c = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.25, 12), mat('#FFFFFF', { op: 0.85 })); c.rotation.x = Math.PI; put(c, 0, -0.02, 0, gh); gh.position.set(0.55, 1.6, 0); gg.add(gh); }
  if (prob === 'overthink') { const r = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 16), mat('#B57BE8', { e: '#B57BE8', ei: 0.6 })); r.rotation.x = Math.PI / 2; put(r, 0, top - 0.1, 0, gg); }
  if (prob === 'moving') put(rbox(0.5, 0.38, 0.38, '#C9A06B', 0.03), 0, 1.0, 0.36, gg);
  const wantKid = look.kid || prob === 'toddler' || prob === 'schoolrun';
  if (wantKid && av.userData.p.glb) { const kk = ['v25', 'v26', 'v27', 'v28'].filter((k) => CHAR.A.full[k]); if (kk.length) { const key = CHAR.A.full[look.kid] ? look.kid : kk[(look.vm || 'v').charCodeAt(2) % kk.length]; const kid = person({ vm: key }, 'visitor'); kid.position.set(0.6, 0, 0.15); av.add(kid); kid.traverse((m) => { if (m.isMesh) m.userData.owner = av; }); gg.userData.kid = kid; return gg; } }
  if (wantKid) { const kid = person({ skin: look.skin, hair: crnd(HAIR.slice(0, 5)), style: crnd(['short', 'curly', 'bun']), shirt: crnd(SHIRTS), pants: '#5AB8F0', tall: 0.55, wide: 0.75, shoes: '#E9785F' }); kid.scale.setScalar(0.62); kid.position.set(0.55, 0, 0.1); av.add(kid); kid.traverse((m) => { if (m.isMesh) m.userData.owner = av; }); if (prob === 'schoolrun') put(rbox(0.3, 0.35, 0.15, '#E9785F', 0.05), 0, 0.95, -0.22, kid.userData.p.body); }
  return gg;
}
function finishCheckin(v, quiet) {
  v.known = true; probSeen(v.prob); v.icon.material = iconTex(isMystK(v.prob) ? '❓' : PROBLEMS[v.prob].e); for (const q of R.deskQs) { const qi = q.indexOf(v); if (qi >= 0) q.splice(qi, 1); }
  if (!quiet && isMystK(v.prob)) { S.mystSeen = S.mystSeen || []; if (!S.mystSeen.includes(v.prob)) { S.mystSeen.push(v.prob); chat(t('research.title'), t('myst.chat'), '❓'); } }
  if (!quiet && hasRoom('cafe')) { const tip = done('oat') ? 12 : 8; S.cash += tip; S.earned += tip; v.spent = (v.spent || 0) + tip; }
  v.target = pickRoomFor(v); seatVisitor(v);
}
function seatVisitor(v) {
  const spot = WAIT_SPOTS.find((s) => !s.busy && !s.blocked); v.prog = 0;
  if (spot) { spot.busy = v; v.spot = spot; setPath(v, findPath(v.av.position, spot)); }
  else { v.spot = { x: 2 + Math.random() * 3, z: 7.2 + Math.random(), rot: Math.PI, sit: false, y: 0, busy: v }; setPath(v, [v.spot]); }
  v.state = 'toWait';
}
const needOf = (v) => (isMystK(v.prob) ? null : PROBLEMS[v.prob].room);
function roomQ(id) { return R.visitors.filter((v) => v.target === id && (v.state === 'wait' || v.state === 'toWait')); }
function pickRoomFor(v) { const need = needOf(v); if (!need) return null; const rs = Object.values(R.rooms).filter((r) => r.type === need); if (!rs.length) return null; rs.sort((a, b) => (roomQ(a.id).length - a.spots.length) - (roomQ(b.id).length - b.spots.length)); return rs[0].id; }
function roomNo(room) { const same = S.rooms.filter((r) => r.type === room.type); return same.length > 1 ? ' #' + (same.findIndex((r) => r.id === room.id) + 1) : ''; }
function splitQueue(id) {
  const room = R.rooms[id]; if (!room) return 0; const others = Object.values(R.rooms).filter((r) => r.type === room.type && r.id !== id); if (!others.length) return 0;
  const q = roomQ(id), n = Math.floor(q.length / 2); let moved = 0;
  for (const v of q.slice(q.length - n)) { others.sort((a, b) => roomQ(a.id).length - roomQ(b.id).length); v.target = others[0].id; moved++; }
  return moved;
}
function joinQueue(v) { // shortest staffed line wins
  let di = 0, best = 1e9; desks().forEach((_, k) => { const sc = DQ(k).length + (deskHost(k) ? 0 : 50) + (k ? 0.5 : 0); if (sc < best) { best = sc; di = k; } });
  v.desk = di; DQ(di).push(v); const q = QUEUE(DQ(di).length - 1, di); setPath(v, findPath(v.av.position, q)); v.state = 'toQueue'; }
function setPath(v, pts) { v.path = pts.slice(); poseStand(v.av.userData.p); }
let doomers = [];
function stepWalker(o, dt, speed) {
  if (!o.path.length) return true;
  // match ground speed to the character's own stride so feet don't skate: a slow tired shuffle moves slowly, a hurry only speeds the legs up so far
  const an = o.av.userData.p.anim, nw = an && an.stride ? an.stride() : 0;
  if (nw) speed = Math.min(speed * clamp(nw / 1.25, 0.5, 1.3), nw * (speed > 2.6 ? 2.2 : 1.9));
  if (doomers.length && !doomers.includes(o)) for (const u of doomers) if (Math.hypot(u.av.position.x - o.av.position.x, u.av.position.z - o.av.position.z) < 0.8) { speed *= 0.45; break; } // stuck behind someone staring at their phone
  const p = o.path[0], pos = o.av.position;
  const dx = p.x - pos.x, dz = p.z - pos.z, d = Math.hypot(dx, dz), step = speed * dt;
  if (d <= step) { pos.x = p.x; pos.z = p.z; o.path.shift(); } else { pos.x += dx / d * step; pos.z += dz / d * step; }
  if (d > 0.001) { const a = Math.atan2(dx, dz); let r = o.av.rotation.y; r += ((((a - r) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 10); o.av.rotation.y = ((r + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; }
  o.ph += dt * speed * 4.2; poseWalk(o.av.userData.p, o.ph, 0.55, speed); pos.y = 0.1;
  return !o.path.length;
}
function settle(o, spot) { o.av.position.set(spot.x, 0.1 + (spot.y || 0), spot.z); o.av.rotation.y = spot.rot || 0; const p = o.av.userData.p; poseStand(p); if (spot.sit) { poseSit(p, spot.lie); o.av.position.y -= 0.05; } }
const hasRoom = (type) => S.rooms.some((r) => r.type === type);
const POWER = { s: 20, m: 35, l: 55 }, POWER_X = { lab: 40, cafe: 20, glowup: 10, toilet: -10 };
function elecPerDay() { let e = 0; for (const r of S.rooms) e += POWER[r.size] + (POWER_X[r.type] || 0); if (S.ac) e += 30; if (S.gen) e += 10; if (S.net) e += 8; if (S.gardenHeat) e += 15; if (S.gardenCool) e += 15; for (const d of S.decor || []) if (d.k === 'radiator') e += 20; else if (d.k === 'aircon') e += 30; e += 15 * (S.decor || []).filter((d) => d.k === 'vending' || d.k === 'neon' || d.k === 'massage').length; return e; }
const cafeF = () => Math.min(1, ...S.rooms.filter((r) => r.type === 'cafe').map((r) => SIZES[r.size].cafe));
const UNLOCK = { pharmacy: 1, pharmacist: 1, glowup: 2, career: 1, social: 1, parent: 1, maint: 0, therapy: 2, therapist: 2, moving: 2, lab: 2, researcher: 2, annex: 0 };
const localRoom = (k) => Object.values(PROBLEMS).some((p) => p.city && p.city === (S.city || 'london') && p.room === k);
const unlocked = (k) => !S || S.mode !== 'career' || localRoom(k) || (UNLOCK[k] || 0) <= S.stars;
const done = (k) => S.research.done.includes(k);
// ---- earthquake alert (Mexico City): the siren sounds, waiting visitors evacuate to the street for 20 s, rooms pause; afterwards some come in anxious
function quakeStart() {
  S.quake = { t: 20 }; AU.sfx('siren'); toast('🚨 ' + t('qk.alert'), 3500); say('qk', t('qk.alert'), 0); chat(t('from.hq'), '🚨 ' + t('qk.chat'), '🚨');
  for (const v of R.visitors) { if (!['toQueue', 'queue', 'checkin', 'toWait', 'wait'].includes(v.state) || v.caseK) continue;
    v.prevState = v.state; v.asleep = false; const p = { x: 0.5 + Math.random() * 6, z: 10.4 + Math.random() * 1.6 }; setPath(v, findPath(v.av.position, p)); v.state = 'evac'; }
}
function quakeEnd() {
  S.quake = null; let n = 0;
  for (const v of R.visitors) { if (v.state !== 'evac') continue; n++;
    for (const q of R.deskQs) { const qi = q.indexOf(v); if (qi >= 0) q.splice(qi, 1); }
    if (v.spot) { v.spot.busy = null; v.spot = null; }
    if (['toWait', 'wait'].includes(v.prevState)) seatVisitor(v); else joinQueue(v); }
  S.vibes = clamp(S.vibes + 2, 0, 100); chat(t('from.hq'), '✅ ' + t('qk.ok', { n }), '✅');
  for (let i = 0; i < 3; i++) R.later.push({ t: 4 + i * 3, prob: 'quake' }); // the alert leaves some people shaken
}
function quakeTick(dt) {
  if (!S || S.mode !== 'career' || !cityOf().quake) return;
  if (S.quake) { S.quake.t -= dt; if (S.quake.t <= 0) quakeEnd(); return; }
  if (S.quakeAt > 0 && S.t >= S.quakeAt && !modalPaused) { S.quakeAt = -1; quakeStart(); }
}
// ---- temperature (Theme Hospital style): each city has its climate; radiators and air conditioners keep the centre comfortable, at a cost ----
const CLIMATE = { newyork: [6, 4], mexico: [17, 6], london: [9, 3], lagos: [30, 3], mumbai: [31, 2], seoul: [4, 4], saopaulo: [22, 4], cairo: [33, 6] };
const T_LO = 19, T_HI = 24;
function outsideT() { const [b, a] = CLIMATE[S.city] || [18, 3]; return b + a * Math.sin((S.t / DAY_LEN - 0.25) * Math.PI * 2) - (S.rainy ? 2 : 0) + (S.ev && S.ev.k === 'heat' ? 7 : 0); }
function targetT() {
  const size = Math.pow(Math.max(1, (S.rooms.length + 2) / 4), 0.6), dec = S.decor || [];
  const heat = dec.filter((d) => d.k === 'radiator').length, cool = dec.filter((d) => d.k === 'aircon').length + (S.ac ? 1 : 0);
  const base = outsideT() * 0.6 + 8 + Math.min(4, (R.visitors.length + R.staff.length) * 0.12), aim = 21.5; // thermostat: devices only push toward ~21.5 °C, up to their capacity
  return base < aim ? base + Math.min(3.5 * heat / size, aim - base) : base - Math.min(3.5 * cool / size, base - aim);
}
const tempOff = () => { const T = S.temp ?? 21; return T < T_LO ? T_LO - T : T > T_HI ? T - T_HI : 0; };
let gardenT = 0;
function tempTick(dt) {
  if (!S || S.mode !== 'career') return;
  if (S.garden) { if (GARDEN_OK() && S.vibes < 95) S.vibes = clamp(S.vibes + 0.0015 * dt, 0, 100); if ((gardenT += dt) > 5) { gardenT = 0; gardenRain(); } }
  if (S.temp == null) S.temp = targetT(); S.temp += (targetT() - S.temp) * Math.min(1, dt / 20);
  const off = tempOff();
  if (off > 0) { S.vibes = clamp(S.vibes - 0.004 * Math.min(off, 10) * dt, 0, 100); if (off > 1.5 && (S.day >= 2 || S.t > DAY_LEN * 0.5)) behSeen('temp'); }
  else if (S.vibes < 90) S.vibes = clamp(S.vibes + 0.002 * dt, 0, 100);
}
function openTemp() {
  const T = S.temp ?? 21, off = tempOff(), dec = S.decor || [], st = T < T_LO ? 'cold' : T > T_HI ? 'hot' : 'ok';
  openSheet(`<h2>🌡️ ${t('tp.title')}</h2><div class="w" style="border-radius:14px;padding:10px 12px;font-weight:800">${t('tp.in')} : <b style="color:${st === 'ok' ? '#1E8A3A' : st === 'cold' ? '#2F7FD1' : '#C0362C'}">${Math.round(T)}°C</b> · ${t('tp.out')} : ${Math.round(outsideT())}°C<div style="font-size:13px;color:var(--muted)">${t('tp.zone')}</div><div style="margin-top:4px">${t('tp.' + st)}</div><div style="font-size:13px;margin-top:4px">${t('tp.dev', { h: dec.filter((d) => d.k === 'radiator').length, c: dec.filter((d) => d.k === 'aircon').length + (S.ac ? 1 : 0) })}</div></div>
    ${!S.tempFree ? `<p class="sub" style="color:#1E8A3A;font-weight:900">🎁 ${t('tp.free')}</p>` : ''}
    <div class="row2" style="margin-top:8px"><button class="btn ${st === 'cold' ? 'g' : 'w'}" id="tpRad">🔥 ${t('dc.radiator')} · ${S.tempFree ? money(DECOR.radiator.cost) : '🎁'}</button><button class="btn ${st === 'hot' ? 'g' : 'w'}" id="tpAc">❄️ ${t('dc.aircon')} · ${S.tempFree ? money(DECOR.aircon.cost) : '🎁'}</button></div>
    <p class="sub" style="margin-top:6px">${t('dc.radiatorD')}<br>${t('dc.airconD')}</p>`);
  $('tpRad').onclick = () => startDecor('radiator'); $('tpAc').onclick = () => startDecor('aircon');
}
// ---- special cases: short funny mini-games tied to a real modern problem; variants never repeat on a profile until a bank is used up ----
const ct = (path, vars) => { const pick = (L) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), CASE_TXT[L]); let v = pick(getLang()); if (v == null) v = pick('en'); if (typeof v === 'string' && vars) v = v.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)); return v; };
function saveProfile(p) { try { localStorage.setItem('ahq_profile', JSON.stringify(p)); } catch (e) {} }
function drawItems(k, bank, n) { // fresh items first; a bank only starts over once every item has been seen
  const p = profile(); p.cu = p.cu || {}; const key = k + '.' + bank, all = ct(k + '.' + bank).map((_, i) => i); let used = p.cu[key] || [];
  let free = all.filter((i) => !used.includes(i)); if (free.length < n) { used = []; free = all.slice(); }
  const out = []; while (out.length < n && free.length) out.push(free.splice(Math.floor(Math.random() * free.length), 1)[0]);
  p.cu[key] = used.concat(out); saveProfile(p); return out;
}
let caseRun = null;
function caseTick() {
  if (!S || S.mode !== 'career' || S.tut >= 0 || S.day < 2 || S.day < (S.caseNext || 0) || S.t < DAY_LEN * 0.15 || R.visitors.some((v) => v.caseK)) return;
  const elig = []; for (const v of R.visitors) { if (v.em || v.vip || v.cured || !['queue', 'wait'].includes(v.state)) continue; for (const [k, C] of Object.entries(CASES)) if (C.probs.includes(v.prob) && hasRoom(C.room) && (C.city ? C.city === S.city : (cityOf().lvl || 0) >= (C.lvl || 0))) elig.push([v, k]); }
  if (!elig.length) return; const [v, k] = rnd(elig); S.caseNext = S.day + 7; // one special case a week
  v.caseK = k; v.iconPrev = v.icon.material; v.icon.material = iconTex('⭐'); floatAt(v.av.position, '⭐'); AU.sfx('pop'); toast('⭐ ' + ct('ui.star'), 3200); chat(t('from.hq'), '⭐ ' + ct(k + '.name') + ' — ' + ct('ui.star'), '⭐');
}
function openCase(v) {
  const k = v.caseK, C = CASES[k], steps = [];
  for (const [bank, n] of C.rounds) for (const i of drawItems(k, bank, n)) steps.push({ bank, i });
  caseRun = { v, k, steps, at: -1, score: 0 };
  modal(`<div style="font-size:44px">⭐</div><div class="lbl">${ct('ui.title')}</div><h2 style="margin:4px 0 6px">${ct(k + '.name')}</h2><p style="font-weight:700">${ct(k + '.intro', { name: v.name })}</p>
    <div class="row2" style="margin-top:10px"><button class="btn y" id="csLater">${ct('ui.later')}</button><button class="btn g" id="csGo">${ct('ui.open')}</button></div>`);
  $('csLater').onclick = () => { caseRun = null; closeModal(); }; $('csGo').onclick = () => caseStep();
}
function caseStep() {
  const R0 = caseRun; if (!R0) return; R0.at++; if (R0.at >= R0.steps.length) return caseEnd();
  const { bank, i } = R0.steps[R0.at], k = R0.k, item = ct(k + '.' + bank)[i];
  const C = CASES[k], kind = C.b[bank], head = ct(k + '.' + (C.h[bank] || 'q')), quote = item[0]; let opts; // opts: [label, correct]
  if (kind === 'mc') opts = [[item[1], true], [item[2], false], [item[3], false]].sort(() => Math.random() - 0.5);
  else { const labels = kind === 'lb' ? ct(k + '.lb.' + bank) : kind.map((x) => ct(x)); opts = labels.map((lab, j) => [lab, j === item[1]]); }
  modal(`<div style="font-size:13px;font-weight:900;color:var(--muted)">${ct(k + '.name')} · ${R0.at + 1}/${R0.steps.length}</div><div class="lbl" style="margin-top:6px">${head}</div>
    <div class="w" style="border-radius:16px;padding:12px;font-size:16px;font-weight:800;margin:6px 0 10px">“${quote}”</div>
    <div style="display:grid;gap:8px">${opts.map((o, j) => `<button class="btn w" data-co="${j}" style="text-align:left;font-size:14.5px;padding:12px">${o[0]}</button>`).join('')}</div>`);
  document.querySelectorAll('[data-co]').forEach((b) => b.onclick = () => {
    const ok = opts[+b.dataset.co][1]; if (ok) R0.score++; AU.sfx(ok ? 'cash' : 'bad');
    document.querySelectorAll('[data-co]').forEach((x) => { x.disabled = true; if (opts[+x.dataset.co][1]) x.style.background = '#BFEFC9'; }); if (!ok) b.style.background = '#F6C3C3';
    setTimeout(caseStep, ok ? 650 : 1100);
  });
}
function caseEnd() {
  const R0 = caseRun; caseRun = null; const v = R0.v, n = R0.steps.length, r = R0.score / n, P = PROBLEMS[v.prob];
  const tier = r >= 0.8 ? 'win' : r >= 0.5 ? 'mid' : 'lose', money0 = Math.round(P.fee * (tier === 'lose' ? 0.5 : 1 + 3 * r) / 10) * 10, vib = tier === 'lose' ? -1 : Math.round(1 + 5 * r);
  S.cash += money0; S.earned += money0; S.vibes = clamp(S.vibes + vib, 0, 100); if (tier !== 'lose') { S.served++; incCnt('cases'); const p = profile(); p.album = (p.album || 0) + 1; saveProfile(p); if (r >= 0.8) addKudos(2); dailyHit(v); }
  modal(`<div style="font-size:46px">${tier === 'win' ? '🎉' : tier === 'mid' ? '🙂' : '😬'}</div><h2>${ct('ui.' + (tier === 'win' ? 'great' : tier === 'mid' ? 'ok' : 'fail'))}</h2><p style="font-weight:800">${ct(R0.k + '.' + tier, { name: v.name })}</p>
    <div class="w" style="border-radius:14px;padding:8px 12px;font-weight:900">${ct('ui.score', { s: R0.score, n })}<br>${ct('ui.reward', { m: money(money0), v: (vib >= 0 ? '+' : '−') + Math.abs(vib) })}</div><button class="btn g" id="csEnd" style="width:100%;margin-top:10px">${ct('ui.done')}</button>`);
  $('csEnd').onclick = closeModal;
  // the visitor's story is settled: they leave (happy, or with a story to tell)
  v.caseK = null; if (v.iconPrev) v.icon.material = v.iconPrev; v.caseDone = true;
  if (v.spot) v.spot.busy = null; v.spot = null; for (const q of R.deskQs) { const qi = q.indexOf(v); if (qi >= 0) q.splice(qi, 1); }
  if (tier === 'lose') { chat(t('from.review') + ' · ' + v.name + ', ' + v.age, '😬 ' + ct(R0.k + '.lose', { name: v.name }), '😬'); leave(v, true); }
  else { v.cured = true; if (v.av.userData.p.anim && v.av.userData.p.anim.calm) v.av.userData.p.anim.calm(); v.icon.material = iconTex(tier === 'win' ? '💘' : '😊'); floatAt(v.av.position, '+' + money(money0)); setPath(v, exitPath(v)); v.state = 'exit'; chat(t('from.review') + ' · ' + v.name + ', ' + v.age, (tier === 'win' ? '🎉 ' : '🙂 ') + ct(R0.k + '.' + tier, { name: v.name }), '⭐'); }
  save();
}
// ---- daily goal: one small target per day, with a small reward ----
function dailyNew() { // one goal at a time, lasting a week (7 in-game days), then a day off
  if (!S || S.mode !== 'career' || S.day < 2) { S.daily = null; return; }
  if (S.daily && !S.daily.won && S.day < S.daily.end) return; if (S.daily && S.day < (S.daily.end || 0) + 1) return;
  const seen = Object.keys((S.st && S.st.prob) || {}).filter((k) => PROBLEMS[k] && !PROBLEMS[k].myst && hasRoom(PROBLEMS[k].room));
  const lv = cityOf().lvl || 0, reward = 4 * (400 + 150 * lv + 20 * Math.min(S.day, 30)), r = RNG(), end = S.day + 7; // one goal a week
  if (seen.length && r < 0.5) S.daily = { k: 'cure', p: rnd(seen), n: 12 + Math.floor(RNG() * 7), c: 0, m: reward, end };
  else if (r < 0.75) S.daily = { k: 'calm', bad: 0, m: reward, end };
  else S.daily = { k: 'vibes', n: clamp(Math.round((S.vibes + 5) / 5) * 5, 50, 90), m: reward, end };
  toast('🎯 ' + dailyText(), 3200);
}
const dailyText = () => { const D = S.daily; if (!D) return ''; const left = D.won || D.lost ? '' : ' · ⏳' + Math.max(1, (D.end || S.day) - S.day + 1); return (D.k === 'cure' ? ct('dl.cure', { n: D.n, p: PROBLEMS[D.p].e + ' ' + pn(D.p) }) + ` (${D.c}/${D.n})` : D.k === 'calm' ? ct('dl.calm') + ` (${D.bad || 0}/4)` : ct('dl.vibes', { n: D.n })) + left; };
function dailyWin() { const D = S.daily; if (!D || D.won) return; D.won = true; S.cash += D.m; S.earned += D.m; addKudos(1); AU.sfx('cash'); toast('🎯 ' + ct('ui.dailyDone', { m: money(D.m) }), 3000); chat(t('from.hq'), '🎯 ' + dailyText() + ' — ' + ct('ui.dailyDone', { m: money(D.m) }), '🎯'); }
function dailyHit(v) { const D = S && S.daily; if (D && D.k === 'cure' && !D.won && v.prob === D.p) { D.c++; if (D.c >= D.n) dailyWin(); } }
function dailyEnd() { const D = S.daily; if (!D || D.won || S.day + 1 < (D.end || 0)) return; if (D.k === 'calm' && !D.fail) dailyWin(); if (D.k === 'vibes' && S.vibes >= D.n) dailyWin(); if (!D.won) D.lost = true; }
// ---- behaviours: from the 2nd city on, problems start to *play* differently. Each city adds two, and they stay on in later cities. London stays the simple tutorial city.
const BEH = { nolines: 7, onestar: 7, ahorita: 6, antojo: 6, slowdoom: 1, waves: 1, sleepy: 2, famleave: 2, ghost: 3, nunchi: 3, toxic: 4, saudade: 4, iou: 5, stamps2: 5 };
const BEH_E = { nolines: '🙅', onestar: '⭐', ahorita: '⏳', antojo: '🌮', temp: '🌡️', slowdoom: '📱', waves: '🚦', sleepy: '💤', famleave: '👨‍👩‍👧', ghost: '👻', nunchi: '👀', toxic: '😤', saudade: '🥹', iou: '🧾', stamps2: '📑' };
const TRAFFIC = new Set(['goslow', 'train', 'commute', 'honk']), BROKE = new Set(['rent', 'flat', 'subs', 'fuel']), DOOM = new Set(['doom', 'group']);
const beh = (k) => !window.__noBeh && !!S && S.mode === 'career' && (cityOf().lvl || 0) >= BEH[k];
function behSeen(k) { if (!S) return; S.seenB = S.seenB || {}; if (S.seenB[k]) return; S.seenB[k] = 1; (S.pQ = S.pQ || []).push('b:' + k); }
function behCard(k) {
  modal(`<div style="font-size:46px;line-height:1">${BEH_E[k]}</div><div class="lbl" style="margin-top:4px">${t('bh.new')}</div><h2 style="margin:4px 0 8px">${t('bh.' + k)}</h2>
    <div class="w" style="border-radius:14px;padding:10px 12px;text-align:left;font-size:14px;font-weight:700">${t('bh.' + k + '.d')}</div>
    <button class="btn g" id="piOk" style="width:100%;margin-top:10px">${t('pi.got')}</button>`);
  $('piOk').onclick = closeModal;
}
const waiting = (v) => ['toQueue', 'queue', 'checkin', 'toWait', 'wait'].includes(v.state);
let badAura = [];
function behTick(dt) { // per frame: who is spreading a bad mood in the waiting area
  badAura = [];
  if (!beh('toxic') && !beh('saudade')) return;
  for (const v of R.visitors) { if (!waiting(v) || v.asleep) continue;
    if (beh('toxic') && v.prob === 'boss') { badAura.push(v); behSeen('toxic'); if (RNG() < dt * 0.15) floatAt(v.av.position, '😤', true); }
    else if (beh('saudade') && v.prob === 'saudade' && (v.waitT || 0) > 10) { badAura.push(v); behSeen('saudade'); S.vibes = clamp(S.vibes - dt * 0.01, 0, 100); if (RNG() < dt * 0.15) floatAt(v.av.position, '🥹', true); } }
}
function wakeUp(v) { if (!v.asleep) return; v.asleep = false; v.sleepT = 0; if (v.iconPrev) v.icon.material = v.iconPrev; floatAt(v.av.position, '⏰'); v.pat = Math.min(1, v.pat + 0.08); if (v.state === 'wait') posePhone(v.av.userData.p); }
function behSpawn(v) { // traffic: one stuck driver means more are right behind
  if (beh('slowdoom') && DOOM.has(v.prob)) behSeen('slowdoom');
  if (beh('waves') && TRAFFIC.has(v.prob) && !v.wave && !v.em) { v.wave = true; behSeen('waves'); floatAt(v.av.position, '🚦'); R.later.push({ t: 2.2, prob: v.prob, wave: true }, { t: 4.6, prob: v.prob, wave: true }); spawnT += 8; }
}
function laterTick(dt) { for (const L of R.later.slice()) { L.t -= dt; if (L.t > 0) continue; R.later.splice(R.later.indexOf(L), 1); if (R.visitors.length >= 26) continue; wavePending = !!L.wave; const nv = spawnVisitor(L.prob); wavePending = false; if (nv) { nv.wave = !!L.wave; nv.stage2 = !!L.stage2; if (nv.wave) floatAt(nv.av.position, '🚦'); } } }
let wavePending = false;
function patienceRate(v) {
  if (S.tut >= 0 && S.tut <= 3) return 0;
  if (v.caseK) return 0; // a ⭐ case waits patiently for you
  let r = 1 / 75 / 1.2;
  if (v.spot && v.spot.out) r *= 0.75; // fresh air on the garden benches
  if (S.mode === 'career' && S.temp != null) { const off = tempOff(); if (off > 0) r *= 1 + 0.06 * Math.min(off, 10); }
  if (S.rainy) r *= cityOf().monsoon ? 1.25 : 1.15;
  if (hasRoom('cafe')) r *= cafeF() - (done('oat') ? 0.1 : 0);
  r *= 1 + 0.12 * R.rats.length + 0.02 * R.litter.length;
  if (v.state === 'toQueue' || v.state === 'queue') r *= 0.8;
  if (v.em) r *= 0.8;
  if (v.vip) r *= 1.3;
  if (cityOf().hustle) r *= 1.05;
  r *= decorCalm(v) * evPatience() * (inAura(v.av.position) ? 0.75 : 1);
  if (beh('ghost') && v.prob === 'ghosted' && !v.seen && v.known) { r *= 1.7; behSeen('ghost'); } // ignored again? they ghost you back
  if (cityOf().impatient) r *= 1.25; // New York minute
  if (beh('antojo') && v.prob === 'antojo' && !hasRoom('cafe') && !(S.decor || []).some((d) => d.k === 'vending')) { r *= 2; behSeen('antojo'); }
  if (beh('nunchi') && v.prob === 'nunchi' && R.visitors.filter((u) => u.state === 'wait').length > 8) { r *= 2; behSeen('nunchi'); }
  if (badAura.length && badAura.some((u) => u !== v && Math.hypot(u.av.position.x - v.av.position.x, u.av.position.z - v.av.position.z) < 2.2)) r *= 1.4;
  return r;
}
function roomSpeed(type) { return (type === 'nap' && done('nap')) || (type === 'detox' && done('mute')) ? 1.3 : type === 'budget' && done('sheet') ? 1.25 : 1; }
function exitPath(v) { const x = 2 + Math.random() * 3; return findPath(v.av.position, { x, z: 11.8 }).concat([{ x, z: 13.4 }]); }
function visitorUpdate(v, dt) {
  if (v.asleep) { v.sleepT = (v.sleepT || 0) + dt; if (v.sleepT > (v.state === 'queue' ? (DQ(v.desk || 0)[0] === v && deskHost(v.desk || 0, true) ? 5 : 15) : 20) || (R.mgr && Math.hypot(R.mgr.av.position.x - v.av.position.x, R.mgr.av.position.z - v.av.position.z) < 1.6)) wakeUp(v); v.hud.position.copy(v.av.position); return; } // asleep: doesn't move, blocks the line
  const p = v.av.userData.p, walkSpeed = 2.3 * (beh('slowdoom') && DOOM.has(v.prob) && !v.cured ? 0.55 : 1) * (v.state === 'angry' ? 1.6 : 1) * (v.av.userData.p.anim ? 1 : !v.cured && v.look.style2 && v.look.style2.walk === 'WalkTired' ? 0.72 : 1);
  switch (v.state) {
    case 'toQueue': if (stepWalker(v, dt, walkSpeed)) { v.state = 'queue'; v.av.rotation.y = Math.PI + Math.sin(v.id * 3.1) * 0.45; poseStand(p); posePhone(p); } break;
    case 'queue': {
      const di = v.desk || 0, i = DQ(di).indexOf(v); if (i < 0) { joinQueue(v); break; } const q = QUEUE(i, di);
      if (Math.hypot(v.av.position.x - q.x, v.av.position.z - q.z) > 0.05) { setPath(v, [q]); v.state = 'toQueue'; break; }
      const host = deskHost(di, true);
      if (i === 0 && host) { v.state = 'checkin'; v.prog = 0; v.av.rotation.y = desks()[di].r + Math.PI; poseStand(p); }
      break; }
    case 'checkin': {
      const host = deskHost(v.desk || 0, true);
      if (!host) { v.state = 'queue'; break; }
      if (S.ev && S.ev.k === 'power') break;
      v.prog += dt / (3.2 / (0.7 + host.data.skill * 0.12) / traitVal(host.data, 'speed') / boost() / energyF(host) * mgrDeskF()) * deskLv(v.desk || 0);
      if (v.prog >= 1) {
        finishCheckin(v);
      }
      break; }
    case 'toWait': if (stepWalker(v, dt, walkSpeed)) { settle(v, v.spot); posePhone(p); v.state = 'wait'; } break;
    case 'toShop': if (stepWalker(v, dt, walkSpeed)) { settle(v, v.sspot); posePhone(v.av.userData.p); v.state = 'shopping'; v.prog = 0; } break;
    case 'shopping': {
      v.prog += dt / 2.5;
      if (v.prog >= 1) { const spend = Math.round((12 + RNG() * 26) * (S.price || 1) * (done('oat') ? 1.15 : 1)); S.cash += spend; S.earned += spend; v.spent = (v.spent || 0) + spend; AU.sfx('cash'); floatAt(v.av.position, '🛍️ +' + money(spend)); v.sspot.busy = null; v.sspot = null; setPath(v, exitPath(v)); v.state = 'exit'; }
      break; }
    case 'toLoo': if (stepWalker(v, dt, walkSpeed * (v.urgent ? 1.7 : 1))) { settle(v, v.lspot); v.state = 'loo'; v.prog = 0; } break;
    case 'loo': {
      v.prog += dt / 3.5;
      if (v.prog >= 1) { v.lspot.busy = null; v.lspot = null; v.need = 0; v.urgent = false; v.prog = 0;
        const spot = WAIT_SPOTS.find((s) => !s.busy && !s.blocked) || { x: 2 + Math.random() * 3, z: 7.2 + Math.random(), rot: Math.PI, sit: false, y: 0 };
        spot.busy = v; v.spot = spot; setPath(v, findPath(v.av.position, spot)); v.state = 'toWait'; AU.sfx('flush', hearVol(v.av.position)); }
      break; }
    case 'wait': {
      v.need = (v.need || 0) + dt / 95;
      if (v.pat < 0.25 && RNG() < dt * 0.006) {
        if (RNG() < 0.55) { dropPuddle(v.av.position.x + 0.35, v.av.position.z + 0.2, '#9BCB4E'); floatAt(v.av.position, '🤢', true); S.vibes = clamp(S.vibes - 0.6, 0, 100); for (const o of R.visitors) if (o !== v && Math.hypot(o.av.position.x - v.av.position.x, o.av.position.z - v.av.position.z) < 2) o.pat -= 0.05; tip('vomit'); }
        else { v.need = 1.5; v.urgent = true; floatAt(v.av.position, '💩', true); }
      }
      if (v.need >= 1) {
        const loo = Object.values(R.rooms).filter((r) => ROOMS[r.type].loo).map((r) => r.spots.find((s) => !s.busy)).find(Boolean);
        if (loo) { loo.busy = v; if (v.spot) v.spot.busy = null; v.spot = null; v.lspot = loo; setPath(v, findPath(v.av.position, loo)); v.state = 'toLoo'; break; }
        if (!hasRoom('toilet')) { tip('toilet'); if (v.urgent) { dropPuddle(v.av.position.x + 0.3, v.av.position.z, '#A0784A'); v.noLoo = true; S.st = S.st || { prob: {}, room: {}, staff: {}, acc: 0, rats: 0, vip: 0 }; S.st.acc++; leave(v, false); break; } }
      }
      if (RNG() < dt * (done('bins') ? 0.0012 : 0.0025)) dropLitter(v.av.position.x, v.av.position.z);
      const need = needOf(v);
      if (need && (v.target == null || !R.rooms[v.target])) v.target = pickRoomFor(v);
      const cands = Object.values(R.rooms).filter((r) => r.type === need).sort((a, b) => (a.id === v.target ? -1 : 0) - (b.id === v.target ? -1 : 0));
      for (const room of cands) {
        if (room.closed) continue;
        if (room.id !== v.target && roomQ(room.id).length) continue;
        if (!v.prio && R.visitors.some((u) => u !== v && u.prio && u.state === 'wait' && u.target === room.id)) continue;
        const sp = room.spots.find((s) => !s.busy && room.staff[s.st] && room.staff[s.st].mode === 'there');
        if (sp) { sp.busy = v; if (v.spot) v.spot.busy = null; v.spot = null; v.room = room.id; v.target = room.id; v.rspot = sp; setPath(v, findPath(v.av.position, sp)); v.state = 'toRoom'; break; }
      }
      break; }
    case 'toRoom': if (beh('ahorita') && v.prob === 'ahorita' && (v.ahT = (v.ahT || 0) + dt) < 5) { if (!v.ahSaid) { v.ahSaid = true; floatAt(v.av.position, '⏳ ahorita…'); behSeen('ahorita'); } break; } if (stepWalker(v, dt, walkSpeed)) { settle(v, v.rspot); v.state = 'treat'; v.prog = 0; } break;
    case 'treat': {
      const room = R.rooms[v.room]; const st = room && v.rspot && room.staff[v.rspot.st];
      if (!room) { leave(v, true); break; }
      if (st && st.av && !v.rspot.lie) { const dx = st.av.position.x - v.av.position.x, dz = st.av.position.z - v.av.position.z, base = v.rspot.rot || 0; if (dx * dx + dz * dz > 0.04) { const d = angW(Math.atan2(dx, dz) - base); turnTo(v.av, base + (v.rspot.sit ? clamp(d, -0.6, 0.6) : d), dt, 4); } }
      if (!st || st.mode !== 'there' || room.closed || (S.ev && S.ev.k === 'power') || S.quake) break;
      v.prog += dt / (ROOMS[room.type].time / (0.7 + st.data.skill * 0.12) / traitVal(st.data, 'speed') / roomSpeed(room.type) / (SIZES[room.size].spd || 1) / boost() / energyF(st) / evSlow(room.type) * mgrRoomF(room.id) * (inAura(st.av.position) ? 1.15 : 1));
      if (v.prog >= 1) {
        const pr = (S.price || 1) * (cityOf().hustle ? 1.1 : 1) * (isNight() ? 1.15 : 1), fee = Math.round(PROBLEMS[v.prob].fee * 1.3 * (0.7 + S.vibes / 200) * pr);
        const twoVisit = beh('stamps2') && v.prob === 'paperwork', gain = Math.round(fee * (v.vip ? 2 : 1) * (twoVisit ? 0.5 : 1)), iou = beh('iou') && BROKE.has(v.prob);
        if (iou) { S.iou = (S.iou || 0) + gain; behSeen('iou'); floatAt(v.av.position, '🧾 ' + money(gain)); } else S.cash += gain;
        S.earned += gain; S.served++; v.spent = (v.spent || 0) + gain; dailyHit(v);
        if (cityOf().tips && v.pat > 0.5) { const tip = Math.round(gain * 0.25); S.cash += tip; S.earned += tip; incCnt('tips'); setTimeout(() => floatAt(v.av.position, '💵 tip +' + money(tip)), 400); } // happy & quick → they tip
        if (twoVisit && !v.stage2) { behSeen('stamps2'); R.later.push({ t: 40 + RNG() * 40, prob: 'paperwork', stage2: true }); floatAt(v.av.position, '📑 1/2'); }
        const SS = S.st = S.st || { prob: {}, room: {}, staff: {}, acc: 0, rats: 0, vip: 0 }; SS.prob[v.prob] = (SS.prob[v.prob] || 0) + 1; SS.room[room.type] = (SS.room[room.type] || 0) + 1; SS.staff[st.data.id] = (SS.staff[st.data.id] || 0) + 1;
        if (v.vip) { SS.vip++; S.vibes = clamp(S.vibes + 6, 0, 100); addKudos(3); chat('🤳 ' + v.name, t('vip.viral'), '🔥'); toast('👑 ' + t('vip.viral'), 3200); }
        S.vibes = clamp(S.vibes + (SIZES[room.size].vibe + (traitVal(st.data, 'vibe', 0) ? 0.3 : 0)) * (pr > 1 ? Math.max(0, 1 - (pr - 1) * 2) : 1 + (1 - pr) * 2) - (pr >= 1.4 ? 0.4 : 0), 0, 100);
        if (pr >= 1.2 && Math.random() < (pr - 1) * 0.5) chat(t('from.review') + ' · ' + v.name + ', ' + v.age, t('rev.greedy'), '💸');
        if (!iou) floatAt(v.av.position, '+' + money(gain)); AU.sfx('cash');
        if (v.em && S.em) S.em.got++;
        if (v.gag) v.gag.visible = false;
        if (v.gid && S.gs && S.gs[v.gid] > 0) { S.gs[v.gid]--; if (S.gs[v.gid] === 0) { delete S.gs[v.gid]; incCnt(cityOf().groups ? cityOf().groups.kind : 'groups'); floatAt(v.av.position, cityOf().groups && cityOf().groups.kind === 'families' ? '👨‍👩‍👧 ✓' : '🥳 ✓'); } }
        if (v.prob === 'wedding') incCnt('wedding'); if (PROBLEMS[v.prob].room === 'yoga') incCnt('yoga'); if (PROBLEMS[v.prob].room === 'lucha') incCnt('lucha'); if (v.prob === 'quake') incCnt('quake'); if (v.wave) incCnt('wave'); if (PROBLEMS[v.prob].room === 'ahwa') incCnt('tea'); if (cityOf().evening && S.t > DAY_LEN * 0.6) incCnt('evening'); if (isNight()) incCnt('night'); if (PROBLEMS[v.prob].care) S.vibes = clamp(S.vibes + 1, 0, 100);
        if (Math.random() < 0.25) chat(t('from.review') + ' · ' + v.name + ', ' + v.age, crnd(tList('rev.good')), '⭐');
        v.rspot.busy = null; v.rspot = null; v.cured = true; if (p.anim && p.anim.calm) p.anim.calm(); // cured: back to a normal walk
        v.icon.material = iconTex('😊');
        const shop = Object.values(R.rooms).filter((r) => ROOMS[r.type].shop && !r.closed).map((r) => r.spots.find((s) => !s.busy && r.staff[s.st] && r.staff[s.st].mode === 'there')).find(Boolean);
        if (shop && RNG() < 0.55) { shop.busy = v; v.sspot = shop; setPath(v, findPath(v.av.position, shop)); v.state = 'toShop'; } else { setPath(v, exitPath(v)); v.state = 'exit'; }
      }
      break; }
    case 'exit': case 'angry': if (stepWalker(v, dt, walkSpeed)) removeVisitor(v); break;
    case 'evac': stepWalker(v, dt, walkSpeed * 1.3); break;
  }
  if (beh('sleepy') && v.prob === 'burn' && !v.cured && (v.state === 'queue' || v.state === 'wait') && (v.waitT || 0) > 10 && (v.sleeps || 0) < 2 && RNG() < dt * 0.05) { v.asleep = true; v.sleepT = 0; v.sleeps = (v.sleeps || 0) + 1; v.iconPrev = v.icon.material; v.icon.material = iconTex('💤'); floatAt(v.av.position, '💤'); behSeen('sleepy'); AU.sfx('snore', hearVol(v.av.position)); return; }
  if (['toQueue', 'queue', 'checkin', 'toWait', 'wait'].includes(v.state)) { v.pat -= patienceRate(v) * (v.need > 1 && !hasRoom('toilet') ? 1.6 : 1) * dt; v.waitT = (v.waitT || 0) + dt; if (v.pat <= 0) leave(v, false); }
  if (v.emRing) { const s = 1 + 0.2 * Math.sin(performance.now() / 150); v.emRing.scale.set(s, s, s); v.emRing.visible = !['exit', 'angry'].includes(v.state); }
  v.hud.position.copy(v.av.position);
  const showProg = ['treat', 'checkin'].includes(v.state), val = showProg ? v.prog : v.pat;
  v.fg.scale.x = Math.max(0.001, 0.6 * clamp(val, 0, 1));
  v.fg.material = barMat(showProg ? '#5AB8F0' : v.pat > 0.5 ? '#7ACB4E' : v.pat > 0.25 ? '#FFB800' : '#E5484D');
  v.fg.visible = v.bg.visible = !['exit', 'angry'].includes(v.state);
  { const pa = v.av.userData.p.anim, standWait = v.state === 'queue' || (v.state === 'wait' && v.spot && !v.spot.sit);
    if (pa && standWait && v.pat < 0.25) pa.set('angry'); else if (pa && standWait && pa.state === '~angry' && v.pat > 0.35) posePhone(v.av.userData.p); }
  const kid = v.gag && v.gag.userData.kid; if (kid && kid.userData.p.anim) { const pa = v.av.userData.p.anim; kid.userData.p.anim.set(pa && /walk/.test(pa.state) ? 'walk' : 'idle', 1); }
}
const CMP_E = { noLoo: '🚻', noRoom: '🚪', queue: '🛎️', cold: '🥶', hot: '🥵', dirty: '🐀', price: '💸', crowd: '👥', wait: '⏳' };
function complaintOf(v) {
  if (v.noLoo) return 'noLoo';
  if (v.known && !isMystK(v.prob) && !hasRoom(PROBLEMS[v.prob].room)) return 'noRoom';
  if (['toQueue', 'queue', 'checkin'].includes(v.state)) return 'queue';
  if (S.temp != null && tempOff() > 2) return S.temp < T_LO ? 'cold' : 'hot';
  if (R.litter.length >= 5 || R.rats.length) return 'dirty';
  if ((S.price || 1) >= 1.3) return 'price';
  if (R.visitors.filter((u) => u.state === 'wait').length > 10) return 'crowd';
  return 'wait';
}
function logComplaint(k) { S.cmp = (S.cmp || []).filter((c) => c[0] > S.day - 7); S.cmp.push([S.day, k]); }
function topComplaints() { const n = {}; for (const [d, k] of S.cmp || []) if (d > S.day - 7) n[k] = (n[k] || 0) + 1; return Object.entries(n).sort((a, b) => b[1] - a[1]).slice(0, 3); }
function leave(v, quiet) {
  if (v.spot) v.spot.busy = null; if (v.rspot) v.rspot.busy = null; if (v.sspot) { v.sspot.busy = null; v.sspot = null; } if (v.lspot) { v.lspot.busy = null; v.lspot = null; }
  for (const q of R.deskQs) { const qi = q.indexOf(v); if (qi >= 0) q.splice(qi, 1); }
  if (v.gid && S.gs) S.gs[v.gid] = -99;
  if (!quiet && beh('onestar')) { S.vibes = clamp(S.vibes - 1.5, 0, 100); behSeen('onestar'); } // one-star reviews travel fast here
  if (!quiet && beh('famleave') && v.gid && !v.famGone) { v.famGone = true; const mates = R.visitors.filter((o) => o !== v && o.gid === v.gid && waiting(o)); if (mates.length) behSeen('famleave'); for (const o of mates) { o.famGone = true; S.vibes = clamp(S.vibes - 1, 0, 100); leave(o, true); floatAt(o.av.position, '👋', true); } }
  if (!quiet) {
    logComplaint(complaintOf(v));
    if (S.daily && S.daily.k === 'calm' && !S.daily.won && ++S.daily.bad > 4) S.daily.fail = true;
    S.left++; AU.sfx('bad'); S.vibes = clamp(S.vibes - (v.known && !isMystK(v.prob) && !hasRoom(PROBLEMS[v.prob].room) ? 1 : PROBLEMS[v.prob].care ? 5 : 3) - (v.vip ? 10 : 0), 0, 100); if (v.vip) { chat('🤳 ' + v.name, t('vip.roast'), '💀'); toast('👑 ' + t('vip.roast'), 3200); } floatAt(v.av.position, t('v.lost'), true);
    if (v.known && !hasRoom(PROBLEMS[v.prob].room)) tip('noRoom');
    const need = v.known ? PROBLEMS[v.prob].room : null;
    chat(t('from.review') + ' · ' + v.name + ', ' + v.age, v.noLoo ? t('rev.noLoo') : v.known && isMystK(v.prob) ? t('rev.myst') : need && !hasRoom(need) ? t('rev.noRoom', { room: rn(need) }) : crnd(tList('rev.bad')), '😤');
    if (Math.random() < 0.6) dropLitter(v.av.position.x, v.av.position.z);
  }
  v.icon.material = iconTex('😤'); setPath(v, exitPath(v)); v.state = 'angry';
}
function removeVisitor(v) { scene.remove(v.av); scene.remove(v.hud); R.visitors.splice(R.visitors.indexOf(v), 1); if (sel === v) selectVisitor(null); }

// ---------------- litter & pests ----------------
function dropPuddle(x, z, col) { AU.sfx('pop');
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.02, 18), mat(col, { r: 0.2 })); m.scale.set(1, 1, 0.7); m.position.set(x, 0.13, z); m.receiveShadow = true; scene.add(m);
  for (let i = 0; i < 3; i++) { const b = sph(0.08, col, { r: 0.2 }); b.scale.y = 0.3; put(b, x + (Math.random() - 0.5) * 0.9, 0.13, z + (Math.random() - 0.5) * 0.6); m.attach(b); }
  R.litter.push({ mesh: m, heavy: true });
}
function dropLitter(x, z) {
  if (R.litter.length >= 10) return;
  const m = Math.random() < 0.5 ? cyl(0.07, 0.05, 0.16, crnd(['#FFFFFF', '#7CC4A4'])) : sph(0.09, '#F4EFE6');
  if (m.geometry.type === 'CylinderGeometry') m.rotation.z = Math.PI / 2;
  m.position.set(x + (Math.random() - 0.5) * 0.6, 0.18, z + (Math.random() - 0.5) * 0.6); scene.add(m);
  R.litter.push({ mesh: m });
}
function spawnRat() {
  const g = new THREE.Group(); put(rbox(0.34, 0.16, 0.18, '#8A8592', 0.08), 0, 0.2, 0, g); put(sph(0.08, '#8A8592'), 0.2, 0.22, 0, g);
  put(sph(0.04, '#FFB3C0'), 0.17, 0.3, 0.06, g); put(sph(0.04, '#FFB3C0'), 0.17, 0.3, -0.06, g);
  const tail = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 6, 20, Math.PI), mat('#FFB3C0')); tail.rotation.x = Math.PI / 2; put(tail, -0.3, 0.14, 0, g);
  g.position.set(6.2, 0.1, 6.2); scene.add(g);
  const r = { mesh: g, tx: 3, tz: 3, wait: 0 }; R.rats.push(r); S.st = S.st || { prob: {}, room: {}, staff: {}, acc: 0, rats: 0, vip: 0 }; S.st.rats++;
  tip('rat'); if (!S.ratSeen) { S.ratSeen = true; chat(t('from.hq'), t('pest.chat'), '🐀'); }
}
function pestUpdate(dt) {
  if (unlocked('maint') && R.litter.length >= 5 && !R.staff.some((rs) => rs.data.role === 'maint')) tip('litter');
  if (R.litter.length >= 6 && R.rats.length < 3 && RNG() < dt * (done('bins') ? 0.01 : 0.025)) spawnRat();
  for (const r of R.rats) {
    const p = r.mesh.position; const dx = r.tx - p.x, dz = r.tz - p.z, d = Math.hypot(dx, dz);
    if (d < 0.1) { r.wait -= dt; if (r.wait <= 0) { r.tx = 0.6 + Math.random() * 5.4; r.tz = 0.6 + Math.random() * 5.4; r.wait = 1 + Math.random() * 2; } }
    else { p.x += dx / d * dt * 1.6; p.z += dz / d * dt * 1.6; r.mesh.rotation.y = Math.atan2(dx, dz) - Math.PI / 2; }
  }
  S.vibes = clamp(S.vibes - (R.litter.length * 0.0015 + R.litter.filter((l) => l.heavy).length * 0.005 + R.rats.length * 0.012) * dt, 0, 100);
}

// ---------------- inspector ----------------
function spawnInspector() {
  tip('insp');
  const av = visPerson('v16', { skin: rnd(SKIN), hair: '#5A5A5A', style: 'short', shirt: '#5E6B7A', pants: '#3B4452', clip: true, glasses: true, tall: 1.12, wide: 0.9, nose: true });
  av.position.set(3, 0.1, 12.5); scene.add(av);
  R.inspector = { av, path: [{ x: 3.2, z: 7.5 }, { x: 3, z: 3 }, { x: 1.2, z: 1.2 }, { x: 3.5, z: 2.5 }], ph: 0, stage: 0, wait: 0 };
  chat(t('insp.from'), t('insp.arrive'), '📋');
}
function inspectorUpdate(dt) {
  const I = R.inspector; if (!I) return;
  if (I.stage === 0) { if (stepWalker(I, dt, 1.4)) { I.stage = 1; I.wait = 3.5; poseStand(I.av.userData.p); } }
  else if (I.stage === 1) { I.wait -= dt; I.av.rotation.y += dt * 1.2; if (I.wait <= 0) { verdict(); I.stage = 2; I.path = [{ x: 3.2, z: 7.5 }, { x: 3, z: 13 }]; } }
  else if (stepWalker(I, dt, 1.8)) { scene.remove(I.av); R.inspector = null; }
}
function verdict() {
  let sc = 100 - R.litter.length * 7 - R.litter.filter((l) => l.heavy).length * 8 - R.rats.length * 18; if (!hasRoom('toilet')) sc -= 15;
  if (!R.staff.some((rs) => rs.at === 'desk')) sc -= 20;
  for (const room of Object.values(R.rooms)) if (ROOMS[room.type].role && !room.staff.some(Boolean)) sc -= 10;
  sc = clamp(Math.round(sc), 0, 100);
  const pass = sc >= 70;
  if (pass) { S.vibes = clamp(S.vibes + 5, 0, 100); S.cash += 500; addKudos(3); } else { S.vibes = clamp(S.vibes - 5, 0, 100); S.cash -= 1000; }
  chat(t('insp.from'), t(pass ? 'insp.pass' : 'insp.fail', { s: sc }), pass ? '✅' : '❌');
  modal(`<div style="font-size:44px">📋</div><h2>${t(pass ? 'insp.passT' : 'insp.failT')}</h2><p>${t(pass ? 'insp.pass' : 'insp.fail', { s: sc })}</p><button class="btn g" id="mOk" style="width:100%">${t('insp.ok')}</button>`);
  $('mOk').onclick = closeModal;
}

// ---------------- emergencies ----------------
function offerEmergency() {
  tip('em');
  const keys = Object.keys(EMERGENCIES).filter((e) => unlocked(EMERGENCIES[e].room) && (!EMERGENCIES[e].city || EMERGENCIES[e].city === (S.city || 'london'))); const k = rnd(keys); const E = EMERGENCIES[k];
  const missing = !hasRoom(E.room);
  modal(`<div style="font-size:44px">🚨</div><h2>${t('em.' + k)}</h2><p>${t('em.' + k + '.d')}</p><p style="color:var(--green-d)">${t('em.reward')}</p>${missing ? `<p style="color:var(--red)">${t('em.missing')} (${rn(E.room)})</p>` : ''}
  <div class="row2" style="margin-top:10px"><button class="btn y" id="emNo">${t('em.decline')}</button><button class="btn g" id="emYes">${t('em.accept')}</button></div>`);
  $('emNo').onclick = closeModal;
  $('emYes').onclick = () => { closeModal(); AU.sfx('siren'); say('em', t('pa.em', { name: t('em.' + k) }), 0); S.em = { k, need: 4, got: 0, t: 150, left: 6, spawnT: 0 }; chat(t('from.hq'), '🚨 ' + t('em.' + k), '🚨'); };
}
function emergencyUpdate(dt) {
  const E = S.em; if (!E) return;
  E.t -= dt; E.spawnT -= dt;
  if (E.left > 0 && E.spawnT <= 0) { E.spawnT = 3; E.left--; spawnVisitor(rnd(EMERGENCIES[E.k].probs), true); }
  if (E.got >= E.need) { addKudos(5); S.cash += 2500; S.vibes = clamp(S.vibes + 8, 0, 100); S.em = null; toast(t('em.win'), 3500); chat(t('from.hq'), t('em.win'), '🎉'); }
  else if (E.t <= 0) { S.vibes = clamp(S.vibes - 8, 0, 100); S.em = null; toast(t('em.fail'), 3500); chat(t('from.hq'), t('em.fail'), '😬'); }
}

// ---------------- research ----------------
function researchUpdate(dt) {
  const A = S.research.active; if (!A) return;
  let rate = 0;
  for (const rs of R.staff) if (rs.data.role === 'researcher' && R.rooms[rs.at] && R.rooms[rs.at].type === 'lab' && rs.mode === 'there') rate += energyF(rs) * 0.5 + rs.data.skill * 0.35 * traitVal(rs.data, 'speed');
  S.research.pts += rate * boost() * dt;
  if (S.research.pts >= PROJECTS[A].cost) { S.research.done.push(A); S.research.active = null; S.research.pts = 0; const nm = PROJECTS[A].myst ? t('p.' + PROJECTS[A].myst) : t('rp.' + A); toast(t('research.complete', { name: nm }), 3500); chat(t('research.title'), t('research.complete', { name: nm }), '🔬'); if (PROJECTS[A].myst) for (const v of R.visitors) if (v.known && v.prob === PROJECTS[A].myst) v.icon.material = iconTex(PROBLEMS[v.prob].e); }
}
function openResearch() {
  const hasLab = hasRoom('lab') && R.staff.some((rs) => rs.data.role === 'researcher');
  let h = `<h2>${t('research.title')}</h2><p class="sub">${hasLab ? '' : t('research.needLab')}</p>`;
  for (const [k, P] of Object.entries(PROJECTS).sort((a, b) => (b[1].myst && !done(b[0]) ? 1 : 0) - (a[1].myst && !done(a[0]) ? 1 : 0))) {
    if (P.myst && !(S.mystSeen || []).includes(P.myst)) continue;
    const isDone = done(k), act = S.research.active === k;
    const prog = act ? (k === 'rent' ? '0%' : t('research.points', { p: Math.floor(S.research.pts), n: P.cost })) : '';
    h += `<div class="opt w"><div class="oi" style="background:#E3ECF5">${P.e}</div><div class="ot"><b>${P.myst ? (isDone ? t('rp.mystDone', { name: t('p.' + P.myst) }) : t('rp.myst')) : t('rp.' + k)}</b><div>${P.myst ? t('rp.mystD', { room: rn(PROBLEMS[P.myst].room) }) : t('rp.' + k + '.d')}</div>${act ? `<div style="color:var(--blue)">${t('research.active')} · ${prog}</div>` : ''}</div>${isDone ? `<span class="tr good">${t('research.done')}</span>` : `<button class="btn ${act ? 'y' : 'g'}" data-res="${k}" ${!hasLab || act ? 'disabled' : ''}>${t('research.start')}</button>`}</div>`;
  }
  openSheet(h);
  $('sheet').querySelectorAll('[data-res]').forEach((b) => b.onclick = () => { S.research.active = b.dataset.res; S.research.pts = 0; openResearch(); });
}

// ---------------- UI helpers ----------------
function toast(html, ms = 2600) { const el = $('toast'); el.innerHTML = html; el.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('on'), ms); }
function chat(from, text, icon = '💬') {
  S.chat.unshift({ from, text, day: S.day }); S.chat = S.chat.slice(0, 40); S.unread++;
  $('bnFrom').textContent = from.toUpperCase(); $('bnText').innerHTML = text; $('banner').querySelector('.bi').textContent = icon; updateBadge();
  const bn = $('banner'); bn.classList.remove('on'); void bn.offsetWidth; bn.classList.add('on'); clearTimeout(chat.h); chat.h = setTimeout(() => bn.classList.remove('on'), 5000);
}
function updateBadge() { const b = $('chatBadge'); b.style.display = S.unread ? 'block' : 'none'; b.textContent = S.unread; }
const proj = new THREE.Vector3();
function toScreen(x, y, z) { proj.set(x, y, z).project(cam); return [(proj.x + 1) / 2 * innerWidth, (1 - proj.y) / 2 * innerHeight]; }
function floatAt(pos, txt, bad) { const [x, y] = toScreen(pos.x, pos.y + 2.3, pos.z); const d = document.createElement('div'); d.className = 'float' + (bad ? ' bad' : ''); d.textContent = txt; d.style.left = x + 'px'; d.style.top = y + 'px'; $('labels').appendChild(d); setTimeout(() => d.remove(), 1300); }
let sheetPaused = false, modalPaused = false;
function openSheet(html) { AU.sfx('click'); $('sheet').innerHTML = '<div class="grab" style="margin:0 auto 8px"></div>' + html; $('sheet').classList.add('on'); $('shade').classList.add('on'); sheetPaused = true; }
function closeSheet() { $('sheet').classList.remove('on'); $('shade').classList.remove('on'); sheetPaused = false; }
$('shade').onclick = () => { closeSheet(); placing = null; };
// ---- problem intro: the first time a problem shows up in a city, explain what it is and where it's treated ----
function probCard(k, fresh) {
  const P = PROBLEMS[k], r = P.room, R0 = ROOMS[r] || {}, built = hasRoom(r);
  modal(`<div style="font-size:46px;line-height:1">${P.e}</div>${fresh ? `<div class="lbl" style="margin-top:4px">${t('pi.title')}</div>` : ''}<h2 style="margin:4px 0 8px">${pn(k)}</h2>
    <div class="w" style="border-radius:14px;padding:10px 12px;text-align:left"><div class="lbl" style="margin:0 0 2px">${t('pi.real')}</div><div style="font-size:14px;font-weight:700">${t('pd.' + k)}</div></div>
    <div class="w" style="border-radius:14px;padding:10px 12px;margin-top:8px;text-align:left"><div class="lbl" style="margin:0 0 2px">${t('pi.cure')}</div><b>${R0.e || ''} ${rn(r)}</b><div style="font-size:13px;font-weight:800;margin-top:2px;color:${built ? '#1E8A3A' : '#B45309'}">${built ? t('pi.have') : t('pi.need')}</div></div>
    <div class="row2" style="margin-top:10px">${built ? '' : `<button class="btn y" id="piBuild">🔨 ${t('pi.build')}</button>`}<button class="btn g" id="piOk" style="${built ? 'width:100%' : ''}">${t('pi.got')}</button></div>`);
  $('piOk').onclick = closeModal; if ($('piBuild')) $('piBuild').onclick = () => { closeModal(); openBuild(); };
}
function probSeen(k) { if (!S || isMystK(k) || !PROBLEMS[k]) return; S.seenP = S.seenP || {}; if (S.seenP[k]) return; S.seenP[k] = 1; (S.pQ = S.pQ || []).push(k); }
let piCool = 0;
function probIntroTick(dt) { // one card at a time, never during the tutorial or over another popup, spaced out so it never floods
  piCool -= dt; if (!S || !S.pQ || !S.pQ.length || piCool > 0 || S.tut >= 0 || $('modal').classList.contains('on') || $('sheet').classList.contains('on')) return;
  piCool = 40; const k = S.pQ.shift(); if (k.startsWith('b:')) behCard(k.slice(2)); else probCard(k, true); save();
}
function modal(html) { $('modalBox').innerHTML = html; $('modal').classList.add('on'); modalPaused = true; }
function closeModal() { $('modal').classList.remove('on'); modalPaused = false; }
function show(id) { for (const s of ['title', 'map', 'brief', 'create']) $(s).classList.toggle('on', s === id); $('hud').classList.toggle('on', id === 'game'); $('labels').style.display = id === 'game' ? 'block' : 'none'; inGame = id === 'game'; if (id !== 'game') selectVisitor(null); }
function applyStatic() { if (S && S.city) { TV.city = t('city.' + S.city); TV.transit = t('tr.' + S.city); } document.querySelectorAll('[data-i18n]').forEach((el) => { el.innerHTML = t(el.dataset.i18n); }); $('langCode').textContent = getLang().toUpperCase(); }

// ---------------- labels ----------------
const labelEls = {};
function label(key, cls, html, onTap) {
  let el = labelEls[key];
  if (!el) { el = document.createElement('div'); $('labels').appendChild(el); labelEls[key] = el; if (onTap) el.addEventListener('pointerup', (e) => { e.stopPropagation(); onTap(); }); }
  el.className = 'rl ' + cls; if (el._h !== html) { el.innerHTML = html; el._h = html; } el.style.background = ''; return el;
}
function clearLabels() { for (const k in labelEls) { labelEls[k].remove(); delete labelEls[k]; } }
function at(el, x, y, z) { const [sx, sy] = toScreen(x, y, z); el.style.left = sx + 'px'; el.style.top = sy + 'px'; }
function updateLabels() {
  const seen = new Set();
  for (const room of Object.values(R.rooms)) {
    const q = roomRect(room.def), needStaff = ROOMS[room.type].role && !room.staff.some(Boolean);
    const el = label('r' + room.id, needStaff || room.closed ? 'warn tap' : 'tap', room.closed ? '💧 ' + rn(room.type) + ' · ' + t('ev.closed') : needStaff ? t('room.needs', { room: rn(room.type), role: roleN(ROOMS[room.type].role) }) : rn(room.type) + roomNo(room) + (roomQ(room.id).length ? ' · 👥' + roomQ(room.id).length : ''), () => openRoomMenu(room.id));
    if (needStaff && R.visitors.some((v) => v.state === 'wait' && v.known && needOf(v) === room.type)) say('ns' + room.type, t('room.needs', { room: rn(room.type), role: roleN(ROOMS[room.type].role) }), 50);
    else if (roomQ(room.id).length >= 5) say('q' + room.id, t('pa.queue', { room: rn(room.type) + roomNo(room) }), 90);
    if (!needStaff && !room.closed) el.style.background = ROOMS[room.type].pill; at(el, room.cx, 3.0, q.z0 + 0.3); seen.add('r' + room.id);
  }
  if (S.mode === 'career' && S.garden) { const ok = GARDEN_OK(), o = outsideT(), why = ok ? 'open' : S.rainy && !S.gardenRoof ? 'rain' : o <= (S.gardenHeat ? -2 : 8) ? 'cold' : 'hot'; const [pa] = plazaX(); const el = label('garden', ok ? 'ok' : 'lock', '🌳 ' + t('gd.' + why)); at(el, Math.min(-2, pa + 3), 0.8, 8.4); seen.add('garden'); }
  if (S.mode === 'career') plotOf().lots.forEach((L, i) => { const st = lotSt(i); if (st === 'owned' || !lotOpen(i)) return; const el = label('lot' + i, 'lock', st === 'pending' ? t('lot.pending', { d: lotDay(i) }) : t('lot.expand', { cost: money(lotCost(i)) }), () => tapLot(i)); at(el, (L[0] + L[1]) / 2, 0.6, (L[2] + L[3]) / 2); seen.add('lot' + i); });
  (S.desks2 || []).forEach((E, i) => { const di = i + deskBase(); if (!deskHost(di)) { const el = label('desk' + di, 'warn', t('desk.need')); at(el, E.x, 2.2, E.z); seen.add('desk' + di); } else if (DQ(di).length >= 3) { const el = label('deskq' + di, DQ(di).length >= 6 ? 'warn' : 'tap', '🛎️ 👥' + DQ(di).length); at(el, E.x, 2.4, E.z); seen.add('deskq' + di); } });
  if (S.desk.segs && !deskHost(1) && deskHost(0)) { const d1 = desks()[1], el = label('desk1', 'warn', t('desk.need')); at(el, d1.x, 2.2, d1.z); seen.add('desk1'); }
  if (!deskHost(0)) { if (R.deskQ.length) say('desk', t('desk.need'), 50); const el = label('desk', 'warn', t('desk.need')); at(el, S.desk.x, 2.2, S.desk.z); seen.add('desk'); }
  if (unlocked('maint') && R.litter.length >= 5 && !R.staff.some((rs) => rs.data.role === 'maint')) { say('litter', t('pest.needMaint'), 80); const el = label('litter', 'warn', t('pest.needMaint')); at(el, 3, 1.2, 1.5); seen.add('litter'); }
  if (R.mgr) { const el = label('mgr', 'boss', '⭐ ' + MGR.name, openMgr); at(el, R.mgr.av.position.x, 2.5 * (MGR.tall || 1), R.mgr.av.position.z); seen.add('mgr'); }
  if (R.deskQ.length >= 3 && deskHost(0)) { const el = label('deskq', R.deskQ.length >= 6 ? 'warn tap' : 'tap', '🛎️ 👥' + R.deskQ.length, openDesk); el.style.background = R.deskQ.length >= 6 ? '' : '#16963C'; at(el, S.desk.x, 2.4, S.desk.z); seen.add('deskq'); }
  if (R.rats.length) say('rat', t('pest.rat'), 70);
  R.rats.forEach((r, i) => { const el = label('rat' + i, 'warn', '🐀 ' + t('pest.rat')); at(el, r.mesh.position.x, 0.9, r.mesh.position.z); seen.add('rat' + i); });
  for (const k in labelEls) if (!seen.has(k)) { labelEls[k].remove(); delete labelEls[k]; }
}

// ---------------- build ----------------
let placing = null;
function openBuild() {
  let h = `<h2>${t('build.title')}</h2><p class="sub">${t('build.sub')}</p>`;
  // grouped: reception · care rooms (with the problems each one treats) · comfort for visitors · for the team
  const cat = (k) => (ROOMS[k].staffOnly || k === 'lab' ? 'staff' : ROOMS[k].shop || ROOMS[k].loo || k === 'cafe' ? 'comfort' : 'care');
  const hdr = (k) => `<div class="lbl" style="margin:12px 0 6px">${t('bc.' + k)}</div>`;
  const treats = (k) => { const ps = Object.keys(PROBLEMS).filter((p) => PROBLEMS[p].room === k && !PROBLEMS[p].myst && (!PROBLEMS[p].city || PROBLEMS[p].city === (S.city || 'london'))); return ps.length ? `<div style="font-size:12px;color:#2D3748;margin-top:2px"><b>${t('build.treats')}</b> ${ps.map((p) => PROBLEMS[p].e + ' ' + t('p.' + p)).join(' · ')}</div>` : ''; };
  const roomRow = (k, r) => { const ok = unlocked(k);
    return `<div class="opt w" style="${ok ? '' : 'opacity:.55'}"><div class="oi" style="background:${r.pill}22">${ok ? r.e : '🔒'}</div><div class="ot"><b>${rn(k)}</b><div>${t('r.' + k + '.d')}</div><div>${ok ? t('build.from', { m: money(roomCost(k, 's')) }) + (r.role ? ' · ' + t('build.needs', { role: roleN(r.role) }) : '') : t('lock.at', { n: UNLOCK[k] })}</div></div>${ok ? `<button class="btn g" data-room="${k}">${t('build.btn')}</button>` : ''}</div>`; };
  h += hdr('desk') + `<div class="opt w"><div class="oi" style="background:#DDF3E2">🛎️</div><div class="ot"><b>${t('build.moveDesk')}</b><div>${t('build.moveDeskD')}</div></div><button class="btn y" id="bMoveDesk">${t('build.moveBtn')}</button></div><div class="opt w"><div class="oi" style="background:#FFF3C4">➕</div><div class="ot"><b>${t('desk2.title')}</b><div>${t('desk2.D', { n: (S.desks2 || []).length + 2 })}</div></div><button class="btn g" id="bDesk2">${money(DESK_COST)}</button></div>`;
  for (const c of ['care', 'comfort', 'staff']) {
    const ks = Object.entries(ROOMS).filter(([k, r]) => (!r.city || r.city === (S.city || 'london')) && cat(k) === c); if (!ks.length) continue;
    h += hdr(c) + ks.map(([k, r]) => roomRow(k, r)).join('');
  }
  h += buildExtras();
  openSheet(h);
  $('bMoveDesk').onclick = () => { closeSheet(); startMove(); };
  if ($('bDesk2')) $('bDesk2').onclick = () => { closeSheet(); if (S.cash < DESK_COST) { toast(t('build.noCash'), 1600); return; } startMove(true); };
  $('sheet').querySelectorAll('[data-room]').forEach((b) => b.onclick = () => openSize(b.dataset.room));
  bindExtras();
}
function sizeCards(type, cur, onPick) {
  return Object.keys(SIZES).map((s) => {
    const Z = SIZES[s], cost = roomCost(type, s), diff = cur ? cost - roomCost(type, cur) : cost, price = cur ? (s === cur ? '—' : diff > 0 ? '−' + money(diff) : '+' + money(-diff / 2)) : money(cost);
    const afford = !cur ? S.cash >= cost : diff <= 0 || S.cash >= diff;
    return `<div class="opt w" style="${s === cur ? 'border-color:var(--green)' : ''}"><div class="oi" style="background:#F1F2F5;font:700 15px Fredoka">${Z.W}×${Z.D}</div><div class="ot"><b>${t('sz.' + s)}</b><div>${t('sz.' + s + 'D')}</div><div>${price}${capOf(type, s) ? ' · ' + t('sz.cap', { n: capOf(type, s) }) : ''}</div></div>${s === cur ? '' : `<button class="btn g" data-size="${s}" ${afford ? '' : 'disabled'}>${t(cur ? 'room.pick' : 'build.btn')}</button>`}</div>`;
  }).join('');
}
function openSize(type) {
  openSheet(`<h2>${t('sz.title')}</h2><p class="sub">${t('sz.sub', { room: rn(type) })}</p>` + sizeCards(type, null));
  $('sheet').querySelectorAll('[data-size]').forEach((b) => b.onclick = () => { closeSheet(); startPlace({ type, size: b.dataset.size }); });
}
function openRoomMenu(id) {
  const room = R.rooms[id]; if (!room || placingR || moving) return;
  const r = room.def, Z = SIZES[r.size], role = ROOMS[r.type].role, refund = Math.round(roomCost(r.type, r.size) / 2);
  let h = `<h2>${ROOMS[r.type].e} ${rn(r.type)}${roomNo(room)}</h2><p class="sub">${t('room.sizeL', { s: t('sz.' + r.size) })} · ${Z.W}×${Z.D}${role ? ' · ' + t('room.staffN', { a: room.staff.filter(Boolean).length, b: Z.st, role: roleN(role) }) : ''}</p>`;
  if (ROOMS[r.type].role || ROOMS[r.type].loo) h += roomQueueHtml(room) + '<div style="height:10px"></div>';
  h += `<div class="row2" style="margin-bottom:10px"><button class="btn g" id="rmMove">✋ ${t('room.move')}</button><button class="btn y" id="rmDemo">🗑️ ${t('room.demolish', { m: money(refund) })}</button></div>`;
  h += `<div class="lbl" style="margin:4px 0 6px">${t('room.resize')}</div>` + sizeCards(r.type, r.size);
  if (role && room.staff.some((s) => !s)) h += `<button class="btn w" id="rmHire" style="width:100%">${t('next.staff', { role: roleN(role), room: rn(r.type) })}</button>`;
  openSheet(h);
  $('rmMove').onclick = () => { closeSheet(); startPlace({ type: r.type, size: r.size }, r); };
  $('rmDemo').onclick = () => { closeSheet(); demolish(r.id); };
  const hb = $('rmHire'); if (hb) hb.onclick = () => openHire(role);
  bindRoomQueue(room);
  $('sheet').querySelectorAll('[data-size]').forEach((b) => b.onclick = () => { closeSheet(); startPlace({ type: r.type, size: b.dataset.size }, r); });
}
function evictRoom(id) {
  for (const v of R.visitors) if ((v.room === id && (v.state === 'toRoom' || v.state === 'treat')) || ((v.state === 'toLoo' || v.state === 'loo') && R.rooms[id] && R.rooms[id].spots.includes(v.lspot))) {
    if (v.lspot) { v.lspot.busy = null; v.lspot = null; }
    v.room = null; v.rspot = null; v.prog = 0;
    const spot = WAIT_SPOTS.find((s) => !s.busy && !s.blocked) || { x: 2 + Math.random() * 3, z: 7.2 + Math.random(), rot: Math.PI, sit: false, y: 0 };
    spot.busy = v; v.spot = spot; setPath(v, findPath(v.av.position, spot)); v.state = 'toWait';
  }
  const room = R.rooms[id]; if (room) for (const s of room.staff) if (s) s.at = null;
}
function demolish(id) {
  const i = S.rooms.findIndex((r) => r.id === id); if (i < 0) return; const r = S.rooms[i];
  evictRoom(id); const refund = Math.round(roomCost(r.type, r.size) / 2); S.cash += refund;
  S.rooms.splice(i, 1); const og = world.roomGroups[id]; if (og && og.parent) og.parent.remove(og); delete world.roomGroups[id]; delete R.rooms[id];
  rebuildGrid(); assignStaff(); save(); toast(t('room.demolished', { m: money(refund) }));
}
// ---- placement mode for rooms ----
let placingR = null;
const ghost = new THREE.Group(); ghost.visible = false; scene.add(ghost);
const ghostFloor = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 1), new THREE.MeshBasicMaterial({ color: '#7ACB4E', transparent: true, opacity: 0.45, depthWrite: false })); ghostFloor.position.y = 0.16; ghost.add(ghostFloor);
const ghostEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), new THREE.LineBasicMaterial({ color: '#0E6E2C' })); ghostEdge.position.y = 0.6; ghost.add(ghostEdge);
const ghostDoor = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 4), new THREE.MeshBasicMaterial({ color: '#FFD25E' })); ghostDoor.rotation.x = Math.PI / 2; ghost.add(ghostDoor);
function placeValid(p) {
  const q = roomRect(p);
  for (let x = q.x0 + 0.25; x < q.x1; x += 0.5) for (let z = q.z0 + 0.25; z < q.z1; z += 0.5) if (!buildable(x, z)) return false;
  const others = S.rooms.filter((r) => !p.edit || r.id !== p.edit.id);
  for (const o of others) { const b = roomRect(o); if (q.x0 < b.x1 - 0.01 && q.x1 > b.x0 + 0.01 && q.z0 < b.z1 - 0.01 && q.z1 > b.z0 + 0.01) return false; }
  const all = others.concat([p]), blk = makeGrid(all), hub = { x: 3, z: 3 };
  for (const r of all) if (!reach(blk, hub, doorPt(r, 0.35))) return false;
  if (!reach(blk, hub, { x: 3, z: 9 })) return false;
  return true;
}
function startPlace(spec, edit) {
  if (!inGame) return; selectVisitor(null);
  placingR = { type: spec.type, size: spec.size, x: edit ? edit.x : 0, z: edit ? edit.z : 0, a: edit ? edit.a : 0, edit };
  if (edit) { const og = world.roomGroups[edit.id]; if (og) og.visible = false; }
  if (!edit || !placeValid(placingR)) {
    const c = [];
    const pb = plotBox(), lot = plotOf().lots[0];
    for (let x = snapC(pb[0]); x <= pb[1]; x += 1) for (let z = snapC(pb[2]); z <= pb[3]; z += 1) for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      const q = roomRect({ ...placingR, x, z, a });
      const sc = edit ? Math.hypot(x - edit.x, z - edit.z) : (q.z0 - pb[2]) * 3 + (q.x0 - pb[0]) * 0.6 + (inR(lot, x, z) ? 80 : 0);
      c.push([sc, x, z, a]);
    }
    c.sort((m, n) => m[0] - n[0]);
    for (const [, x, z, a] of c) { const tr = { ...placingR, x, z, a }; if (placeValid(tr)) { Object.assign(placingR, { x, z, a }); break; } }
  }
  ghost.visible = true; $('movebar').classList.add('on'); $('nav').style.visibility = 'hidden'; $('pep').style.visibility = 'hidden';
  $('moveHint').textContent = ROOMS[spec.type].e + ' ' + t('place.hint'); $('mvRot').textContent = t('move.rotate'); $('mvOk').textContent = t('move.ok'); $('mvCancel').textContent = t('move.cancel');
  $('mvOk').onclick = () => endPlace(true); $('mvCancel').onclick = () => endPlace(false); $('mvRot').onclick = () => { placingR.a = ((placingR.a + Math.PI / 2 + Math.PI) % (Math.PI * 2)) - Math.PI; placeShow(); };
  placeShow();
}
function placeShow() {
  const p = placingR, q = roomRect(p), ok = placeValid(p); p.ok = ok;
  ghost.position.set(p.x, 0, p.z); ghostFloor.scale.set(q.w, 1, q.d); ghostEdge.scale.set(q.w, 1, q.d);
  ghostFloor.material.color.set(ok ? '#7ACB4E' : '#E5484D'); ghostEdge.material.color.set(ok ? '#0E6E2C' : '#A82328');
  const dp = doorPt(p, 0.45); ghostDoor.position.set(dp.x - p.x, 0.5, dp.z - p.z); ghostDoor.rotation.set(Math.PI / 2, 0, 0); ghostDoor.rotation.order = 'YXZ'; ghostDoor.rotation.y = p.a + Math.PI;
  $('mvOk').disabled = !ok; $('moveHint').textContent = ROOMS[p.type].e + ' ' + (ok ? t('place.hint') : t('place.bad'));
}
const snapC = (v) => Math.round(v - 0.5) + 0.5; // even-sized rooms: centre on n+0.5 → walls on n+0.5, same lattice as the plot
function placeDrag(e) {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam);
  if (!ray.ray.intersectPlane(gPlane, gHit)) return;
  const pb = plotBox(), nx = clamp(snapC(gHit.x), pb[0], pb[1]), nz = clamp(snapC(gHit.z), pb[2], pb[3]);
  if (nx === placingR.rawX && nz === placingR.rawZ) return; placingR.rawX = nx; placingR.rawZ = nz; placingR.moved = true;
  // magnet: if the finger's spot doesn't fit, slide to the closest spot nearby that does (turning the door if that's what it takes)
  const P = placingR, a0 = P.a, rots = [a0, a0 + Math.PI / 2, a0 - Math.PI / 2, a0 + Math.PI].map((a) => Math.atan2(Math.sin(a), Math.cos(a)));
  const cand = []; for (let dx = -6; dx <= 6; dx++) for (let dz = -6; dz <= 6; dz++) { const d = Math.hypot(dx, dz); if (d <= 6.1) cand.push([d, nx + dx, nz + dz]); } cand.sort((m, n) => m[0] - n[0]);
  let hit = null, tries = 0;
  const clash = (tr) => { const q = roomRect(tr); return S.rooms.some((r) => r !== P.edit && (() => { const o = roomRect(r); return q.x0 < o.x1 - 0.01 && q.x1 > o.x0 + 0.01 && q.z0 < o.z1 - 0.01 && q.z1 > o.z0 + 0.01; })()); }; // cheap pre-check
  for (const [d, x, z] of cand) { for (let ri = 0; ri < (d === 0 ? 4 : 2); ri++) { const tr = { ...P, x, z, a: rots[ri] }; if (clash(tr)) continue; if (++tries > 30) break; if (placeValid(tr)) { hit = tr; break; } } if (hit || tries > 30) break; }
  if (hit) { P.x = hit.x; P.z = hit.z; P.a = hit.a; } else { P.x = nx; P.z = nz; }
  placeShow();
}
function endPlace(ok) {
  const p = placingR; if (!p) return; placingR = null; ghost.visible = false;
  $('movebar').classList.remove('on'); $('nav').style.visibility = $('pep').style.visibility = '';
  $('mvOk').onclick = () => endMove(true); $('mvCancel').onclick = () => endMove(false); $('mvRot').onclick = () => { moving.r = (moving.r + Math.PI / 4) % (Math.PI * 2); moveShow(); };
  if (p.edit) { const og = world.roomGroups[p.edit.id]; if (og) og.visible = true; }
  if (!ok || !placeValid(p)) return;
  AU.sfx('build');
  if (p.edit) {
    const r = p.edit, diff = roomCost(p.type, p.size) - roomCost(r.type, r.size);
    if (diff > 0 && S.cash < diff) { toast(t('build.noCash')); return; }
    S.cash -= diff > 0 ? diff : Math.round(diff / 2);
    evictRoom(r.id); Object.assign(r, { x: p.x, z: p.z, a: p.a, size: p.size }); buildRoom(r);
  } else {
    const cost = roomCost(p.type, p.size); if (S.cash < cost) { toast(t('build.noCash')); return; }
    S.cash -= cost; const r = { id: S.nextId++, type: p.type, size: p.size, x: p.x, z: p.z, a: p.a }; S.rooms.push(r); buildRoom(r);
    const role = ROOMS[r.type].role;
    toast(t('build.done', { room: rn(r.type) }) + (role ? t('build.needStaff', { role: roleN(role) }) : ''));
    if (role) setTimeout(() => { if (R.rooms[r.id] && !R.rooms[r.id].staff.some(Boolean)) chat(t('from.hq'), t('build.chatNeed', { room: rn(r.type), role: roleN(role) }), '🧑‍💼'); }, 800);
    if (S.rooms.length === 2) tip('sizes');
  }
  rebuildGrid(); assignStaff(); save();
}
function tapLot(i = 0) {
  if (S.mode !== 'career') return;
  if (lotSt(i) !== 'locked') { toast(t('lot.wait')); return; }
  if (!lotOpen(i)) { toast('🔒 ' + t('lot.order')); return; }
  const cost = lotCost(i), L = plotOf().lots[i], area = Math.round((L[1] - L[0]) * (L[3] - L[2]));
  openSheet(`<h2>${t('lot.title')}</h2><p class="sub">${t('lot.sub2', { a: area })}</p><button class="btn g" id="buyLot" style="width:100%" ${S.cash < cost ? 'disabled' : ''}>${t('lot.btn', { cost: money(cost) })}</button>${S.cash < cost ? `<div class="msg" style="margin-top:8px">💡 ${t('lot.loan')}</div>` : ''}`);
  $('buyLot').onclick = () => { S.cash -= cost; setLot(i, 'pending', S.day + 1); buildAnnexLot(); closeSheet(); chat(t('from.council'), t('council.received'), '📝'); save(); };
}


// ---------------- hire ----------------
let candidates = {}, hireTab = 'coach';
const portraitR = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
portraitR.setSize(128, 128); portraitR.outputColorSpace = THREE.SRGBColorSpace; portraitR.toneMapping = THREE.ACESFilmicToneMapping;
const pScene = new THREE.Scene(); pScene.add(new THREE.HemisphereLight('#ffffff', '#b8ae9f', 1.2)); const pl = new THREE.DirectionalLight('#fff1dc', 2.2); pl.position.set(2, 4, 5); pScene.add(pl);
const pCam = new THREE.PerspectiveCamera(26, 1, 0.1, 20);
const portraits = {};
function portrait(st) {
  const key = st.id ? 's' + st.id : st.name + st.skill;
  if (portraits[key]) return portraits[key];
  pScene.background = new THREE.Color(ROLES[st.role].bg);
  const p = person(staffLook(st), 'staff'); p.rotation.y = 0.25; pScene.add(p);
  if (p.userData.p.glb) p.userData.p.anim.update(0.05); p.updateMatrixWorld(true); const hy = p.userData.p.head.getWorldPosition(new THREE.Vector3()).y + 0.04;
  pCam.position.set(0.15, hy + 0.1, 2.3); pCam.lookAt(0, hy - 0.18, 0);
  portraitR.render(pScene, pCam); portraits[key] = portraitR.domElement.toDataURL('image/jpeg', 0.85);
  pScene.remove(p); return portraits[key];
}
function refreshCandidates() { for (const r of Object.keys(ROLES)) candidates[r] = [makeCandidate(r), makeCandidate(r), makeCandidate(r)]; }
function trChip(n) { const x = TRAITS.find((y) => y.n === n); return `<span class="tr ${x.t}">${{ good: '+', bad: '−', fun: '~' }[x.t]} ${trN(n)}</span>`; }
function stars(n) { return '<span class="stars">' + '★'.repeat(n) + '</span><span style="color:#D5D9E2">' + '★'.repeat(5 - n) + '</span>'; }
function openHire(tab) {
  hireTab = tab || hireTab;
  let h = `<div style="display:flex;justify-content:space-between;align-items:center"><h2>${t('hire.title')}</h2><span class="y" style="border-radius:12px;padding:5px 10px;font-family:Fredoka;font-weight:700">${money(S.cash)}</span></div>`;
  h += '<div class="tabs">' + Object.keys(ROLES).filter(unlocked).map((k) => `<button class="${k === hireTab ? 'g' : 'y'}" data-tab="${k}">${roleN(k)}</button>`).join('') + '</div>';
  h += `<p class="sub">${t('hire.sub', { role: roleN(hireTab), job: t('job.' + hireTab) })}</p>`;
  candidates[hireTab].forEach((c, i) => {
    h += `<div class="staff w" style="border-left:7px solid ${ROLES[hireTab].strip}"><div class="top"><img src="${portrait(c)}" alt=""><div style="flex:1;min-width:0"><b class="f" style="font-size:18px">${c.name}</b><div style="font-size:16px">${stars(c.skill)}</div></div><div style="text-align:right"><b class="f" style="font-size:18px">${money(Math.round(c.wage * WAGE_K))}</b><div style="font-size:11.5px;font-weight:800;color:var(--muted)">${t('hire.perRent')}</div></div></div>
    <div>${c.traits.map(trChip).join('')}</div><button class="btn g" data-hire="${i}" style="width:100%;margin-top:8px;padding:8px">${t('hire.btn', { name: c.name.split(' ')[0] })}</button></div>`;
  });
  h += `<button class="btn y" id="newCand" style="width:100%">${t('hire.new')}</button>`;
  openSheet(h);
  $('sheet').querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => openHire(b.dataset.tab));
  $('sheet').querySelectorAll('[data-hire]').forEach((b) => b.onclick = () => hire(+b.dataset.hire));
  $('newCand').onclick = () => { if (S.cash < 200) return toast(t('build.noCash')); S.cash -= 200; candidates[hireTab] = [makeCandidate(hireTab), makeCandidate(hireTab), makeCandidate(hireTab)]; openHire(); };
}
function hire(i, tab) {
  tab = tab || hireTab; const c = candidates[tab][i]; const img = portrait(c); c.id = S.nextId++; portraits['s' + c.id] = img;
  S.staff.push(c); candidates[tab][i] = makeCandidate(tab);
  spawnStaffAvatar(c); closeSheet(); assignStaff(); save(); AU.sfx('hire');
  chat(c.name + ' · ' + roleN(c.role), crnd(tList('hire.hello')), '👋');
}
let staffFilter = 'all', staffOpen = null;
function openStaffList(filter) {
  if (typeof filter === 'string') staffFilter = filter;
  const roles = Object.keys(ROLES).filter((r) => unlocked(r) || S.staff.some((s) => s.role === r));
  const count = (r) => S.staff.filter((s) => s.role === r).length;
  let h = `<div class="stHead"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><h2 style="margin:0">${t('staff.title')}</h2><p class="sub" style="margin:0">${t('staff.sub', { n: S.staff.length, w: money(S.staff.reduce((a, s) => a + s.wage, 0)) })}</p></div><button class="btn g" id="toHire" style="padding:9px 14px;font-size:15px;white-space:nowrap">+ ${t('staff.hireNew')}</button></div>`;
  h += `<div class="tabs" style="margin-top:8px"><button class="${staffFilter === 'all' ? 'g' : 'y'}" data-sf="all">${t('staff.all')} · ${S.staff.length}</button>` + roles.map((r) => `<button class="${staffFilter === r ? 'g' : 'w'}" data-sf="${r}" style="border-left:5px solid ${ROLES[r].strip}">${roleN(r)} · ${count(r)}</button>`).join('') + `</div></div>`;
  if (!S.staff.length) h += `<div class="msg">${t('staff.none')}</div>`;
  for (const r of roles) {
    if (staffFilter !== 'all' && staffFilter !== r) continue;
    const list = S.staff.filter((s) => s.role === r);
    const rooms = Object.values(R.rooms).filter((x) => ROOMS[x.type].role === r);
    const seats = r === 'host' ? 1 : rooms.reduce((a, x) => a + x.staff.length, 0), filled = r === 'host' ? Math.min(1, list.length) : rooms.reduce((a, x) => a + x.staff.filter(Boolean).length, 0);
    if (!list.length && staffFilter === 'all') continue;
    h += `<div class="stGroup" style="border-left-color:${ROLES[r].strip}"><b>${roleN(r)} · ${list.length}</b><span>${r === 'maint' || r === 'researcher' && !rooms.length ? t('job.' + r) : seats ? t('staff.seats', { a: filled, b: seats }) : t('job.' + r)}</span><button class="w" data-hr="${r}">+ ${t('staff.hireRole')}</button></div>`;
    for (const st of list) {
      const rs = R.staff.find((x) => x.data === st), en = st.energy ?? 1;
      const where = st.awayT > 0 ? '🏠 ' + t('life.away') : rs && rs.onBreak ? '☕ ' + t('st.break') : rs && rs.at === 'desk' ? t('staff.desk') : rs && R.rooms[rs.at] ? rn(R.rooms[rs.at].type) : rs && rs.at === 'maint' ? t('job.maint') : t('staff.waiting');
      const open = staffOpen === st.id;
      h += `<div class="stRow w" data-so="${st.id}"><img src="${portrait(st)}" alt=""><div class="stMid"><b>${st.name}${st.grumpy ? ' 😒' : ''}${st.sadT > 0 ? ' 💔' : ''}${st.wfh ? ' 🏠' : ''}</b><small>${where}</small><div class="stMeta"><span class="stars">${'★'.repeat(st.skill)}</span><span class="en"><i style="width:${Math.round(en * 100)}%;background:${en < 0.25 ? '#E5484D' : '#7ACB4E'}"></i></span></div></div><div class="stWage">${money(Math.round(st.wage * WAGE_K))}<small>${open ? '▴' : '▾'}</small></div></div>`;
      if (open) h += `<div class="stMore"><div>${st.traits.map(trChip).join('')}</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><span style="font-size:12px;font-weight:900;color:var(--muted)">⚡ ${t('st.energy')} ${Math.round(en * 100)}%</span><span style="display:flex;gap:6px"><button class="btn g" data-raise="${st.id}" style="padding:6px 10px;font-size:13.5px">💸 ${t('staff.raise', { m: money(Math.round(st.wage * 0.1 / 10) * 10) })}</button><button class="btn y" data-fire="${st.id}" style="padding:6px 10px;font-size:13.5px">${t('staff.fire')}</button></span></div>${st.grumpy ? `<div style="font-size:12px;font-weight:800;color:var(--red);margin-top:6px">😒 ${t('staff.grumpyInfo')}</div>` : ''}</div>`;
    }
  }
  openSheet(h);
  $('toHire').onclick = () => openHire(staffFilter !== 'all' ? staffFilter : undefined);
  $('sheet').querySelectorAll('[data-sf]').forEach((b) => b.onclick = () => openStaffList(b.dataset.sf));
  $('sheet').querySelectorAll('[data-hr]').forEach((b) => b.onclick = () => openHire(b.dataset.hr));
  $('sheet').querySelectorAll('[data-so]').forEach((b) => b.onclick = () => { const id = +b.dataset.so; staffOpen = staffOpen === id ? null : id; const top = $('sheet').scrollTop; openStaffList(); $('sheet').scrollTop = top; });
  $('sheet').querySelectorAll('[data-fire]').forEach((b) => b.onclick = () => fire(+b.dataset.fire));
  $('sheet').querySelectorAll('[data-raise]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); const st = S.staff.find((s) => s.id === +b.dataset.raise); if (!st) return;
    st.wage += Math.round(st.wage * 0.1 / 10) * 10; st.grumpy = 0; st.raiseDay = S.day; st.energy = Math.min(1, (st.energy ?? 1) + 0.5); save();
    chat(st.name + ' · ' + roleN(st.role), t('staff.raisedChat'), '🥹'); toast(t('staff.raised', { name: st.name.split(' ')[0] })); const top = $('sheet').scrollTop; openStaffList(); $('sheet').scrollTop = top; });
}
function fire(id, silent) {
  const st = S.staff.find((s) => s.id === id); if (!st) return;
  S.staff.splice(S.staff.indexOf(st), 1);
  const rs = R.staff.find((x) => x.data === st);
  if (rs) { for (const room of Object.values(R.rooms)) room.staff = room.staff.map((s) => (s === rs ? null : s)); scene.remove(rs.av); R.staff.splice(R.staff.indexOf(rs), 1); }
  if (rs && rs.onBreak) rs.onBreak.busy = null;
  if (!silent) { chat(st.name, t('staff.fired'), '👋'); closeSheet(); } assignStaff(); save();
}

// ---------------- panels ----------------
function goalHtml() { return GOALS.map((g, i) => `<div class="goal"><span><span class="stars">${'★'.repeat(i + 1)}</span> ${goalText(g)}</span><span style="color:${S.stars > i ? '#1E8A3A' : 'var(--muted)'}">${S.stars > i ? t('goals.done') : t('goals.locked')}</span></div>`).join(''); }
function receipt() { return `<div class="receipt"><div><span>${t('rc.helped')}</span><span>${S.served}</span></div><div><span>${t('rc.out')}</span><span>${S.left}</span></div><div><span>${t('rc.vibes')}</span><span>${Math.round(S.vibes)}%</span></div><div><span>${t('rc.earned')}</span><span>${money(S.earned)}</span></div></div>`; }
function openGoals() {
  S.tutGoals = true;
  if (S.mode !== 'career') { openSheet(`<h2>${t('title.quick')}</h2><p class="sub">${t('quick.start')}</p>${receipt()}<button class="btn y" id="qQuit" style="width:100%">${t('menu.quit')}</button>`); $('qQuit').onclick = () => { closeSheet(); toTitle(); }; return; }
  const steps = nextSteps();
  let h = `<h2>${t('goals.title')}</h2><p class="sub">${t('goals.sub')}</p>`;
  if (S.daily) h += `<div class="w" style="border-radius:14px;padding:8px 12px;margin-bottom:8px;font-weight:800">🎯 ${ct('ui.daily')} : ${dailyText()} ${S.daily.won ? '✅' : S.daily.fail ? '❌' : ''}<div style="font-size:12px;color:var(--muted)">+${money(S.daily.m)}</div></div>`;
  { const tc = topComplaints(); h += `<div class="w" style="border-radius:14px;padding:8px 12px;margin-bottom:8px"><div class="lbl" style="margin:0 0 4px">📣 ${t('cmp.title')}</div>${tc.length ? tc.map(([k, n]) => `<div style="font-size:13.5px;margin:4px 0"><b>${CMP_E[k]} ${t('cmp.' + k)} · ${n}</b><div style="color:var(--muted);font-weight:700">💡 ${t('cmp.' + k + '.fix')}</div></div>`).join('') : `<div style="font-size:13px;font-weight:700">${t('cmp.none')}</div>`}</div>`; }
  h += `<div class="w" style="border-radius:14px;padding:8px 12px;margin-bottom:8px;font-weight:800">📒 ${ct('ui.album')} : ${ct('ui.albumN', { n: profile().album || 0 })}</div>`;
  GOALS.forEach((G, i) => {
    const st = S.stars > i ? 'done' : S.stars === i ? 'now' : 'later';
    h += `<div class="goalcard w ${st}"><div class="gh"><span><span class="stars">${'★'.repeat(i + 1)}</span> ${goalText(G)}</span><small>${st === 'done' ? '✅ ' + t('goals.done') : st === 'now' ? t('goals.now') : '🔒 ' + t('goals.later')}</small></div>`;
    if (st !== 'later') h += G.parts.map((pt) => metricRow(pt, st === 'done')).join('');
    h += '</div>';
  });
  h += `<div class="lbl" style="margin:6px 0">👉 ${t('goals.nextSteps')}</div>` + (steps.length ? steps.map((s, i) => `<button class="stepbtn w" data-step="${i}">${s.icon} <span>${s.txt}</span></button>`).join('') : `<div class="msg">${t('goals.none')}</div>`);
  h += receipt() + `<div class="row2"><button class="btn y" id="gWrap" style="grid-column:1/-1">🎁 ${t('wr.btn')}</button><button class="btn w" id="gAudio">🔊 ${t('au.title')}</button><button class="btn w" id="gTut">${t('tut.replay')}</button><button class="btn g" id="gMap">🌍 ${t('over.map')}</button><button class="btn w" id="gSave">💾 ${t('sv.export')}</button><button class="btn w" id="gLoad">📥 ${t('sv.import')}</button><button class="btn y" id="gQuit">${t('menu.quit')}</button></div>`;
  { // problem guide: every problem this city can bring, and the room that fixes it
    const c = S.city || 'london', ps = Object.keys(PROBLEMS).filter((k) => !PROBLEMS[k].myst && (!PROBLEMS[k].city || PROBLEMS[k].city === c));
    const byRoom = {}; for (const k of ps) (byRoom[PROBLEMS[k].room] = byRoom[PROBLEMS[k].room] || []).push(k);
    h += `<details style="margin-top:12px"><summary class="lbl" style="cursor:pointer">📖 ${t('guide.title')}</summary><p class="sub">${t('guide.sub')}</p>` + Object.entries(byRoom).map(([r, ks]) => `<div class="w" style="border-radius:14px;padding:8px 12px;margin-bottom:6px"><b>${ROOMS[r] ? ROOMS[r].e : ''} ${rn(r)}</b>${hasRoom(r) ? '' : ` <span style="color:#B45309;font-size:12px">· ${t('guide.notBuilt')}</span>`}${ks.map((k) => `<div data-pi="${k}" style="font-size:13px;margin-top:4px;cursor:pointer"><b>${PROBLEMS[k].e} ${t('p.' + k)} ℹ️</b><div style="color:var(--muted);font-weight:700">${t('pd.' + k)}</div></div>`).join('')}</div>`).join('') + `<p class="sub">❓ ${t('guide.myst')}</p></details>`;
  }
  openSheet(h); $('sheet').querySelectorAll('[data-pi]').forEach((el) => el.onclick = () => { closeSheet(); probCard(el.dataset.pi, false); });
  $('sheet').querySelectorAll('[data-step]').forEach((b) => b.onclick = () => { closeSheet(); const a = steps[+b.dataset.step].act; if (a) a(); });
  $('gWrap').onclick = () => { closeSheet(); showWrapped(false); };
  $('gAudio').onclick = () => openAudio();
  $('gTut').onclick = () => { closeSheet(); S.pepUsed = false; S.tutGoals = false; S.tut = 0; tutDrawn = null; };
  $('gQuit').onclick = () => { save(); closeSheet(); toTitle(); };
  $('gMap').onclick = () => { closeSheet(); toMap(); };
  $('gSave').onclick = () => { closeSheet(); exportSave(); }; $('gLoad').onclick = () => { closeSheet(); importSave(); };
}
function openChat() {
  S.unread = 0; updateBadge();
  openSheet(`<h2>${t('chat.title')}</h2><p class="sub">${t('chat.sub')}</p>` + (S.chat.map((m) => `<div class="msg"><small>${m.from} · ${dayN(m.day)}</small>${m.text}</div>`).join('') || `<div class="msg">${t('chat.empty')}</div>`));
}
function selectVisitor(v) { if (v && v.caseK) { openCase(v); return; } if (v && v.asleep) wakeUp(v); if (v && v.prob === 'ghosted' && !v.seen && beh('ghost')) { v.seen = true; v.pat = Math.min(1, v.pat + 0.15); floatAt(v.av.position, '👀💛'); } sel = v; const el = $('vcard'); if (!v) { el.classList.remove('on'); selRing.visible = false; return; } el.classList.add('on'); selRing.visible = true; renderVCard(); }
function renderVCard() {
  const v = sel; if (!v) return;
  const pr = PROBLEMS[v.prob]; const need = v.known ? pr.room : null; const built = need && hasRoom(need);
  const st = { toShop: t('v.toShop'), shopping: t('v.shopping'), toLoo: t('v.toLoo'), loo: t('v.loo'), toQueue: t('v.toQueue'), queue: t('v.queue'), checkin: t('v.checkin'), toWait: t('v.toWait'), wait: built ? t('v.waitFor', { room: rn(need) }) : t('v.needs', { room: need ? rn(need) : '?' }), toRoom: t('v.toRoom', { room: need ? rn(need) : '' }), treat: t('v.treat'), exit: t('v.exit'), angry: t('v.angry') }[v.state];
  const mood = v.pat > 0.6 ? '😊 ' + t('mood.ok') : v.pat > 0.3 ? '😐 ' + t('mood.meh') : '😡 ' + t('mood.bad');
  const tr = v.target != null && R.rooms[v.target], qi = tr ? roomQ(v.target).indexOf(v) : -1, others = need ? Object.values(R.rooms).filter((r) => r.type === need && r.id !== v.target) : [];
  const ws = Math.round(v.waitT || 0), wt = ws >= 60 ? Math.floor(ws / 60) + 'm' + String(ws % 60).padStart(2, '0') : ws + 's';
  $('vcard').style.borderLeftColor = v.em ? '#FF2D2D' : v.vip ? '#FFC83D' : '';
  const html = `<div style="display:flex;justify-content:space-between;gap:8px"><div style="min-width:0"><b class="f" style="font-size:17px">${v.em ? '🚨 ' : v.vip ? '👑 ' : ''}${v.name}, ${v.age}</b><div style="font-size:13px;font-weight:900">${v.known ? (isMystK(v.prob) ? '❓ ' + pn(v.prob) : `<span id="vInfo" style="cursor:pointer;text-decoration:underline dotted">${pr.e} ${pn(v.prob)} ℹ️</span>`) : '❔ ' + t('v.notChecked')}${v.em ? ` <span class="emtag">${t('vc.em')}</span>` : ''}</div><div style="font-size:12.5px;font-weight:800;color:${v.state === 'wait' && !built ? 'var(--red)' : 'var(--muted)'}">${st}${qi >= 0 ? ' · ' + t('vc.pos', { i: qi + 1, n: roomQ(v.target).length }) : ''}</div></div><button class="icon y" style="width:34px;height:34px;flex:none" id="vClose">✕</button></div>
  <div class="bar" style="height:8px;margin-top:6px"><i style="width:${Math.round(v.pat * 100)}%;background:${v.pat > 0.5 ? '#7ACB4E' : v.pat > 0.25 ? '#FFB800' : '#E5484D'}"></i></div>
  <div class="vgrid"><span>${mood} · ${Math.round(v.pat * 100)}%</span><span>⏱️ ${wt}</span><span>💵 ${t('vc.spent', { m: money(v.spent || 0) })}</span><span>${v.known && !isMystK(v.prob) ? '💰 ' + t('vc.fee', { m: money(feeFor(v)) }) : '💰 ?'}</span><span class="neg">⚠️ ${t('vc.leave', { n: leaveCost(v) })}</span></div>
  <div class="vthought">💬 “${vThought(v)}”</div>
  <div class="vbtns">${v.state === 'wait' && need && !built ? `<button class="btn g" id="vBuild">${t('v.build', { room: rn(need) })}</button>` : ''}${['wait', 'toWait'].includes(v.state) && others.length ? others.slice(0, 2).map((r) => `<button class="btn w" data-redir="${r.id}">↪ ${rn(r.type)}${roomNo(r)} (👥${roomQ(r.id).length})</button>`).join('') : ''}${!['exit', 'angry'].includes(v.state) && R.mgr ? `<button class="btn y" id="vMgr" ${S.mgrCd > 0 ? 'disabled' : ''}>⭐ ${S.mgrCd > 0 ? Math.ceil(S.mgrCd) + 's' : t('vc.send', { name: MGR.name })}</button>` : ''}</div>`;
  if ($('vcard')._h === html) return; $('vcard')._h = html; $('vcard').innerHTML = html;
  $('vClose').onclick = () => selectVisitor(null); if ($('vInfo')) $('vInfo').onclick = () => probCard(v.prob, false);
  const vb = $('vBuild'); if (vb) vb.onclick = () => { selectVisitor(null); openSize(pr.room); };
  const vm = $('vMgr'); if (vm) vm.onclick = () => { mgrGo({ kind: 'v', v }); renderVCard(); };
  $('vcard').querySelectorAll('[data-redir]').forEach((b) => b.onclick = () => { v.target = +b.dataset.redir; toast('↪ ' + t('rq.moved', { n: 1 }), 1200); renderVCard(); });
}
function openLang() {
  openSheet(`<h2>${t('lang.title')}</h2>` + Object.entries(LANGS).map(([k, n]) => `<button class="btn ${k === getLang() ? 'g' : 'w'}" data-lang="${k}" style="width:100%;margin-bottom:8px;text-align:left">${n}</button>`).join(''));
  $('sheet').querySelectorAll('[data-lang]').forEach((b) => b.onclick = () => { setLang(b.dataset.lang); applyStatic(); refreshTitle(); closeSheet(); });
}

// ---------------- input ----------------
let sel = null, inGame = false, speedMul = 1;
const selRing = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.06, 8, 30), mat('#FFD25E', { e: '#FFD25E', ei: 0.6 })); selRing.rotation.x = Math.PI / 2; selRing.visible = false; scene.add(selRing);
const ptrs = new Map(); let dragDist = 0, pinch0 = 0, half0 = 0, ang0 = 0, yaw0 = 0, mid0 = 0, pitch0 = 0;
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
// While placing: grab the ghost to move it; drag anywhere else to pan/zoom the map; a quick tap elsewhere drops the ghost there.
function ghostHit(e) {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam); if (!ray.ray.intersectPlane(gPlane, gHit)) return false;
  if (placingR) { const q = roomRect(placingR); return gHit.x > q.x0 - 0.6 && gHit.x < q.x1 + 0.6 && gHit.z > q.z0 - 0.6 && gHit.z < q.z1 + 0.6; }
  const o = placingD || moving; const ox = o.x != null ? o.x : o.mesh && o.mesh.position.x, oz = o.z != null ? o.z : o.mesh && o.mesh.position.z; return Math.hypot(gHit.x - ox, gHit.z - oz) < 1.2;
}
const placeMode = () => placingR || placingD || moving;
canvas.addEventListener('pointerdown', (e) => { if (!inGame) return; const pm = placeMode(); if (pm && !ptrs.size && ghostHit(e)) { canvas.setPointerCapture(e.pointerId); pm.drag = true; pm.moved = false; pm.downX = e.clientX; pm.downY = e.clientY; if (placingR) { placingR.rawX = snapC(placingR.x); placingR.rawZ = snapC(placingR.z); } if (placingD) decorDrag(e); else if (placingR) placeDrag(e); else moveDrag(e); return; } canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); dragDist = 0; if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); half0 = view.half; ang0 = Math.atan2(b.y - a.y, b.x - a.x); yaw0 = view.yaw; mid0 = (a.y + b.y) / 2; pitch0 = view.pitch; view.yawT = null; } });
canvas.addEventListener('pointermove', (e) => {
  if (placingD && placingD.drag) { decorDrag(e); return; }
  if (placingR && placingR.drag) { placeDrag(e); return; }
  if (moving && moving.drag) { moveDrag(e); return; }
  if (!ptrs.has(e.pointerId)) return; const p = ptrs.get(e.pointerId); const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); view.half = clamp(half0 * pinch0 / d, 5, 22); let da = Math.atan2(b.y - a.y, b.x - a.x) - ang0; da = Math.atan2(Math.sin(da), Math.cos(da)); view.yaw = yaw0 - da; view.pitch = clamp(pitch0 + ((a.y + b.y) / 2 - mid0) * 0.004, 0.42, 1.15); dragDist = 99; placeCam(); return; }
  dragDist += Math.abs(dx) + Math.abs(dy);
  const k = view.half * 2 / innerHeight, rx = dx * k, ry = dy * k * 1.6;
  const cy = Math.cos(view.yaw), sy = Math.sin(view.yaw), ky = 1 / Math.max(0.35, Math.sin(view.pitch)) * 0.62;
  view.tx = clamp(view.tx - rx * cy - ry * ky * sy, -28, 28); view.tz = clamp(view.tz + rx * sy - ry * ky * cy, -30, 14); placeCam();
});
canvas.addEventListener('pointerup', (e) => {
  const pm = placeMode(); if (pm && pm.drag) { pm.drag = false; if (placingR && pm === placingR && Math.hypot(e.clientX - pm.downX, e.clientY - pm.downY) < 14 && placingR.ok) { if (navigator.vibrate) navigator.vibrate(15); endPlace(true); } return; } // tap the green room = build it
  ptrs.delete(e.pointerId);
  if (dragDist > 14 || !inGame) return; // fingers wobble: a small slide is still a tap
  if (pm) { if (placingD) decorDrag(e); else if (placingR) placeDrag(e); else moveDrag(e); return; }
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam);
  if (mgrPick) { mgrPickAt(e); return; }
  if (R.mgr && ray.intersectObject(R.mgr.av, true).length) { openMgr(); return; }
  { const pv = pickVisitor(e); if (pv) { selectVisitor(pv); return; } }
  const dh = ray.intersectObjects(Object.values(world.decor), true); if (dh.length) { openDecorMenu(dh[0].object.userData.decorId); return; }
  if (ray.intersectObject(world.desk, true).length) { openDesk(); return; }
  { const dh2 = ray.intersectObjects(world.desks2 || [], true); if (dh2.length) { let o = dh2[0].object; while (o && o.userData.di == null) o = o.parent; if (o) { openDesk2(o.userData.di); return; } } }
  const hits = ray.intersectObjects(R.visitors.map((v) => v.av), true);
  if (hits.length) { const owner = hits[0].object.userData.owner; const v = R.visitors.find((x) => x.av === owner); if (v) { selectVisitor(v); return; } }
  if (ray.ray.intersectPlane(gPlane, gHit)) {
    const hitR = S.rooms.find((r) => { const q = roomRect(r); return gHit.x > q.x0 && gHit.x < q.x1 && gHit.z > q.z0 && gHit.z < q.z1; }) || S.rooms.find((r) => { const q = roomRect(r); return gHit.x > q.x0 - 0.35 && gHit.x < q.x1 + 0.35 && gHit.z > q.z0 - 0.35 && gHit.z < q.z1 + 0.35; }); // a tap on the wall counts too
    if (hitR) { openRoomMenu(hitR.id); return; }
    { const li = plotOf().lots.findIndex((L, i) => lotSt(i) !== 'owned' && inR(L, gHit.x, gHit.z)); if (li >= 0) { if (S.mode === 'career') tapLot(li); return; } }
    if (buildable(gHit.x, gHit.z)) { openBuild(); return; }
  }
  selectVisitor(null);
});
canvas.addEventListener('wheel', (e) => { view.half = clamp(view.half * (e.deltaY > 0 ? 1.08 : 0.93), 5, 22); placeCam(); }, { passive: true });
function camRot(dir) { view.yawT = (view.yawT ?? view.yaw) + dir * Math.PI / 2; }
function camTilt() { const L = [0.42, 0.53, 0.8, 1.1]; const i = L.findIndex((v) => v > view.pitch + 0.02); view.pitchT = L[i < 0 ? 0 : i]; }
function camAnim(rdt) {
  let ch = false;
  if (view.yawT != null) { const d = view.yawT - view.yaw; if (Math.abs(d) < 0.01) { view.yaw = view.yawT; view.yawT = null; } else view.yaw += d * Math.min(1, rdt * 7); ch = true; }
  if (view.pitchT != null) { const d = view.pitchT - view.pitch; if (Math.abs(d) < 0.005) { view.pitch = view.pitchT; view.pitchT = null; } else view.pitch += d * Math.min(1, rdt * 7); ch = true; }
  if (ch) placeCam();
}
$('camL').onclick = () => camRot(-1); $('camR').onclick = () => camRot(1); $('camT').onclick = camTilt;
addEventListener('keydown', (e) => { if (!inGame) return; if (e.key === 'q' || e.key === 'Q') camRot(-1); if (e.key === 'e' || e.key === 'E') camRot(1); if (e.key === 't' || e.key === 'T') camTilt(); });
let lastSpeed = 1;
function setSpeed(s) {
  speedMul = s; if (s > 0) lastSpeed = s;
  $('spPause').classList.toggle('on', s === 0); $('icPause').style.display = s === 0 ? 'none' : ''; $('icPlay').style.display = s === 0 ? '' : 'none';
  $('spLbl').textContent = lastSpeed + '×'; $('spFast').classList.toggle('on', s > 1);
}
$('spPause').onclick = () => setSpeed(speedMul === 0 ? lastSpeed : 0);
$('spFast').onclick = () => setSpeed(speedMul === 0 ? lastSpeed : speedMul >= 3 ? 1 : speedMul + 1);
$('nBuild').onclick = openBuild; $('nStaff').onclick = openStaffList; $('nGoals').onclick = openGoals; $('nChat').onclick = openChat; $('nResearch').onclick = openResearch;
$('banner').onclick = openChat;

// ---------------- game loop ----------------
let spawnT = 3, saveT = 0, last = performance.now();
function dayTick(dt) {
  if (S.mode !== 'career') {
    S.qt -= dt; S.t = (S.t + dt) % DAY_LEN;
    if (S.qt <= 0) endQuick();
    return;
  }
  S.t += dt;
  if (S.inspectAt > 0 && S.t >= S.inspectAt && !R.inspector) { S.inspectAt = -1; spawnInspector(); }
  if (S.vipAt > 0 && S.t >= S.vipAt) { S.vipAt = -1; const ok = Object.keys(PROBLEMS).filter((k) => !PROBLEMS[k].myst && hasRoom(PROBLEMS[k].room)); if (ok.length) { spawnVisitor(rnd(ok), false, true); say('vip', t('vip.arrive'), 0); chat(t('from.hq'), t('vip.arrive'), '👑'); toast('👑 ' + t('vip.arrive'), 3000); } }
  if (S.crewAt > 0 && S.t >= S.crewAt && !modalPaused) { S.crewAt = -1; crewVisit(); }
  if (S.evAt > 0 && S.t >= S.evAt && !S.ev && !modalPaused) { S.evAt = -1; startEvent(); }
  if (S.raiseAt > 0 && S.t >= S.raiseAt && !modalPaused) { S.raiseAt = -1; raiseRequest(); }
  if (S.lifeAt > 0 && S.t >= S.lifeAt && !modalPaused) { S.lifeAt = -1; lifeEvent(); }
  if (S.emAt > 0 && S.t >= S.emAt) { S.emAt = -1; if (!S.em) offerEmergency(); }
  if (S.t >= DAY_LEN) {
    S.t -= DAY_LEN; dailyEnd(); S.day++; dailyNew();
    if (cityOf().quake && S.day >= 3 && Math.random() < 0.3) S.quakeAt = 15 + Math.random() * 50;
    if (S.iou) { S.cash += S.iou; chat(t('from.hq'), t('bh.iouPaid', { m: money(S.iou) }), '🧾'); S.iou = 0; }
    if (RENT_EVERY - ((S.day - 1) % RENT_EVERY) === 1) say('rent', t('pa.rent', { m: money(RENT) }), 0);
    S.rainy = Math.random() < cityOf().rain;
    if (S.rainy) { chat(t('from.weather'), t('weather.rain'), '🌧️'); tip('rain'); }
    if (S.day === 3 && unlocked('lab') && !hasRoom('lab')) tip('lab');
    plotOf().lots.forEach((_, i) => { if (lotSt(i) === 'pending' && S.day >= lotDay(i)) lotOwned(i); });
    if (S.day >= S.nextInspect) { S.nextInspect = S.day + 3 + Math.floor(Math.random() * 2); S.inspectAt = 15 + Math.random() * 30; }
    if (S.day >= 2 && Math.random() < (cityOf().power ? 0.7 : 0.5)) S.evAt = 10 + Math.random() * 35;
    if (S.day >= 3 && S.staff.length >= 3 && Math.random() < 0.3) S.raiseAt = 20 + Math.random() * 25;
    else if (S.mode === 'career' && S.city !== 'london' && S.day >= 30 && S.staff.length >= 2 && Math.random() < 0.3) S.lifeAt = 15 + Math.random() * 35;
    for (const st of S.staff) if (st.wfh && S.day % 5 === 0 && !(st.awayT > 0)) { st.awayT = DAY_LEN * 0.95; chat(st.name + ' · ' + roleN(st.role), t('life.wfhOn'), '🏠'); }
    poachCheck();
    if (S.day >= 3 && Math.random() < 0.35) S.vipAt = 15 + Math.random() * 30;
    if (S.mode === 'career' && S.stars >= 2 && S.day >= 10) { if (!S.crewNext) S.crewNext = S.day + 2 + Math.floor(Math.random() * 4); else if (S.day >= S.crewNext) { S.crewNext = S.day + crewGap(); S.crewAt = 20 + Math.random() * 25; } }
    if (S.crewAngry && S.day >= S.crewAngry) { S.crewAngry = 0; if (Math.random() < 0.65) vandalism(); }
    if (S.crewReport && S.day >= S.crewReport) { S.crewReport = 0; S.crewNext = S.day + crewGap() + 7; chat(t('crew.name'), t('crew.police'), '🚓'); }
    if (S.day > 1 && (S.day - 1) % 12 === 0) setTimeout(() => showWrapped(true), 400);
    if (S.day >= S.nextEm) { S.nextEm = S.day + 2 + Math.floor(Math.random() * 2); S.emAt = 8 + Math.random() * 20; }
    billWarn();
    if ((S.day - 1) % RENT_EVERY === 0) {
      const wages = Math.round(S.staff.reduce((a, s) => a + s.wage, 0) * WAGE_K);
      const loanPay = S.loan ? Math.min(S.loan.left, S.loan.per) : 0; if (S.loan) { S.loan.left -= loanPay; if (S.loan.left <= 0) S.loan = null; }
      const elec = elecPerDay() * ELEC_K * RENT_EVERY; S.adUses = 0;
      S.cash -= RENT + wages + loanPay + elec;
      modal(`<div style="font-size:44px">🧾</div><h2>${t('rent.title')}</h2><p>${t('rent.p')}</p><div class="receipt"><div><span>${t('rent.rent')}</span><span>-${money(RENT)}</span></div><div><span>${t('rent.wages')}</span><span>-${money(wages)}</span></div><div><span>⚡ ${t('bill.elec')}</span><span>-${money(elec)}</span></div>${loanPay ? `<div><span>${t('loan.pay')}</span><span>-${money(loanPay)}</span></div>` : ''}<div style="border-top:2px dashed var(--sh);margin-top:4px;padding-top:6px"><span>${t('rent.left')}</span><span>${money(S.cash)}</span></div></div><button class="btn g" id="mOk" style="width:100%">${t('rent.ok')}</button>`);
      $('mOk').onclick = closeModal;
      chat(t('from.landlord'), t('landlord.thanks'), '🏠'); tip('rent');
      const wk = S.earned - (S.earnedAtBill || 0); S.earnedAtBill = S.earned;
      if (S.cash < -5000 && !S.bailout) { // first time under: the bank steps in once instead of ending the run
        S.bailout = true; const need = Math.round((-S.cash + 5000) / 500) * 500, owe = Math.round(need * 1.15 / 500) * 500; S.cash += need;
        S.loan = { left: (S.loan ? S.loan.left : 0) + owe, per: Math.round(((S.loan ? S.loan.left : 0) + owe) / 6) };
        setTimeout(() => { modal(`<div style="font-size:44px">🏦</div><h2>${t('bail.title')}</h2><p>${t('bail.p', { m: money(need), o: money(owe) })}</p><button class="btn g" id="mOk" style="width:100%">${t('tut.ok')}</button>`); $('mOk').onclick = closeModal; }, 600);
      } else if (S.cash < -5000) gameOver({ bill: RENT + wages + loanPay + elec, rent: RENT, wages, elec, loanPay, wk });
    } else if (Math.random() < 0.5) chat(crnd([t('from.landlord'), t('from.hq'), t('from.group')]), crnd(tList('chat.random')), '💬');
    save();
  }
}
// all three goals done: celebrate with the totals, then stay or move on to the next city (its brief shows the new goals)
function cityVictory() {
  const nxt = Object.keys(CITIES).find((k) => CITIES[k].unlock === (S.city || 'london'));
  modal(`<div style="font-size:46px">⭐⭐⭐</div><h2>${t('win.title', { city: t('city.' + S.city) })}</h2><p>${t('win.p')}</p>
    <div class="receipt"><div><span>${t('rc.helped')}</span><span>${S.served}</span></div><div><span>${t('rc.earned')}</span><span>${money(S.earned || 0)}</span></div><div><span>${t('rc.cash')}</span><span>${money(S.cash)}</span></div><div><span>${t('rc.vibes')}</span><span>${Math.round(S.vibes)}%</span></div><div><span>${t('rc.rooms')}</span><span>${S.rooms.length}</span></div><div><span>${t('rc.team')}</span><span>${S.staff.length}</span></div><div><span>${t('rc.days')}</span><span>${S.day}</span></div></div>
    ${nxt ? `<button class="btn g" id="wNext" style="width:100%;margin-top:6px">🌍 ${t('win.next', { city: t('city.' + nxt) })}</button>` : `<p style="font-weight:800">${t('win.last')}</p>`}
    <button class="btn w" id="wStay" style="width:100%;margin-top:8px">${t('win.stay', { city: t('city.' + S.city) })}</button>`);
  $('wStay').onclick = () => { closeModal(); };
  if (nxt) $('wNext').onclick = () => { closeModal(); save(); inGame = false; RNG = Math.random; resetRuntime(); const p = profile(); p.last = nxt; try { localStorage.setItem('ahq_profile', JSON.stringify(p)); } catch (e) {} mapCity = nxt; openBrief(); };
}
function checkGoals() {
  if (S.mode !== 'career') return;
  const prev = S.stars;
  const wasStars = S.stars;
  while (S.stars < 3 && GOALS[S.stars].ok(S)) { S.stars++; addKudos(20); }
  if (wasStars === 0 && S.stars > 0) for (const [k, C] of Object.entries(CITIES)) if (C.unlock === (S.city || 'london')) setTimeout(() => { chat(t('from.hq'), t('unl.city', { city: t('city.' + k) }), '🌍'); toast('🌍 ' + t('unl.city', { city: t('city.' + k) }), 4000); }, 1500);
  if (S.stars > prev && S.stars >= 3 && prev < 3) { save(); AU.sfx('star'); say('star', t('win.title', { city: t('city.' + S.city) }), 0); cityVictory(); return; }
  if (S.stars > prev) {
    save();
    AU.sfx('star'); say('star', S.stars === 1 ? t('star.one') : t('star.many', { n: S.stars }), 0);
    modal(`<div style="font-size:46px">${'⭐'.repeat(S.stars)}</div><h2>${S.stars === 1 ? t('star.one', { city: t('city.' + S.city) }) : t('star.many', { n: S.stars, city: t('city.' + S.city) })}</h2><p>${(() => { const nx = Object.keys(CITIES).find((k) => CITIES[k].unlock === S.city); return S.stars === 1 && nx ? t('star.oneP', { next: t('city.' + nx) }) : t('star.manyP', { city: t('city.' + S.city) }); })()}</p>
    <div class="receipt"><div><span>${t('rc.helped')}</span><span>${S.served}</span></div><div><span>${t('rc.vibes')}</span><span>${Math.round(S.vibes)}%</span></div><div><span>${t('rc.cash')}</span><span>${money(S.cash)}</span></div><div><span>${t('rc.days')}</span><span>${S.day}</span></div></div>
    <p style="font-size:13px">${t('star.share')}</p><button class="btn g" id="mOk" style="width:100%">${t('star.keep')}</button>`);
    $('mOk').onclick = () => { closeModal(); showUnlocks(prev, S.stars); };
  }
}
const UNL_TIPS = { pharmacy: ['unlBuild', 'nBuild'], glowup: ['unlBuild', 'nBuild'], social: ['unlBuild', 'nBuild'], parent: ['unlBuild', 'nBuild'], therapy: ['unlBuild', 'nBuild'], moving: ['unlBuild', 'nBuild'], career: ['unlBuild', 'nBuild'], maint: ['unlStaff', 'nStaff'], lab: ['unlBuild', 'nBuild'], annex: ['unlAnnex', null] };
function showUnlocks(from, to) {
  const items = Object.keys(UNLOCK).filter((k) => UNLOCK[k] > from && UNLOCK[k] <= to && t('unl.' + k) !== 'unl.' + k);
  if (!items.length) return;
  modal(`<div style="font-size:46px">🎉</div><h2>${t('unl.title')}</h2><p>${t('unl.p')}</p>${items.map((k) => `<div class="msg" style="text-align:left">${t('unl.' + k)}</div>`).join('')}<button class="btn g" id="mOk" style="width:100%">${t('unl.ok')}</button>`);
  $('mOk').onclick = () => { closeModal(); const seen = new Set(); for (const k of items) { const [tk, tg] = UNL_TIPS[k]; if (!seen.has(tk)) { seen.add(tk); tip(tk, tg, true); } } };
}
// what the next bill will be, from today
function billInfo() { const toRent = RENT_EVERY - ((S.day - 1) % RENT_EVERY), wages = Math.round(S.staff.reduce((a, s) => a + s.wage, 0) * WAGE_K), elec = elecPerDay() * ELEC_K * RENT_EVERY, loanPay = S.loan ? Math.min(S.loan.left, S.loan.per) : 0; return { toRent, total: RENT + wages + elec + loanPay }; }
// a heads-up 2 days and 1 day before bills when the cash won't cover them
function billWarn() {
  if (S.mode !== 'career') return; const b = billInfo(); if (b.toRent > 2 || b.toRent === RENT_EVERY) return;
  if (S.cash >= b.total) return; const short = b.total - S.cash, fatal = S.cash - b.total < -5000;
  const msg = t(fatal ? 'bills.warnFatal' : 'bills.warn', { n: b.toRent, m: money(short) });
  toast('⚠️ ' + msg, 5000); say('billwarn', msg, 0); chat(t('from.hq'), msg + ' ' + t('bills.tapHint'), '🧾'); AU.sfx('bad');
}
// losing: say exactly why, with the numbers, before leaving the city
function gameOver(why = {}) {
  const r = (a, b) => `<div><span>${a}</span><span>${b}</span></div>`;
  modal(`<div style="font-size:46px">💀</div><h2>${t('over.title')}</h2><p><b>${t('over.why', { m: money(S.cash), lim: money(-5000) })}</b></p>
    <div class="receipt">${why.bill ? r('🧾 ' + t('over.bill'), '-' + money(why.bill)) + r('&nbsp;&nbsp;🏠 ' + t('rent.rent'), '-' + money(why.rent)) + r('&nbsp;&nbsp;👥 ' + t('rent.wages'), '-' + money(why.wages)) + r('&nbsp;&nbsp;⚡ ' + t('bill.elec'), '-' + money(why.elec)) + (why.loanPay ? r('&nbsp;&nbsp;🏦 ' + t('loan.pay'), '-' + money(why.loanPay)) : '') : ''}${why.wk != null ? r('💰 ' + t('over.week'), money(why.wk)) : ''}${r(t('rc.helped'), S.served)}${r(t('rc.days'), S.day)}</div>
    <p style="font-size:13px">💡 ${t(why.wages > (why.wk || 0) ? 'over.tipWages' : 'over.tipEarn')}</p><p style="font-size:13px">${t('over.p', { n: S.served })}</p>
    <button class="btn g" id="mOk" style="width:100%">${t('over.btn')}</button><button class="btn w" id="mMap" style="width:100%;margin-top:8px">🌍 ${t('over.map')}</button>`);
  $('mOk').onclick = () => { closeModal(); startNew(S.city); };
  $('mMap').onclick = () => { closeModal(); inGame = false; toMap(); };
}
function updateHUD() {
  if (S && $('hTemp')) { const T = S.temp; if (S.mode !== 'career' || T == null) $('hTemp').textContent = ''; else { $('hTemp').textContent = '🌡️ ' + Math.round(T) + '°C'; $('hTemp').style.color = T < T_LO ? '#2F7FD1' : T > T_HI ? '#C0362C' : '#1E8A3A'; } }
  const q = S.mode !== 'career';
  if (q) {
    const s = Math.max(0, Math.ceil(S.qt)); $('hDay').textContent = t('quick.time') + ' ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    $('hDayBar').style.width = (S.qt / QUICK_LEN * 100) + '%'; $('hRent').textContent = t('hud.score') + ' ' + quickScore();
  } else {
    $('hDay').textContent = (t('city.' + (S.city || 'london')) + ' · ' + dayN(S.day)).toUpperCase() + (S.rainy ? ' 🌧️' : '') + (isNight() ? ' 🌙' : '');
  if (cityOf().night) { const ex = isNight() ? 0.72 : 0.95; if (!(S.ev && S.ev.k === 'power') && Math.abs(renderer.toneMappingExposure - ex) > 0.01) renderer.toneMappingExposure += (ex - renderer.toneMappingExposure) * 0.05; }
    $('hDayBar').style.width = (S.t / DAY_LEN * 100) + '%';
    const toRent = RENT_EVERY - ((S.day - 1) % RENT_EVERY);
    $('hRent').textContent = toRent === RENT_EVERY && S.day > 1 ? t('hud.rentPaid') : toRent === 1 ? t('hud.rentIn1') : t('hud.rentIn', { n: toRent });
    { const short = toRent <= 3 && toRent !== RENT_EVERY && S.cash < billInfo().total; $('hRent').style.color = short ? '#C0362C' : ''; $('hRent').textContent = (short ? '⚠️ ' : '') + $('hRent').textContent; if (S.daily && !S.daily.lost) $('hRent').textContent += S.daily.won ? ' · 🎯✅' : S.daily.k === 'cure' ? ` · 🎯 ${S.daily.c}/${S.daily.n}` : S.daily.k === 'calm' ? (S.daily.fail ? ' · 🎯❌' : ' · 🎯😌') : ` · 🎯 ${S.daily.n}%`; }
  }
  $('hCash').textContent = money(S.cash); $('hCash').style.color = S.cash < 0 ? 'var(--red)' : '';
  $('hVibes').innerHTML = '<span class="stars">★</span> ' + Math.round(S.vibes) + '%';
  const ec = $('emchip');
  if (!S.em && S.ev) { ec.style.display = 'block'; ec.style.borderLeftColor = '#FF9F43'; ec.textContent = EVENTS[S.ev.k].e + ' ' + (S.ev.k === 'leak' ? t('ev.leak', { room: rn((R.rooms[S.ev.room] || {}).type || 'budget') }) : t('ev.hud', { name: t('ev.' + S.ev.k), t: Math.ceil(S.ev.t) + 's' })); }
  else if (!S.em && S.ad) { ec.style.display = 'block'; ec.style.borderLeftColor = '#16963C'; ec.textContent = ADS[S.ad.k].e + ' ' + t('mk.active', { name: t('mk.' + S.ad.k), t: Math.ceil(S.ad.t) + 's' }); }
  else if (S.em) { ec.style.borderLeftColor = ''; const s = Math.max(0, Math.ceil(S.em.t)); ec.style.display = 'block'; ec.textContent = '🚨 ' + t('em.hud', { name: t('em.' + S.em.k), a: S.em.got, b: S.em.need, t: Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') }); }
  else ec.style.display = 'none';
}
function step(dt, now = performance.now(), rdt = dt) {
  dayTick(dt); if (!inGame) return; probIntroTick(rdt); behTick(dt); laterTick(dt); caseTick(); tempTick(dt); quakeTick(dt); doomers = beh('slowdoom') ? R.visitors.filter((u) => DOOM.has(u.prob) && !u.cured && u.path && u.path.length) : [];
  spawnT -= dt;
  if (spawnT <= 0 && S.mode === 'career' && cityOf().groups && cityOf().groups.kind === 'families' && RNG() < cityOf().groups.chance && R.visitors.length < 15) { const kp = ['toddler', 'schoolrun', 'tablet', 'homework', 'sugar']; famNext = true; const pr = spawnVisitor(unlocked('parent') ? rnd(kp) : undefined); famNext = false; const gid = S.nextId++; S.gs = S.gs || {}; S.gs[gid] = 1; pr.gid = gid; spawnT = 9; }
  else if (spawnT <= 0 && S.mode === 'career' && cityOf().groups && cityOf().groups.kind !== 'families' && RNG() < cityOf().groups.chance && R.visitors.length < 15) { const pr = spawnVisitor(); const gid = S.nextId++; S.gs = S.gs || {}; const n = 2 + (RNG() < 0.4 ? 1 : 0); S.gs[gid] = n; pr.gid = gid; for (let i = 1; i < n; i++) { const o = spawnVisitor(pr.prob); o.gid = gid; } spawnT = 9; }
  if (spawnT <= 0) { const base = S.mode === 'career' ? 5.6 : 4.2; spawnT = (base / (0.6 + S.vibes / 100)) * (0.7 + RNG() * 0.6) / adMul() * Math.pow(S.price || 1, 1.2) / (cityOf().waves && S.mode === 'career' ? 1 + 0.7 * Math.sin(S.t / 9) : 1) / (cityOf().evening && S.mode === 'career' ? (S.t > DAY_LEN * 0.6 ? 1.7 : S.t < DAY_LEN * 0.35 ? 0.75 : 1) : 1); if (R.visitors.length < (S.ad ? 24 : 18)) spawnVisitor(); }
  adUpdate(dt);
  for (const v of R.visitors.slice()) visitorUpdate(v, dt);
  for (const rs of R.staff) {
    if (rs.mode === 'walk') { if (stepWalker(rs, dt, 2.6)) { rs.mode = rs.onBreak ? 'break' : rs.data.role === 'maint' ? 'free' : 'there'; settle(rs, rs.target); rs.busyPose = null; } }
    else if (rs.mode === 'there') staffAttend(rs, dt);
    else if (rs.target && !rs.target.sit) rs.av.userData.p.body.position.y = Math.sin(now / 400 + rs.data.id) * 0.015;
    staffEnergy(rs, dt);
    if (rs.data.role === 'maint' && !rs.onBreak) maintUpdate(rs, dt);
  }
  doorsUpdate(dt); staffCover(dt); mgrUpdate(dt); if (S.pepT > 0) S.pepT -= dt; if (S.pepCd > 0) S.pepCd -= dt;
  pestUpdate(dt); inspectorUpdate(dt); emergencyUpdate(dt); researchUpdate(dt); eventUpdate(dt); decorUpdate(dt); checkGoals();
  saveT += rdt; if (saveT > 3) { saveT = 0; save(); }
}
const fpsW = { t: 0, n: 0, sum: 0, done: false };
function fpsWatch(rdt) {
  if (fpsW.done || GFX.pref !== 'auto' || !inGame || document.hidden) return;
  fpsW.t += rdt; fpsW.n++; fpsW.sum += rdt; if (fpsW.t < 8) return;
  const avg = fpsW.sum / fpsW.n; fpsW.t = fpsW.n = fpsW.sum = 0;
  if (avg > 0.05) { fpsW.done = true; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); try { localStorage.setItem('ahq_gfx_hint2', 'low'); } catch (e) {} if (!GFX.low) toast('🖥️ ' + t('gfx.slow'), 3500); }
}
function loop(now) {
  const rdt = Math.min(0.1, (now - last) / 1000); last = now; fpsWatch(Math.min(0.5, rdt));
  if (inGame) {
    const dt = sheetPaused || modalPaused || moving || placingR || placingD ? 0 : rdt * speedMul;
    if (dt > 0) { const n = Math.ceil(dt / 0.1); for (let i = 0; i < n; i++) step(dt / n, now, i === 0 ? rdt : 0); }
    if (sel) { selRing.position.set(sel.av.position.x, 0.14, sel.av.position.z); if (Math.floor(now / 250) !== loop.vc) { loop.vc = Math.floor(now / 250); renderVCard(); } }
    camAnim(rdt);
    updateHUD(); updateLabels(); updatePep(); updateTut(); if (Math.floor(now / 300) !== loop.oc) { loop.oc = Math.floor(now / 300); updateObj(); }
  }
  if (world.movers) moveCity(world.movers, rdt * (inGame ? Math.max(speedMul, 0.4) : 0.6));
  if (scMixer) scMixer.update(rdt);
  if (CHAR.active.size) updateCharacters(rdt * (inGame ? (speedMul || 0) : 1));
  if (creating) renderPreview(now);
  renderer.render(scene, cam);
  requestAnimationFrame(loop);
}

// ---------------- quick shift ----------------
function quickScore() { return Math.max(0, S.served * 100 + Math.round(S.earned / 10) - S.left * 50); }
function startQuick(daily) {
  const d = new Date(); const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  RNG = daily ? mulberry32(+ds.replace(/-/g, '')) : Math.random;
  S = newState(); S.mode = daily ? 'daily' : 'quick'; S.date = ds; S.cash = 3000; S.city = 'london';
  S.rooms = [{ id: S.nextId++, type: 'nap', size: 'm', x: -3.5, z: -3.5, a: Math.PI / 2 }, { id: S.nextId++, type: 'budget', size: 'm', x: 3.5, z: -3.5, a: 0 }, { id: S.nextId++, type: 'detox', size: 'm', x: -3.5, z: 3.5, a: Math.PI / 2 }];
  const mk = (role, name, skill, look) => { const c = makeCandidate(role); c.name = name; c.skill = skill; c.id = S.nextId++; if (look) c.look = { ...c.look, ...look }; return c; };
  S.staff = [mk('host', 'Amara Okafor', 3, { skin: SKIN[3], hair: '#1C120C', style: 'curly' }), mk('coach', 'Priya Shah', 3), mk('guide', 'Leo Rossi', 3), mk('guide', 'Hana Ito', 2), mk('maint', 'Sam Brown', 2)];
  startGame();
  chat(t('from.hq'), t('quick.start'), '⏱️'); S.unread = 0; updateBadge();
  toast(daily ? t('daily.title', { date: ds }) : t('quick.start'), 3000);
}
function endQuick() {
  const sc = quickScore(); let best = 0; const key = 'ahq_best_' + S.mode + (S.mode === 'daily' ? S.date : '');
  try { best = +localStorage.getItem(key) || 0; if (sc > best) localStorage.setItem(key, sc); } catch (e) {}
  inGame = false;
  modal(`<div style="font-size:46px">⏱️</div><h2>${t('quick.end')}</h2>${S.mode === 'daily' ? `<p>${t('daily.title', { date: S.date })}</p>` : ''}<div style="font-family:Fredoka;font-size:44px;font-weight:700;color:var(--green)">${sc.toLocaleString('en-US')}</div><p>${t('quick.score')} · best ${Math.max(best, sc).toLocaleString('en-US')}</p>${receipt()}<p style="font-size:13px">${t('star.share')}</p>
  <div class="row2"><button class="btn y" id="qMenu">${t('menu.quit')}</button><button class="btn g" id="qAgain">${t('quick.again')}</button></div>`);
  const mode = S.mode;
  $('qMenu').onclick = () => { closeModal(); toTitle(); };
  $('qAgain').onclick = () => { closeModal(); startQuick(mode === 'daily'); };
}


// ---------------- manager (player avatar) ----------------
const OUTFITS = ['hoodie', 'suit', 'blazer', 'street', 'dress', 'cardigan'];
const OCOLS = ['#16963C', '#1F74C4', '#E9785F', '#7F68C9', '#2F3A52', '#FF8FAB', '#F2C14E', '#2BB5A6'];
const BODY = { slim: 0.88, mid: 1, broad: 1.16 }, HEIGHT = { short: 0.9, mid: 1, tall: 1.1 };
function randomMgr(keepName) {
  return { name: keepName || '', pron: Math.random() < 0.5 ? 'm' : 'f', model: crnd(MGR_MODELS), skin: crnd(SKIN), hair: crnd(HAIR), style: crnd(STYLES), outfit: crnd(OUTFITS), ocol: crnd(OCOLS), body: crnd(Object.keys(BODY)), height: crnd(Object.keys(HEIGHT)), glasses: Math.random() < 0.3 };
}
function loadMgr() { try { const m = JSON.parse(localStorage.getItem('ahq_mgr')); if (m && m.skin) return m; } catch (e) {} return null; }
function saveMgr(m) { try { localStorage.setItem('ahq_mgr', JSON.stringify(m)); } catch (e) {} }
const MGR_MODELS = ['mgr_f', 'mgr_h', 'mgr_f2', 'mgr_h2'];
function defaultModel(m) { const dark = SKIN.indexOf(m.skin) >= 3; return (m.pron === 'm' ? 'mgr_h' : 'mgr_f') + (dark ? '2' : ''); }
let MGR = loadMgr() || Object.assign(randomMgr(), { name: 'Boss' }); if (!MGR.model) MGR.model = defaultModel(MGR); if (MGR.pron !== 'm' && MGR.pron !== 'f') MGR.pron = MGR.model.startsWith('mgr_h') ? 'm' : 'f';
function mgrLook(m) {
  const c = m.ocol, L = { skin: m.skin, hair: m.hair, style: m.style, glasses: m.glasses, wide: BODY[m.body] || 1, tall: HEIGHT[m.height] || 1, shirt: c, pants: '#2F3A52', shoes: '#2A2A2E' };
  L.outfit = m.outfit; L.model = m.model;
  if (m.outfit === 'hoodie') Object.assign(L, { hood: true, pants: '#3B4A6B', shoes: '#F4EFE6' });
  if (m.outfit === 'suit') Object.assign(L, { pants: c, inner: '#FFFFFF', tie: c === '#E9785F' ? '#2F3A52' : '#D93A3F' });
  if (m.outfit === 'blazer') Object.assign(L, { inner: '#F4EFE6', pants: '#2F3A52' });
  if (m.outfit === 'street') Object.assign(L, { pants: '#5E6B3A', shoes: '#F4EFE6', cap: m.style === 'hijab' ? null : '#2F3A52' });
  if (m.outfit === 'dress') Object.assign(L, { skirt: c, pants: '#3A2E2E', shoes: '#8B6A45' });
  if (m.outfit === 'cardigan') Object.assign(L, { inner: '#F4EFE6', pants: '#8A9AB0', shoes: '#8B6A45' });
  return L;
}
function mgrPortrait() {
  const key = 'mgr' + JSON.stringify(MGR); if (portraits[key]) return portraits[key];
  pScene.background = new THREE.Color('#FFE9A8');
  const L = mgrLook(MGR); const p = person(L, 'manager'); p.rotation.y = 0.25; pScene.add(p);
  if (p.userData.p.glb) p.userData.p.anim.update(0.05); p.updateMatrixWorld(true); const hy = p.userData.p.head.getWorldPosition(new THREE.Vector3()).y + 0.04;
  pCam.position.set(0.15, hy + 0.1, 2.3); pCam.lookAt(0, hy - 0.18, 0);
  portraitR.render(pScene, pCam); portraits[key] = portraitR.domElement.toDataURL('image/jpeg', 0.85); pScene.remove(p);
  return portraits[key];
}
const MGR_SPOTS = [{ x: 3.6, z: 1.3 }, { x: 1.8, z: 2.4 }, { x: 4.4, z: 3.0 }, { x: 2.6, z: 5.4 }, { x: 5.6, z: 2.2 }];
function spawnManager() {
  const sp = mgrSpot(); const av = person(mgrLook(MGR), 'manager'); av.position.set(sp.x, 0.1, sp.z); av.rotation.y = Math.PI / 4; scene.add(av);
  R.mgr = { av, path: [], ph: 0, cheer: 0, task: null }; S.mgrHelp = null; S.mgrCd = S.mgrCd || 0;
  $('pepImg').src = mgrPortrait();
}
function mgrUpdate(dt) {
  const M = R.mgr; if (!M) return; const p = M.av.userData.p;
  if (S.mgrCd > 0) S.mgrCd -= dt; if (S.mgrHelp) { S.mgrHelp.t -= dt; if (S.mgrHelp.t <= 0) { S.mgrHelp = null; mgrHome(); } }
  auraRing.visible = false; if (M.autoCd > 0) M.autoCd -= dt;
  if (M.cheer > 0 && p.anim) { if (p.anim.state !== 'cheer') p.anim.set('cheer'); M.cheer -= dt; if (M.cheer <= 0) poseStand(p); return; }
  if (M.cheer > 0) { M.cheer -= dt; p.arms.forEach((a) => { a.rotation.x = -2.8; a.rotation.z = 0; }); p.body.position.y = Math.abs(Math.sin(M.cheer * 9)) * 0.18; if (M.cheer <= 0) poseStand(p); return; }
  if (M.path.length) { if (stepWalker(M, dt, 3.4)) { poseStand(p); mgrArrive(); } return; }
  if (M.look) turnTo(M.av, M.look, dt, 4);
  if (!M.task && !S.mgrHelp) { M.idleT = (M.idleT || 0) - dt; if (M.idleT <= 0) mgrThink(); }
}
// The boss does rounds: firefights on their own (angriest visitor, longest room queue, desk rush), otherwise walks from room to room.
function mgrThink() {
  const M = R.mgr; if (!M) return; M.idleT = 2;
  if (S.mgrAuto !== false && !(M.autoCd > 0)) {
    const mad = R.visitors.filter((v) => ['wait', 'queue', 'toWait'].includes(v.state) && v.pat < 0.3 && !v.prio).sort((a, b) => a.pat - b.pat)[0];
    if (mad) { mgrGo({ kind: 'v', v: mad }, true); return; }
    const rq = Object.values(R.rooms).filter((r) => !r.closed && ROOMS[r.type].role && r.staff.some(Boolean)).map((r) => [r, roomQ(r.id).length]).sort((a, b) => b[1] - a[1])[0];
    if (rq && rq[1] >= 3) { mgrGo({ kind: 'room', id: rq[0].id }, true); return; }
    if (allQ() >= 5 && R.staff.some((x) => x.at === 'desk')) { mgrGo({ kind: 'desk' }, true); return; }
  }
  // patrol: visit a staffed room (or the lobby), have a look, move on
  const rooms = Object.values(R.rooms).filter((r) => r.id !== M.lastRoom);
  if (rooms.length && RNG() < 0.8) { const r = rnd(rooms); M.lastRoom = r.id; const d = doorPt(r.def, 0.9); M.task = { kind: 'patrol', id: r.id }; M.look = Math.atan2(r.cx - d.x, r.cz - d.z); setPath(M, findPath(M.av.position, d)); }
  else { M.task = { kind: 'patrol' }; M.look = null; setPath(M, findPath(M.av.position, { x: 1.8 + RNG() * 3.6, z: 1.8 + RNG() * 3.6 })); }
}
const boost = () => (S && S.pepT > 0 ? 1.2 : 1);
function pepTalk() {
  if (!inGame || !R.mgr) return;
  if (S.pepCd > 0) { toast(t('pep.cd', { s: Math.ceil(S.pepCd) }), 1200); return; }
  S.pepT = 30; S.pepCd = 120; S.pepUsed = true; R.mgr.cheer = 1.6;
  toast('📣 ' + t('pep.go'), 2200);
  chat(t('pep.from', { name: MGR.name }), crnd(tList('pep.lines')), '📣');
  for (const rs of R.staff) floatAt(rs.av.position, '💪');
}
function updatePep() {
  const b = $('pep'); if (!S) return;
  b.style.setProperty('--p', S.pepCd > 0 ? Math.round(S.pepCd / 120 * 100) + '%' : '0%');
  b.classList.toggle('boost', S.pepT > 0);
}
$('pep').onclick = () => openMgr();

// ---------------- create manager screen ----------------
let creating = false, crAfter = 'map', draft = null;
let pvR = null;
function pvInit() {
  if (pvR) return; const c = document.createElement('canvas'); c.id = 'pc'; $('pcWrap').appendChild(c);
  pvR = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true });
  pvR.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); pvR.outputColorSpace = THREE.SRGBColorSpace; pvR.toneMapping = THREE.ACESFilmicToneMapping; pvR.shadowMap.enabled = true;
}
function pvFree() { if (!pvR) return; pvR.dispose(); pvR.forceContextLoss(); pvR.domElement.remove(); pvR = null; }
const pvScene = new THREE.Scene(); pvScene.add(new THREE.HemisphereLight('#ffffff', '#b8ae9f', 1.1));
const pvSun = new THREE.DirectionalLight('#fff1dc', 2.4); pvSun.position.set(3, 5, 6); pvSun.castShadow = true; pvScene.add(pvSun);
const pvFloor = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 40), mat('#FFFFFF', { r: 0.6 })); pvFloor.position.y = -0.06; pvFloor.receiveShadow = true; pvScene.add(pvFloor);
const pvCam = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
let pvAv = null;
function rebuildPreview() {
  if (pvAv) pvScene.remove(pvAv);
  const L = mgrLook(draft); pvAv = person(L, 'manager'); pvAv.position.y = 0; pvAv.traverse((m) => { if (m.isMesh) m.castShadow = true; }); pvScene.add(pvAv);
}
function renderPreview(now) {
  if (!pvR) return; const c = pvR.domElement, w = c.clientWidth, h = c.clientHeight; if (!w || !h) return;
  if (c.width !== Math.round(w * pvR.getPixelRatio())) pvR.setSize(w, h, false);
  pvCam.aspect = w / h; pvCam.position.set(0, 1.25, 5.2); pvCam.lookAt(0, 0.85, 0); pvCam.updateProjectionMatrix();
  if (pvAv) { pvAv.rotation.y = Math.sin(now / 1400) * 0.5; const p = pvAv.userData.p; if (!p.glb) p.arms[1].rotation.x = Math.sin(now / 500) * 0.15; }
  pvR.render(pvScene, pvCam);
}
function crRow(label, html) { return `<div class="lbl">${label}</div>${html}`; }
function swatches(key, list) { return `<div class="sw">${list.map((c) => `<button data-k="${key}" data-v="${c}" class="${draft[key] === c ? 'on' : ''}" style="background:${c}"></button>`).join('')}</div>`; }
function chips(key, list, lab) { return `<div class="chips">${list.map((v) => `<button data-k="${key}" data-v="${v}" class="${draft[key] === v ? 'g' : 'w'}">${lab(v)}</button>`).join('')}</div>`; }
function renderCreate() {
  const b = $('crBody');
  b.innerHTML =
    crRow(t('cr.name'), `<input id="crName" maxlength="14" placeholder="${t('cr.namePh')}" value="${(draft.name || '').replace(/"/g, '&quot;')}">`) +
    crRow(t('cr.pron'), chips('pron', ['m', 'f'], (v) => t({ m: 'cr.he', f: 'cr.she' }[v]))) +
    crRow(t('cr.pick'), `<div class="mgrpick">${MGR_MODELS.map((k) => `<button data-k="model" data-v="${k}" class="${draft.model === k ? 'on' : ''}"><img src="assets/${k}.jpg" alt=""></button>`).join('')}</div>`) + '<div style="height:8px"></div>';
  b.querySelectorAll('[data-k]').forEach((el) => el.onclick = () => {
    const k = el.dataset.k; draft.name = $('crName').value.trim(); draft[k] = el.dataset.v;
    const top = b.scrollTop; renderCreate(); b.scrollTop = top; if (k === 'model') rebuildPreview();
  });
  $('crName').oninput = (e) => { draft.name = e.target.value.trim(); };
}
function openCreate(after) {
  crAfter = after; draft = { ...(loadMgr() || randomMgr()) }; if (!draft.model) draft.model = defaultModel(draft); if (draft.pron !== 'm' && draft.pron !== 'f') draft.pron = draft.model.startsWith('mgr_h') ? 'm' : 'f';
  pvInit(); renderCreate(); rebuildPreview(); show('create'); creating = true;
}
$('crRand').onclick = () => { const name = $('crName').value.trim(), pron = draft.pron; draft = randomMgr(name); draft.pron = pron; renderCreate(); rebuildPreview(); };
function refreshMgrModel() { if (creating) rebuildPreview(); if (R.mgr && !R.mgr.av.userData.p.glb && inGame) { const old = R.mgr.av, av = person(mgrLook(MGR), 'manager'); if (av.userData.p.glb) { av.position.copy(old.position); av.rotation.copy(old.rotation); scene.remove(old); scene.add(av); R.mgr.av = av; for (const k in portraits) if (k.startsWith('mgr')) delete portraits[k]; $('pepImg').src = mgrPortrait(); } } }
$('crDone').onclick = () => {
  draft.name = ($('crName').value.trim() || crnd(FIRST)).slice(0, 14);
  MGR = { ...draft }; saveMgr(MGR); creating = false; pvFree();
  if (crAfter === 'map') showMap(); else { refreshTitle(); show('title'); }
};

// ---------------- tutorial & tips ----------------
const TUT = [
  { k: 'tut.0', ok: true },
  { k: 'tut.1', target: 'nBuild', inSheet: ['[data-size]:not([disabled])', '[data-room]'], place: true, done: () => S.rooms.length > 0 },
  { k: 'tut.2', target: 'nStaff', inSheet: ['[data-hire]:not([disabled])', '#toHire', '[data-role]'], done: () => Object.values(R.rooms).every((r) => !ROOMS[r.type].role || r.staff.some(Boolean)) },
  { k: 'tut.3', done: () => S.served >= 1 },
  { k: 'tut.4', target: 'pep', done: () => S.pepUsed },
  { k: 'tut.5', ok: true },
  { k: 'tut.6', target: 'nGoals', inSheet: [], done: () => S.tutGoals },
  // tour of the screen: what each card and tab is for
  { k: 'tut.t1', target: 'hDay', ok: true }, { k: 'tut.t2', target: 'hCash', ok: true }, { k: 'tut.t3', target: 'hVibes', ok: true }, { k: 'tut.t4', target: 'spPause', ok: true },
  { k: 'tut.t5', target: 'nStaff', ok: true }, { k: 'tut.t6', target: 'nResearch', ok: true }, { k: 'tut.t7', target: 'nChat', ok: true }, { k: 'tut.t8', target: 'camMap', ok: true }, { k: 'tut.t9', ok: true },
  { k: 'tut.end', ok: true },
];
let tipShown = null, tipT = 0; const tipQ = [];
function tip(k, target, ok) { if (!S || S.mode !== 'career' || (S.tips[k] && !ok)) return; S.tips[k] = 1; tipQ.push({ k, target, ok }); }
function hideTut() { $('tut').classList.remove('on'); $('tarrow').style.display = 'none'; tipShown = null; }
function amaraImg() { const h = S.staff.find((s) => s.name === 'Amara Okafor') || S.staff.find((s) => s.role === 'host'); return h ? portrait(h) : mgrPortrait(); }
function finishTut() { S.tut = -1; try { localStorage.setItem('ahq_tut_done', '1'); } catch (e) {} hideTut(); save(); }
let tutDrawn = null, tutPre = false;
// 👇 above the target, or 👆 under it when the target sits at the top of the screen
function placeArrow(ar, r) { ar.style.display = 'block'; ar.style.left = (r.left + r.width / 2) + 'px'; const up = r.top < 110; ar.textContent = up ? '👆' : '👇'; ar.style.top = (up ? r.bottom + 46 : r.top - 4) + 'px'; }
function updateTut() {
  const blocked = sheetPaused || modalPaused || !inGame;
  const el = $('tut'), ar = $('tarrow');
  if (S.tut >= 0) {
    const st = TUT[S.tut];
    if (st.done && !tutPre && tutDrawn === S.tut && st.done()) { S.tut++; tutDrawn = null; if (S.tut >= TUT.length) { finishTut(); return; } return; }
    // inside a sheet or while placing: hide the bubble but keep pointing at the next thing to tap
    if (!modalPaused && inGame && st.target && !tutPre && (sheetPaused || placingR)) {
      el.classList.remove('on'); let te = null;
      if (placingR && st.place) te = $('mvOk');
      else if (sheetPaused) for (const q of st.inSheet || []) { te = $('sheet').querySelector(q); if (te) break; }
      const r = te && te.getBoundingClientRect();
      if (r && r.width && r.top > 40 && r.top < innerHeight - 10) placeArrow(ar, r); else ar.style.display = 'none';
      return;
    }
    if (blocked) { el.classList.remove('on'); ar.style.display = 'none'; return; }
    if (tutDrawn !== S.tut) {
      tutDrawn = S.tut; tutPre = !!(st.done && st.done()); const showOk = st.ok || tutPre;
      $('tutImg').src = amaraImg();
      $('tutText').textContent = t(st.k, { name: MGR.name, g: MGR.pron });
      $('tutBtns').innerHTML = (S.tut < TUT.length - 1 ? `<button class="w" id="tutSkip">${t('tut.skip')}</button>` : '') + (showOk ? `<button class="g" id="tutOk">${t('tut.ok')}</button>` : '');
      const sk = $('tutSkip'); if (sk) sk.onclick = finishTut;
      const ok = $('tutOk'); if (ok) ok.onclick = () => { S.tut++; tutDrawn = null; if (S.tut >= TUT.length) finishTut(); };
    }
    el.classList.add('on');
    if (st.target && !tutPre) placeArrow(ar, $(st.target).getBoundingClientRect());
    else ar.style.display = 'none';
    return;
  }
  ar.style.display = 'none';
  if (tipShown) { if (tipShown.target && !blocked) placeArrow(ar, $(tipShown.target).getBoundingClientRect()); if (!tipShown.ok) tipT -= 1 / 60; if (tipT <= 0 || (blocked && !tipShown.ok)) { el.classList.remove('on'); tipShown = null; } else if (blocked) { el.classList.remove('on'); ar.style.display = 'none'; if (tipShown.target && sheetPaused) tipShown = null; } else el.classList.add('on'); return; }
  if (!blocked && tipQ.length) {
    tipShown = tipQ.shift(); tipT = 5.5;
    $('tutImg').src = amaraImg(); $('tutText').textContent = t('tip.' + tipShown.k, { name: MGR.name, g: MGR.pron });
    $('tutBtns').innerHTML = tipShown.ok ? `<button class="g" id="tipX">${t('tut.ok')}</button>` : `<button class="w" id="tipX">✕</button>`; $('tipX').onclick = () => { el.classList.remove('on'); ar.style.display = 'none'; tipShown = null; };
    el.classList.add('on');
  }
}


// ---------------- staff energy, breaks, raises ----------------
function postSpot(rs) { if (rs.at === 'desk') return deskSpot(rs.desk || 0); const room = R.rooms[rs.at]; if (room) return room.staffSpots[rs.st]; if (rs.at === 'maint') return rs.home; return { x: 5.6, z: 1.6, rot: Math.PI / 4, sit: false, y: 0 }; }
function staffEnergy(rs, dt) {
  const d = rs.data; if (d.energy == null) d.energy = 1;
  if (d.sadT > 0) d.sadT -= dt;
  if (d.awayT > 0) {
    d.awayT -= dt; rs.av.visible = false; rs.mode = 'away';
    if (d.awayT <= 0) { d.awayT = 0; rs.av.visible = true; rs.av.position.set(3, 0.1, 11); d.energy = 1; goStaff(rs, postSpot(rs)); chat(d.name + ' · ' + roleN(d.role), t('life.back', { name: d.name.split(' ')[0] }), '👋'); }
    return;
  }
  if (rs.onBreak) {
    if (rs.mode === 'break') { d.energy = Math.min(1, d.energy + dt / 22); if (d.energy >= 1) { rs.onBreak.busy = null; rs.onBreak = null; goStaff(rs, postSpot(rs)); } }
  } else if (rs.mode === 'there' || rs.task) {
    if (rs.at !== 'idle') d.energy = Math.max(0.05, d.energy - dt * (cityOf().altitude ? 1.15 : 1) * (S.temp > 26 ? 1 + 0.05 * Math.min(S.temp - 26, 10) : 1) / (150 * (d.traits.includes('Gym Rat') ? 1.3 : 1) * (d.wfh ? 1.3 : 1) / (cityOf().night ? 1.25 : 1)));
    if (d.energy < 0.25) {
      const spot = Object.values(R.rooms).filter((r) => ROOMS[r.type].staffOnly).map((r) => r.spots.find((s) => !s.busy)).find(Boolean);
      if (spot && !rs.task) { spot.busy = rs; rs.onBreak = spot; rs.goingTo = null; goStaff(rs, spot); tip('break'); }
      else if (!hasRoom('staffroom')) { tip('tired'); if (Math.random() < dt * 0.01) chat(d.name + ' · ' + roleN(d.role), t('staff.tiredChat'), '😮‍💨'); }
    }
  }
  if (!rs.zz) { rs.zz = new THREE.Sprite(iconTex('😮‍💨')); rs.zz.scale.set(0.5, 0.5, 1); rs.zz.position.y = 2.3; rs.zz.renderOrder = 10; rs.av.add(rs.zz); }
  rs.zz.material = iconTex(rs.onBreak ? '☕' : d.sadT > 0 ? '💔' : '😮‍💨'); rs.zz.visible = !!rs.onBreak || d.energy < 0.25 || d.sadT > 0;
}
function raiseRequest() {
  const cand = S.staff.filter((s) => s.skill >= 2 && !s.grumpy && (s.raiseDay == null || s.raiseDay < S.day - 5)); if (!cand.length) return;
  const st = crnd(cand), up = Math.round(st.wage * 0.1 / 10) * 10; st.raiseDay = S.day;
  modal(`<img src="${portrait(st)}" style="width:80px;height:80px;border-radius:20px"><h2>${t('raise.title', { name: st.name.split(' ')[0] })}</h2><p>${t('raise.p', { m: money(up) })}</p><div class="row2" style="margin-top:10px"><button class="btn y" id="rNo">${t('raise.no')}</button><button class="btn g" id="rYes">${t('raise.yes')}</button></div>`);
  $('rYes').onclick = () => { closeModal(); st.wage += up; st.energy = 1; toast(t('raise.ok', { name: st.name.split(' ')[0] })); save(); };
  $('rNo').onclick = () => { closeModal(); st.grumpy = S.day; chat(st.name + ' · ' + roleN(st.role), t('raise.grumpy', { name: st.name.split(' ')[0] }), '😒'); save(); };
}
function lifeEvent() {
  const cand = S.staff.filter((s) => !(s.awayT > 0) && (s.lifeDay == null || s.lifeDay < S.day - 6)); if (!cand.length) return;
  const st = crnd(cand), first = st.name.split(' ')[0], k = crnd(st.wfh ? ['break', 'baby'] : ['break', 'baby', 'wfh']); st.lifeDay = S.day;
  const say = (ok) => chat(st.name + ' · ' + roleN(st.role), t(ok ? 'life.okChat' : 'life.noChat'), ok ? '🥹' : '😒');
  const btns = { break: [['life.breakOff', 'g', () => { st.awayT = DAY_LEN * 0.5; say(true); }], ['life.breakStay', 'y', () => { st.sadT = DAY_LEN; }]],
    baby: [['life.babyPaid', 'g', () => { st.awayT = DAY_LEN * 2; S.vibes = clamp(S.vibes + 2, 0, 100); chat(st.name + ' · ' + roleN(st.role), t('life.babyChat'), '👶'); }], ['life.babyUnpaid', 'y', () => { st.awayT = DAY_LEN * 2; S.cash += Math.round(st.wage * 0.5); if (Math.random() < 0.5) st.grumpy = S.day; say(false); }]],
    wfh: [['life.wfhYes', 'g', () => { st.wfh = true; say(true); }], ['life.wfhNo', 'y', () => { if (Math.random() < 0.5) st.grumpy = S.day; say(false); }]] }[k];
  modal(`<img src="${portrait(st)}" style="width:80px;height:80px;border-radius:20px"><h2>${t('life.' + k + 'T', { name: first })}</h2><p>${t('life.' + k + 'P')}</p>` + btns.map(([lk, c], i) => `<button class="btn ${c}" id="lf${i}" style="width:100%;margin-top:8px">${t(lk)}</button>`).join(''));
  btns.forEach(([, , fn], i) => { $('lf' + i).onclick = () => { closeModal(); fn(); save(); }; });
}
function poachCheck() {
  for (const st of S.staff.slice()) if (st.grumpy && st.grumpy < S.day && Math.random() < 0.4) { chat(t('from.hq'), t('poach.left', { name: st.name }), '😭'); fire(st.id, true); return; }
}

// ---------------- equipment, decor, kudos ----------------
const DECOR = { radiator: { cost: 400, e: '🔥', calm: 1, vibe: 0, temp: 1 }, aircon: { cost: 600, e: '❄️', calm: 1, vibe: 0, temp: -1 }, plant: { cost: 150, e: '🪴', calm: 0.94, vibe: 0.0015 }, neon: { cost: 300, e: '💡', calm: 0.96, vibe: 0.002 }, vending: { cost: 600, e: '🥤', calm: 0.9, vibe: 0 }, massage: { kd: 15, e: '💆', calm: 0.8, vibe: 0.001 }, gold: { kd: 10, e: '🌟', calm: 0.92, vibe: 0.005 } };
function profile() { try { return JSON.parse(localStorage.getItem('ahq_profile')) || { kudos: 0 }; } catch (e) { return { kudos: 0 }; } }
function kudos() { return profile().kudos || 0; }
function addKudos(n) { if (S.mode !== 'career') return; const p = profile(); p.kudos = (p.kudos || 0) + n; try { localStorage.setItem('ahq_profile', JSON.stringify(p)); } catch (e) {} toast(t('kd.got', { n }), 1800); }
function decorMesh(k) {
  const g = new THREE.Group();
  if (k === 'plant' || k === 'gold') { const pl = plant(0, 0, k === 'gold' ? 1.3 : 1.15, k === 'gold' ? '#E3B341' : '#FFFFFF', g); pl.position.y = 0; if (k === 'gold') pl.traverse((m) => { if (m.isMesh && m.geometry.type === 'SphereGeometry') m.material = mat('#F2C14E', { m: 0.6, r: 0.3, e: '#FFD25E', ei: 0.25 }); }); }
  if (k === 'radiator') { for (let i = -3; i <= 3; i++) put(rbox(0.12, 0.7, 0.14, '#F4F2EE', 0.04), i * 0.14, 0.55, 0, g); put(rbox(1.05, 0.06, 0.16, '#E3E0DA', 0.02), 0, 0.92, 0, g); for (const x of [-0.42, 0.42]) put(cyl(0.025, 0.025, 0.2, '#8A8E96'), x, 0.12, 0, g); put(sph(0.05, '#E9785F', { e: '#E9785F', ei: 0.8 }), 0.48, 0.7, 0.08, g); glbSwap(g, 'radiator', { len: 1.1 }); }
  if (k === 'aircon') { put(rbox(0.55, 1.5, 0.4, '#F4F2EE', 0.08), 0, 0.8, 0, g); for (let i = 0; i < 5; i++) put(rbox(0.42, 0.03, 0.02, '#BFC6CE', 0.01), 0, 1.15 + i * 0.07, 0.21, g); put(rbox(0.4, 0.06, 0.02, '#5AB8F0', 0.01, { e: '#5AB8F0', ei: 0.9 }), 0, 0.55, 0.21, g); glbSwap(g, 'aircon', { h: 1.15 }); }
  if (k === 'neon') { put(rbox(1.3, 0.5, 0.08, '#2F3A52', 0.04), 0, 1.7, 0, g); put(rbox(1.1, 0.12, 0.05, '#FF8FAB', 0.02, { e: '#FF8FAB', ei: 1.5 }), 0, 1.75, 0.05, g); put(cyl(0.03, 0.03, 1.5, '#2F3A52'), 0, 0.8, 0, g); }
  if (k === 'vending') { put(rbox(0.9, 1.8, 0.7, '#E9785F', 0.06), 0, 0.95, 0, g); put(rbox(0.6, 1.0, 0.04, '#BFE6F6', 0.02, { e: '#BFE6F6', ei: 0.4 }), -0.08, 1.15, 0.36, g); for (let i = 0; i < 6; i++) put(cyl(0.05, 0.05, 0.16, ['#FFD25E', '#7ACB4E', '#5AB8F0'][i % 3]), -0.25 + (i % 3) * 0.17, 0.85 + Math.floor(i / 3) * 0.35, 0.3, g); }
  if (k === 'massage') { put(rbox(0.8, 0.5, 0.9, '#3B4A6B', 0.15), 0, 0.35, 0, g); put(rbox(0.8, 0.9, 0.25, '#3B4A6B', 0.12), 0, 0.85, -0.35, g); put(rbox(0.3, 0.15, 0.6, '#B57BE8', 0.06), 0.45, 0.65, 0, g); }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; } });
  return g;
}
function buildDecor(d) { if (world.decor[d.id]) scene.remove(world.decor[d.id]); const m = decorMesh(d.k); m.position.set(d.x, 0.1, d.z); m.rotation.y = d.r || 0; m.traverse((o) => { o.userData.decorId = d.id; }); scene.add(m); world.decor[d.id] = m; }
function decorCalm(v) { let f = 1; for (const d of S.decor || []) if (Math.hypot(d.x - v.av.position.x, d.z - v.av.position.z) < 2.6) f *= DECOR[d.k].calm; return Math.max(0.55, f); }
let decorT = 0;
function decorUpdate(dt) {
  for (const d of S.decor || []) S.vibes = clamp(S.vibes + DECOR[d.k].vibe * dt, 0, 100);
  decorT += dt; if (decorT < 8) return; decorT = 0;
  for (const d of S.decor || []) if (d.k === 'vending') { const near = R.visitors.filter((v) => ['wait', 'queue'].includes(v.state) && Math.hypot(d.x - v.av.position.x, d.z - v.av.position.z) < 3.5).length; if (near) { const m = near * 4; S.cash += m; S.earned += m; floatAt({ x: d.x, y: 0.5, z: d.z }, '+' + money(m)); } }
}
function decorValid(x, z, id) {
  if (!inFloor(x, z) || !inFloor(x + 0.3, z) || !inFloor(x - 0.3, z) || !inFloor(x, z + 0.3) || !inFloor(x, z - 0.3)) return false;
  if (S.rooms.some((r) => { const q = roomRect(r); return x > q.x0 - 0.3 && x < q.x1 + 0.3 && z > q.z0 - 0.3 && z < q.z1 + 0.3; })) return false;
  if (Math.hypot(x - S.desk.x, z - S.desk.z) < 1.6) return false;
  return !(S.decor || []).some((d) => d.id !== id && Math.hypot(d.x - x, d.z - z) < 0.9);
}
let placingD = null;
function startDecor(k, edit) {
  closeSheet(); selectVisitor(null);
  const c = edit ? { x: edit.x, z: edit.z } : [[5.8, 0.8], [0.7, 0.7], [5.8, 3.6], [3.5, 0.7], [0.7, 6.0], [6.0, 6.0]].map(([x, z]) => ({ x, z })).find((p) => decorValid(p.x, p.z)) || { x: 3, z: 1 };
  placingD = { k, x: c.x, z: c.z, edit, mesh: decorMesh(k) }; scene.add(placingD.mesh);
  if (edit) world.decor[edit.id].visible = false;
  $('movebar').classList.add('on'); $('nav').style.visibility = $('pep').style.visibility = 'hidden';
  $('mvRot').textContent = t('move.rotate'); $('mvOk').textContent = t('move.ok'); $('mvCancel').textContent = t('move.cancel');
  $('mvOk').onclick = () => endDecor(true); $('mvCancel').onclick = () => endDecor(false); $('mvRot').onclick = () => { placingD.mesh.rotation.y += Math.PI / 2; };
  decorShow();
}
function decorShow() { const p = placingD; p.mesh.position.set(p.x, 0.16, p.z); const ok = decorValid(p.x, p.z, p.edit && p.edit.id); $('mvOk').disabled = !ok; $('moveHint').textContent = DECOR[p.k].e + ' ' + (ok ? t('dc.hint') : t('dc.bad')); }
function decorDrag(e) { ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam); if (!ray.ray.intersectPlane(gPlane, gHit)) return; placingD.x = Math.round(gHit.x * 4) / 4; placingD.z = Math.round(gHit.z * 4) / 4; decorShow(); }
function endDecor(ok) {
  const p = placingD; if (!p) return; placingD = null; scene.remove(p.mesh);
  $('movebar').classList.remove('on'); $('nav').style.visibility = $('pep').style.visibility = '';
  $('mvOk').onclick = () => endMove(true); $('mvCancel').onclick = () => endMove(false); $('mvRot').onclick = () => { moving.r = (moving.r + Math.PI / 4) % (Math.PI * 2); moveShow(); };
  if (p.edit) world.decor[p.edit.id].visible = true;
  if (!ok || !decorValid(p.x, p.z, p.edit && p.edit.id)) return;
  const D = DECOR[p.k];
  if (p.edit) { Object.assign(p.edit, { x: p.x, z: p.z, r: p.mesh.rotation.y }); buildDecor(p.edit); rebuildGrid(); save(); return; }
  if (D.kd) { const pr = profile(); if ((pr.kudos || 0) < D.kd) { toast(t('kd.need')); return; } pr.kudos -= D.kd; localStorage.setItem('ahq_profile', JSON.stringify(pr)); }
  else if (D.temp && !S.tempFree) { S.tempFree = true; toast('🎁 ' + t('tp.free')); }
  else { if (S.cash < D.cost) { toast(t('build.noCash')); return; } S.cash -= D.cost; }
  const d = { id: S.nextId++, k: p.k, x: p.x, z: p.z, r: p.mesh.rotation.y }; (S.decor = S.decor || []).push(d); buildDecor(d); save();
  rebuildGrid();
}
function openDecorMenu(id) {
  const d = (S.decor || []).find((x) => x.id === id); if (!d) return; const D = DECOR[d.k], refund = D.cost ? Math.round(D.cost / 2) : 0;
  openSheet(`<h2>${D.e} ${t('dc.' + d.k)}</h2><p class="sub">${t('dc.' + d.k + 'D')}</p><div class="row2"><button class="btn g" id="dMove">✋ ${t('dc.move')}</button><button class="btn y" id="dSell">${t('dc.sell', { m: D.kd ? '✨' + Math.round(D.kd / 2) : money(refund) })}</button></div>`);
  $('dMove').onclick = () => startDecor(d.k, d);
  $('dSell').onclick = () => { closeSheet(); if (D.kd) addKudos(Math.round(D.kd / 2)); else S.cash += refund; S.decor = S.decor.filter((x) => x !== d); scene.remove(world.decor[d.id]); delete world.decor[d.id]; rebuildGrid(); save(); };
}
function buildExtras() {
  let h = `<div class="lbl" style="margin:12px 0 6px">🔧 ${t('eq.title')}</div>`;
  for (const [k, cost] of [['gen', 1500], ['ac', 2000], ['net', 1200], ['quiet', 1800], ['garden', 3000]].concat(S.garden ? [['gardenRoof', 2500], ['gardenHeat', 1200], ['gardenCool', 1200]] : [])) h += `<div class="opt w"><div class="oi" style="background:#E3ECF5">${{ gen: '🔋', ac: '❄️', net: '📡', quiet: '🔇', garden: '🌳', gardenRoof: '🏠', gardenHeat: '🔥', gardenCool: '🌬️' }[k]}</div><div class="ot"><b>${t('eq.' + k)} · ${money(cost)}</b><div>${t('eq.' + k + 'D')}</div></div>${S[k] ? `<span class="tr good">${t('eq.owned')}</span>` : `<button class="btn g" data-eq="${k}" data-cost="${cost}" ${S.cash < cost ? 'disabled' : ''}>${t('build.btn')}</button>`}</div>`;
  h += `<div class="lbl" style="margin:12px 0 6px">🪴 ${t('dc.title')} · ✨ ${kudos()} ${t('kd.name')}</div><p class="sub">${t('kd.info')}</p>`;
  for (const [k, D] of Object.entries(DECOR)) h += `<div class="opt w"><div class="oi" style="background:${D.kd ? '#FFF3CF' : '#DDF3E2'}">${D.e}</div><div class="ot"><b>${t('dc.' + k)} · ${D.kd ? '✨' + D.kd : money(D.cost)}</b><div>${t('dc.' + k + 'D')}</div></div><button class="btn ${D.kd ? 'y' : 'g'}" data-dec="${k}" ${D.kd ? (kudos() < D.kd ? 'disabled' : '') : (S.cash < D.cost ? 'disabled' : '')}>${t('build.btn')}</button></div>`;
  return h;
}
function bindExtras() {
  $('sheet').querySelectorAll('[data-eq]').forEach((b) => b.onclick = () => { const k = b.dataset.eq, c = +b.dataset.cost; if (S.cash < c) return; S.cash -= c; S[k] = true; if (k.startsWith('garden')) { world.shellOwn = null; buildAnnexLot(); rebuildGrid(); gardenRain(); } save(); toast(t('eq.done', { name: t('eq.' + k) })); openBuild(); });
  $('sheet').querySelectorAll('[data-dec]').forEach((b) => b.onclick = () => startDecor(b.dataset.dec));
}

// ---------------- mandatory events ----------------
const EVENTS = { power: { dur: 25, e: '⚡' }, wifi: { dur: 40, e: '📶' }, leak: { dur: 45, e: '💧' }, noise: { dur: 40, e: '🔨' }, heat: { dur: 50, e: '🥵' } };
const evSlow = (type) => (S.ev && S.ev.k === 'noise' && (type === 'nap' || type === 'therapy') ? 2 : S.ev && S.ev.k === 'wifi' && type === 'detox' ? 0.67 : 1);
function evPatience() { if (!S.ev) return 1; const k = S.ev.k; return k === 'wifi' ? 1.4 : k === 'noise' ? 1.2 : k === 'heat' ? (S.ac ? 1 : 1.5) : k === 'power' ? 1.2 : 1; }
function startEvent() {
  const keys = Object.keys(EVENTS).filter((k) => k !== 'leak' || S.rooms.some((r) => !ROOMS[r.type].staffOnly));
  const k = cityOf().power && RNG() < 0.5 ? 'power' : cityOf().hot && RNG() < 0.45 ? 'heat' : rnd(keys);
  if (k === 'power' && S.gen) { chat(t('from.hq'), t('ev.gen'), '🔋'); S.cash -= 100; incCnt('pcuts'); return; }
  if (k === 'heat' && S.ac) { chat(t('from.weather'), t('ev.acOk'), '❄️'); return; }
  if (k === 'wifi' && S.net) { chat(t('from.hq'), t('ev.netOk'), '📡'); return; }
  if (k === 'noise' && S.quiet) { chat(t('from.hq'), t('ev.quietOk'), '🔇'); return; }
  S.ev = { k, t: EVENTS[k].dur }; say('ev' + k, t('ev.' + k), 30);
  if (k === 'leak') {
    const r = rnd(S.rooms.filter((x) => !ROOMS[x.type].staffOnly)); const room = R.rooms[r.id]; room.closed = true; S.ev.room = r.id; S.ev.t = 999;
    const pd = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.02, 18), mat('#7FC7F0', { r: 0.1, op: 0.85 })); pd.position.set(room.cx + 0.6, 0.14, room.cz + 0.6); scene.add(pd);
    const drip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), mat('#7FC7F0')); drip.rotation.x = Math.PI; drip.position.set(room.cx + 0.6, 2.4, room.cz + 0.6); scene.add(drip); pd.userData.drip = drip;
    const leak = { mesh: pd, heavy: true, leak: r.id }; R.litter.push(leak); S.ev.obj = leak; S.ev.fixT = 45;
    chat(t('from.hq'), t('ev.leak', { room: rn(r.type) }) + ' ' + t('ev.leakD'), '💧');
  } else chat(t('from.hq'), t('ev.' + k) + ' ' + t('ev.' + k + 'D') + ({ wifi: 1, noise: 1, power: 1, heat: 1 }[k] ? ' ' + t('ev.fix.' + k) : ''), EVENTS[k].e);
  if (k === 'power') renderer.toneMappingExposure = 0.5;
  toast(EVENTS[k].e + ' ' + (k === 'leak' ? t('ev.leak', { room: rn(R.rooms[S.ev.room].type) }) : t('ev.' + k)), 2600);
}
function endEvent() {
  const E = S.ev; if (!E) return;
  if (E.k === 'power') renderer.toneMappingExposure = 0.92;
  if (E.k === 'leak') { const room = R.rooms[E.room]; if (room) room.closed = false; if (E.obj && E.obj.mesh.userData.drip) scene.remove(E.obj.mesh.userData.drip); }
  S.ev = null;
}
function eventUpdate(dt) {
  const E = S.ev; if (!E) return;
  if (E.k === 'leak') {
    if (!R.litter.includes(E.obj)) { chat(t('from.hq'), t('ev.leakDone', { room: rn((R.rooms[E.room] || {}).type || 'budget') }), '🔧'); endEvent(); return; }
    if (E.obj.mesh.userData.drip) E.obj.mesh.userData.drip.position.y = 2.4 - ((performance.now() / 600) % 1) * 2.2;
    if (!R.staff.some((rs) => rs.data.role === 'maint')) { E.fixT -= dt; if (E.fixT <= 0) { S.cash -= 300; scene.remove(E.obj.mesh); R.litter.splice(R.litter.indexOf(E.obj), 1); chat(t('from.landlord'), t('ev.leakFix'), '🔧'); endEvent(); } }
    return;
  }
  E.t -= dt; if (E.t <= 0) endEvent();
}

// ---------------- HQ Wrapped & Adulting Awards ----------------
function awards() {
  const SS = S.st || { prob: {}, room: {}, staff: {}, acc: 0, rats: 0, vip: 0 }, a = [];
  if (S.vibes >= 80) a.push('vibes'); if ((SS.chased || 0) >= 3) a.push('rats'); if (hasRoom('toilet') && !SS.acc && S.served >= 20) a.push('loo'); if (S.earned >= 20000) a.push('money'); if (SS.vip >= 1) a.push('vip');
  if (!a.length) a.push('trying'); return a;
}
function showWrapped(auto) {
  const SS = S.st || { prob: {}, room: {}, staff: {}, acc: 0, rats: 0, vip: 0 };
  const top = (o) => Object.entries(o).sort((x, y) => y[1] - x[1])[0];
  const tp = top(SS.prob), tr = top(SS.room), ts = top(SS.staff), mvp = ts && S.staff.find((s) => s.id === +ts[0]);
  const aw = awards(); if (auto) addKudos(aw.length * 5);
  const line = (e, k, v) => `<div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px dashed rgba(255,255,255,.35)"><span>${e} ${t(k)}</span><b style="text-align:right">${v}</b></div>`;
  const html = `<div style="background:linear-gradient(160deg,#16963C,#1F74C4 70%,#7F68C9);color:#fff;border-radius:22px;padding:16px 16px 12px;text-align:left;margin:-6px -4px 0">
    <div style="font:700 13px Nunito;opacity:.85">${t('city.london')} · ${dayN(S.day)} · Boss ${MGR.name}</div><div style="font:700 28px Fredoka;line-height:1.1;margin:4px 0 8px">🎁 ${t('wr.title')}</div>
    ${line('🙂', 'wr.helped', S.served)}${line('🏆', 'wr.topProb', tp ? pn(tp[0]) + ' ×' + tp[1] : '—')}${line('🚪', 'wr.topRoom', tr ? rn(tr[0]) : '—')}${line('🌟', 'wr.mvp', mvp ? mvp.name : '—')}${line('💵', 'wr.earned', money(S.earned))}${line('🐀', 'wr.rats', SS.chased || 0)}
    <div style="font:700 17px Fredoka;margin:10px 0 4px">🏅 ${t('wr.awards')}</div>${aw.map((k) => `<div style="background:rgba(255,255,255,.16);border-radius:12px;padding:6px 10px;margin:4px 0;font-weight:800">🏅 ${t('aw.' + k)}</div>`).join('')}
    ${auto ? `<div style="font-weight:800;margin-top:6px">+${aw.length * 5} Kudos ✨</div>` : ''}</div>
    <div class="row2" style="margin-top:12px"><button class="btn y" id="wShare">📤 ${t('wr.share')}</button><button class="btn g" id="mOk">${t('rent.ok')}</button></div>`;
  modal(html); $('mOk').onclick = closeModal;
  $('wShare').onclick = async () => {
    const txt = t('wr.shareText', { n: S.served, aw: aw.map((k) => t('aw.' + k)).join(', '), m: money(S.earned) });
    try { if (navigator.share) { await navigator.share({ title: 'Life Crisis Tycoon', text: txt }); return; } } catch (e) {}
    try { await navigator.clipboard.writeText(txt); toast(t('wr.copied')); } catch (e) { toast(txt, 5000); }
  };
}

// ---------------- the "protection fee" crew (fictional) ----------------
// crew comes back about every 3 weeks of game days; a bit more often the further you progress
function crewGap() { return Math.max(15, 21 - 3 * Math.max(0, S.stars - 2) - cityOf().lvl * 2) + Math.floor(Math.random() * 5) - 2; }
function crewVisit() {
  const fee = Math.max(500, Math.round(Math.max(0, S.cash) * 0.08 / 50) * 50);
  R.crew = []; for (let i = 0; i < 3; i++) { const av = visPerson(['v08', 'v15', 'v22'][i], { skin: rnd(SKIN), hair: '#1C120C', style: 'short', shirt: '#2A2A2E', pants: '#2A2A2E', cap: '#2A2A2E', glasses: true, tall: 1.05 + i * 0.05, wide: 1.1 }); av.position.set(2 + i * 0.8, 0.1, 8.2); av.rotation.y = Math.PI; scene.add(av); R.crew.push(av); }
  modal(`<div style="font-size:46px">🕶️🕶️🕶️</div><h2>${t('crew.title')}</h2><p>${t('crew.p', { m: money(fee) })}</p>
  <button class="btn g" id="cPay" style="width:100%;margin-top:8px">${t('crew.pay', { m: money(fee) })}</button>
  <div class="row2" style="margin-top:8px"><button class="btn y" id="cRef">${t('crew.refuse')}</button><button class="btn w" id="cRep">🚓 ${t('crew.report')}</button></div>`);
  const bye = () => { closeModal(); setTimeout(() => { for (const a of R.crew || []) scene.remove(a); R.crew = []; }, 4000); };
  $('cPay').onclick = () => { S.cash -= fee; chat(t('crew.name'), t('crew.paid'), '🕶️'); bye(); };
  $('cRef').onclick = () => { S.crewAngry = S.day + 1; chat(t('crew.name'), t('crew.refused'), '🕶️'); bye(); };
  $('cRep').onclick = () => { S.crewReport = S.day + 2; if (Math.random() < 0.3) S.crewAngry = S.day + 1; chat(t('from.hq'), t('crew.reported'), '🚓'); bye(); };
}
function vandalism() {
  for (let i = 0; i < 6; i++) dropLitter(0.8 + Math.random() * 5.2, 0.8 + Math.random() * 5.2);
  for (let i = 0; i < 2; i++) dropPuddle(1 + Math.random() * 4.5, 1 + Math.random() * 4.5, crnd(['#FF8FAB', '#B57BE8', '#5AB8F0']));
  S.vibes = clamp(S.vibes - 5, 0, 100); chat(t('crew.name'), t('crew.vandal'), '🖍️'); toast('🖍️ ' + t('crew.vandal'), 3200);
}

// ---------------- marketing ----------------
const ADS = { flyers: { cost: 400, dur: 60, mul: 1.3, e: '📰' }, social: { cost: 1200, dur: 120, mul: 1.6, e: '📱' }, influencer: { cost: 2500, dur: 60, mul: 2.0, e: '🤳' }, promo: { cost: 800, dur: 120, mul: 1.2, e: '🎯' } };
const adMul = () => (S.ad ? 1 + (ADS[S.ad.k].mul - 1) * (S.ad.fat ? 0.5 : 1) : 1);
function adUpdate(dt) {
  if (S.adCd > 0) S.adCd -= dt;
  const A = S.ad; if (!A) return; A.t -= dt;
  if (A.t <= 0) {
    if (A.k === 'influencer') { const served = S.served - A.s0, left = S.left - A.l0; const ok = served >= 3 && left <= served * 0.4; S.vibes = clamp(S.vibes + (ok ? 5 : -8), 0, 100); chat('🤳 @' + A.handle, t(ok ? 'mk.viral' : 'mk.roast'), ok ? '🔥' : '💀'); toast(t(ok ? 'mk.viral' : 'mk.roast'), 3500); }
    S.adLast = A.k; S.ad = null; S.adCd = 45;
  }
}
function openMarketing() {
  const wages = Math.round(S.staff.reduce((a, s) => a + s.wage, 0) * WAGE_K), toRent = RENT_EVERY - ((S.day - 1) % RENT_EVERY);
  let h = `<h2>📣 ${t('mk.title')}</h2><p class="sub">${t('mk.sub')}</p>`;
  if (S.mode === 'career') h += `<div class="receipt"><div><span>${t('mk.earned')}</span><span>${money(S.earned)}</span></div><div><span>${t('mk.bills', { d: S.day + toRent })}</span><span>-${money(RENT + wages + elecPerDay() * ELEC_K * RENT_EVERY)}</span></div><div style="font-size:12px;color:var(--muted)"><span>⚡ ${t('bill.elec')}: ${money(elecPerDay() * ELEC_K)}/${t('day.unit')}</span><span>✨ ${kudos()} ${t('kd.name')}</span></div></div>`;
  if (S.mode === 'career') {
    const P = [[0.8, 'pr.low'], [1, 'pr.norm'], [1.2, 'pr.high'], [1.4, 'pr.max']], cur = S.price || 1;
    h += `<div class="lbl" style="margin:6px 0">💲 ${t('pr.title')}</div><div class="chips" style="margin-bottom:6px">${P.map(([v, k]) => `<button class="${v === cur ? 'g' : 'w'}" data-price="${v}" style="border-radius:999px;padding:6px 12px;font-weight:800;font-size:13px">${t(k)} ${v === 1 ? '' : (v > 1 ? '+' : '−') + Math.round(Math.abs(v - 1) * 100) + '%'}</button>`).join('')}</div><p class="sub">${t('pr.d')}</p>`;
    h += `<div class="lbl" style="margin:6px 0">🏦 ${t('loan.title')}</div>` + (S.loan ? `<div class="msg">${t('loan.left', { m: money(S.loan.left), p: money(S.loan.per) })}</div>` : `<div class="opt w"><div class="oi" style="background:#E3ECF5">🏦</div><div class="ot"><b>${t('loan.offer', { m: money(10000) })}</b><div>${t('loan.d', { m: money(11000), p: money(2750) })}</div></div><button class="btn y" id="takeLoan">${t('loan.btn')}</button></div>`);
    h += `<div class="lbl" style="margin:10px 0 6px">📣 ${t('mk.camp')}</div>`;
  }
  const usesLeft = 2 - (S.adUses || 0), blocked = !!S.ad || S.adCd > 0 || usesLeft <= 0;
  if (!S.ad && S.adCd > 0) h += `<div class="msg">⏳ ${t('mk.cd', { t: Math.ceil(S.adCd) + 's' })}</div>`;
  if (usesLeft <= 0) h += `<div class="msg">🚫 ${t('mk.limit', { d: S.day + toRent })}</div>`;
  else h += `<p class="sub">${t('mk.uses', { n: usesLeft })}${S.adLast ? ' · ' + t('mk.fatigue', { name: t('mk.' + S.adLast) }) : ''}</p>`;
  if (S.ad) h += `<div class="msg" style="border-color:var(--green)">${ADS[S.ad.k].e} ${t('mk.active', { name: t('mk.' + S.ad.k) + (S.ad.room ? ' · ' + rn(S.ad.room) : ''), t: Math.ceil(S.ad.t) + 's' })}</div>`;
  for (const [k, A] of Object.entries(ADS)) {
    if (k === 'promo') {
      const types = [...new Set(S.rooms.map((r) => r.type))].filter((ty) => Object.values(PROBLEMS).some((p) => p.room === ty));
      h += `<div class="opt w"><div class="oi" style="background:#FFF3CF">${A.e}</div><div class="ot"><b>${t('mk.promo')} · ${money(A.cost)}</b><div>${t('mk.promoD')}</div><div class="chips" style="margin-top:6px">${types.map((ty) => `<button class="w" data-promo="${ty}" style="border-radius:999px;padding:4px 10px;font-weight:800;font-size:12.5px" ${blocked || S.cash < A.cost ? 'disabled' : ''}>${ROOMS[ty].e} ${rn(ty)}</button>`).join('')}</div></div></div>`;
      continue;
    }
    h += `<div class="opt w"><div class="oi" style="background:#FFF3CF">${A.e}</div><div class="ot"><b>${t('mk.' + k)} · ${money(A.cost)}</b><div>${t('mk.' + k + 'D')}</div></div><button class="btn g" data-ad="${k}" ${blocked || S.cash < A.cost ? 'disabled' : ''}>${t('mk.btn')}</button></div>`;
  }
  openSheet(h);
  const go = (k, room) => { const A = ADS[k]; S.cash -= A.cost; S.adUses = (S.adUses || 0) + 1; S.ad = { k, fat: S.adLast === k, t: A.dur, room, s0: S.served, l0: S.left, handle: crnd(['glowwithjade', 'kaivibes', 'adultingfails', 'lunchbreaklena', 'mainchar.mo']) }; closeSheet(); toast(t('mk.start', { name: t('mk.' + k) }), 2500); save(); };
  $('sheet').querySelectorAll('[data-ad]').forEach((b) => b.onclick = () => go(b.dataset.ad));
  $('sheet').querySelectorAll('[data-price]').forEach((b) => b.onclick = () => { S.price = +b.dataset.price; save(); openMarketing(); });
  const tl = $('takeLoan'); if (tl) tl.onclick = () => { S.cash += 10000; S.loan = { left: 11000, per: 2750 }; save(); toast(t('loan.got', { m: money(10000) })); openMarketing(); };
  $('sheet').querySelectorAll('[data-promo]').forEach((b) => b.onclick = () => go('promo', b.dataset.promo));
}
$('hCash').parentElement.style.cursor = 'pointer'; $('hCash').parentElement.onclick = openMarketing;
// upcoming bills: tap the day / rent card to see exactly what will be taken, and when
function openBills() {
  if (!inGame || S.mode !== 'career') return;
  const toRent = RENT_EVERY - ((S.day - 1) % RENT_EVERY), elec = elecPerDay() * ELEC_K * RENT_EVERY, loanPay = S.loan ? Math.min(S.loan.left, S.loan.per) : 0;
  const staff = S.staff.map((st) => [st.name + ' · ' + roleN(st.role), Math.round(st.wage * WAGE_K)]), wages = staff.reduce((a, x) => a + x[1], 0);
  const total = RENT + wages + elec + loanPay, after = S.cash - total;
  const row = (a, b, sub) => `<div${sub ? ' style="font-size:12px;color:var(--muted);padding-left:10px"' : ''}><span>${a}</span><span>-${money(b)}</span></div>`;
  openSheet(`<h2>🧾 ${t('bills.title')}</h2><p class="sub">${t('bills.when', { d: S.day + toRent, n: toRent })}</p>
    <div class="receipt">${row('🏠 ' + t('rent.rent'), RENT)}${row('👥 ' + t('rent.wages'), wages)}${staff.map(([n, w]) => row(n, w, true)).join('')}${row('⚡ ' + t('bill.elec') + ' (' + money(elecPerDay() * ELEC_K) + '/' + t('day.unit') + ' × ' + RENT_EVERY + ')', elec)}${loanPay ? row('🏦 ' + t('loan.pay'), loanPay) : ''}
    <div style="border-top:2px dashed var(--sh);margin-top:4px;padding-top:6px;font-weight:800"><span>${t('bills.total')}</span><span>-${money(total)}</span></div>
    <div style="font-weight:800;color:${after < 0 ? '#C0362C' : '#1E8A3A'}"><span>${t('bills.after')}</span><span>${money(after)}</span></div></div>
    ${after < 0 ? `<div class="msg">⚠️ ${t('bills.short', { m: money(-after) })}</div>` : ''}`);
}
$('hDay').parentElement.style.cursor = 'pointer'; $('hDay').parentElement.onclick = openBills;
$('hVibes').parentElement.style.cursor = 'pointer'; $('hVibes').parentElement.onclick = () => { if (S && S.mode === 'career') openTemp(); };

// ---------------- objectives tracker ----------------
function metricRow([m, v], done) {
  const cur = metric(S, m), ok = done || cur >= v, pct = clamp(cur / v, 0, 1) * 100;
  const fmt = (x) => (m === 'cash' ? money(x) : m === 'vibes' ? Math.floor(x) + '%' : Math.floor(x));
  const icon = m === 'helped' ? '🙂' : m === 'vibes' ? '★' : '💵';
  return `<div class="gm ${ok ? 'ok' : ''}">${icon} ${t('obj.' + m)} <b>${fmt(Math.max(0, cur))} / ${fmt(v)}</b> ${ok ? '✅' : ''}<div class="bar"><i style="width:${ok ? 100 : pct}%;background:${ok ? '#7ACB4E' : '#FFB800'}"></i></div></div>`;
}
function nextSteps() {
  const out = [], add = (icon, txt, act) => { if (out.length < 3 && !out.some((o) => o.txt === txt)) out.push({ icon, txt, act }); };
  const hireAct = (role) => () => openHire(role);
  if (!R.staff.some((rs) => rs.data.role === 'host')) add('🛎️', t('next.host'), hireAct('host'));
  if (!hasRoom('toilet') && (S.served >= 3 || R.visitors.some((v) => v.need > 0.8))) add('🚻', t('next.toilet'), () => openSize('toilet'));
  const need = {};
  for (const v of R.visitors) if (v.known && ['wait', 'toWait'].includes(v.state) && !hasRoom(PROBLEMS[v.prob].room)) need[PROBLEMS[v.prob].room] = (need[PROBLEMS[v.prob].room] || 0) + 1;
  Object.entries(need).sort((a, b) => b[1] - a[1]).forEach(([room, n]) => add(ROOMS[room].e, t('next.build', { room: rn(room), n }), () => openSize(room)));
  for (const room of Object.values(R.rooms)) if (ROOMS[room.type].role && !room.staff.some(Boolean) && !R.staff.some((rs) => rs.data.role === ROOMS[room.type].role && rs.at === 'idle')) add('🧑‍💼', t('next.staff', { role: roleN(ROOMS[room.type].role), room: rn(room.type) }), hireAct(ROOMS[room.type].role));
  if (unlocked('maint') && (R.litter.length >= 4 || R.rats.length) && !R.staff.some((rs) => rs.data.role === 'maint')) add('🧹', t('next.maint'), hireAct('maint'));
  const G = GOALS[S.stars];
  if (G) {
    for (const [m, v] of G.parts) {
      if (metric(S, m) >= v) continue;
      if (m === 'vibes') { if (!hasRoom('cafe')) add('🍵', t('next.cafe'), () => openSize('cafe')); if (S.pepCd <= 0) add('📣', t('next.pep'), pepTalk); }
      if (m === 'helped') { add('🏗️', t('next.more'), openBuild); { const li = plotOf().lots.findIndex((_, i) => lotSt(i) === 'locked' && lotOpen(i) && S.cash >= lotCost(i)); if (li >= 0) add('🔓', t('next.expand'), () => tapLot(li)); } }
      if (m === 'cash') add('💵', t('next.cash'), null);
    }
  }
  if (S.day >= 3 && unlocked('lab') && !hasRoom('lab')) add('🔬', t('next.lab'), () => openSize('lab'));
  if (S.cash < 1500 && !S.loan && S.mode === 'career') add('🏦', t('next.money'), openMarketing);
  if (!S.ad && !(S.adCd > 0) && (S.adUses || 0) < 2 && S.cash >= 400 && R.visitors.length < 4 && S.rooms.length >= 2) add('📣', t('next.ads'), openMarketing);
  if (speedMul < 2 && out.length < 2) add('⏩', t('next.speed'), () => setSpeed(2));
  return out;
}
let objKey = '', objSteps = [], objOpenUntil = 0, objLastStep = '';
function updateObj() {
  const el = $('obj'), now = performance.now();
  const G = GOALS[S.stars];
  // progress on the Goals nav button: average of the current star's conditions
  const prog = !G ? 1 : G.parts.reduce((a, [m, v]) => a + clamp(metric(S, m) / v, 0, 1), 0) / G.parts.length;
  $('gpBar').style.width = (prog * 100) + '%'; $('gpBar').style.background = prog >= 1 ? '#7ACB4E' : '#FFB800';
  objSteps = S.mode === 'career' ? nextSteps() : []; const s0 = objSteps[0];
  $('goalDot').style.display = s0 && s0.act ? 'block' : 'none';
  // the next step pops up briefly only when the priority changes, then gets out of the way
  if (s0 && s0.txt !== objLastStep) { objLastStep = s0.txt; objOpenUntil = now + 5000; }
  if (S.mode !== 'career' || (S.tut >= 0 && S.tut < 7) || !s0 || now > objOpenUntil) { el.style.display = 'none'; objKey = ''; return; }
  el.style.display = 'block';
  const h = `<button class="nx y" id="objNext">${s0.icon} <span style="flex:1">${s0.txt}</span> ›</button>`;
  if (h !== objKey) { objKey = h; el.innerHTML = h; $('objNext').onclick = (e) => { e.stopPropagation(); objOpenUntil = 0; const a = objSteps[0] && objSteps[0].act; if (a) a(); else openGoals(); }; }
}


// ---------------- moving the reception desk ----------------
let moving = null; const gPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.1), gHit = new THREE.Vector3();
const DESK_COST = 1500;
function deskValid2(x, z, r) { // an extra desk: on the floor, clear of rooms and other desks, with room for its line
  const f = { x: Math.sin(r), z: Math.cos(r) }, pts = [{ x, z }, { x: x - f.x * 0.78, z: z - f.z * 0.78 }]; for (let k = 0; k < 4; k++) pts.push({ x: x + f.x * (0.95 + k * 0.72), z: z + f.z * (0.95 + k * 0.72) });
  for (const p of pts) { if (!inFloor(p.x, p.z)) return false; if (S.rooms.some((rm) => { const q = roomRect(rm); return p.x > q.x0 - 0.3 && p.x < q.x1 + 0.3 && p.z > q.z0 - 0.3 && p.z < q.z1 + 0.3; })) return false; }
  return desks().every((D, i) => (moving && moving.di === i) || Math.hypot(D.x - x, D.z - z) > 2.6);
}
function deskValid(x, z) { return x >= 1.4 && x <= 5.6 && z >= 1.4 && z <= 5.8 && Math.hypot(x - 0.8, z - 4.2) > 1.7; }
function openDesk2(di) {
  const h = deskHost(di), q = DQ(di);
  openSheet(`<h2>🛎️ ${t('desk2.title')} #${di + 1}</h2><p class="sub">${h ? h.data.name : t('desk.need')} · 👥 ${q.length}</p>
    <div class="opt w"><div class="oi" style="background:#FFE1DC">🗑️</div><div class="ot"><b>${t('desk2.remove')}</b><div>+${money(DESK_COST / 2)}</div></div><button class="btn y" id="d2Rm">${t('desk2.removeBtn')}</button></div>` + deskUpRow(di)); bindDeskUp(di, () => openDesk2(di));
  $('d2Rm').onclick = () => { closeSheet(); removeDesk2(di); };
}
function removeDesk2(di) {
  S.desks2.splice(di - deskBase(), 1); S.cash += DESK_COST / 2;
  const moved = []; for (let k = di; k < R.deskQs.length; k++) { moved.push(...R.deskQs[k]); R.deskQs[k] = []; } R.deskQs.length = Math.max(1, di);
  for (const rs of R.staff) if (rs.at === 'desk' && (rs.desk || 0) >= di) { rs.at = null; rs.desk = 0; }
  placeDesk(); assignStaff(); for (const v of moved) if (R.visitors.includes(v) && ['queue', 'toQueue', 'checkin'].includes(v.state)) joinQueue(v); save();
}
function startMove(extra) {
  if (!inGame || moving || S.mode !== 'career' && S.mode !== 'quick' && S.mode !== 'daily') return;
  closeSheet(); selectVisitor(null);
  if (extra) { const m = deskMesh(), ring = m.children.find((c) => c.geometry && c.geometry.type === 'RingGeometry'); if (ring) { ring.visible = true; ring.material = ring.material.clone(); }
    moving = { x: view.tx, z: view.tz, r: 0, drag: false, extra: true, mesh: m, ring };
    // start somewhere valid near the view centre
    let best = null; for (let rr = 0; rr < 12 && !best; rr += 0.5) for (let a = 0; a < 6.28 && !best; a += 0.5) for (const r0 of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) { const x = Math.round((view.tx + Math.cos(a) * rr) * 4) / 4, z = Math.round((view.tz + Math.sin(a) * rr) * 4) / 4; if (deskValid2(x, z, r0)) { best = { x, z, r: r0 }; break; } }
    if (best) Object.assign(moving, best);
  } else { moving = { x: S.desk.x, z: S.desk.z, r: S.desk.r, orig: { ...S.desk }, drag: false }; world.deskRing.visible = true; } $('movebar').classList.add('on'); $('nav').style.visibility = 'hidden'; $('pep').style.visibility = 'hidden';
  $('moveHint').textContent = '🛎️ ' + t(extra ? 'desk2.hint' : 'move.hint'); $('mvRot').textContent = t('move.rotate'); $('mvOk').textContent = t('move.ok'); $('mvCancel').textContent = t('move.cancel');
  $('mvOk').onclick = () => endMove(true); $('mvCancel').onclick = () => endMove(false); $('mvRot').onclick = () => { moving.r = (moving.r + Math.PI / 4) % (Math.PI * 2); moveShow(); };
  moveShow();
}
function moveShow() { const m = moving.mesh || world.desk, ring = moving.mesh ? moving.ring : world.deskRing; m.position.set(moving.x, 0.12, moving.z); m.rotation.y = moving.r; const ok = moving.extra ? deskValid2(moving.x, moving.z, moving.r) : deskValid(moving.x, moving.z); if (ring) ring.material.color.set(ok ? '#7ACB4E' : '#E5484D'); $('mvOk').disabled = !ok; }
function moveDrag(e) {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam);
  if (!ray.ray.intersectPlane(gPlane, gHit)) return;
  if (moving.extra) { const b = plotBox(); moving.x = clamp(Math.round(gHit.x * 4) / 4, b[0], b[1]); moving.z = clamp(Math.round(gHit.z * 4) / 4, b[2], b[3]); } else { moving.x = clamp(Math.round(gHit.x * 4) / 4, 0.8, 6.2); moving.z = clamp(Math.round(gHit.z * 4) / 4, 0.8, 6.4); } moveShow();
}
function endMove(ok) {
  if (!moving) return;
  if (moving.extra) { const mv = moving; scene.remove(mv.mesh); moving = null; $('movebar').classList.remove('on'); $('nav').style.visibility = $('pep').style.visibility = '';
    if (ok && deskValid2(mv.x, mv.z, mv.r) && S.cash >= DESK_COST) { S.cash -= DESK_COST; (S.desks2 = S.desks2 || []).push({ x: mv.x, z: mv.z, r: mv.r }); placeDesk(); assignStaff(); AU.sfx('build'); toast('🛎️ ' + t(R.staff.some((rs) => rs.data.role === 'host' && (!rs.at || rs.at === 'idle')) ? 'desk2.done' : 'desk2.hire'), 3000); save(); }
    return; }
  if (ok) { S.desk = { x: moving.x, z: moving.z, r: moving.r }; }
  moving = null; world.deskRing.visible = false; $('movebar').classList.remove('on'); $('nav').style.visibility = $('pep').style.visibility = '';
  placeDesk();
  if (ok) {
    for (const v of R.visitors) if (v.state === 'checkin') { v.state = 'queue'; v.prog = 0; }
    for (const s of WAIT_SPOTS) if (s.blocked && s.busy) { const v = s.busy; s.busy = null; const n = WAIT_SPOTS.find((w) => !w.busy && !w.blocked); if (n) { n.busy = v; v.spot = n; setPath(v, [{ x: n.x, z: n.z }]); v.state = 'toWait'; } }
    const h = deskHost(0); if (h) goStaff(h, deskSpot(0));
    toast(t('move.done'), 2000); save();
  }
}
$('mvOk').onclick = () => endMove(true);
$('mvCancel').onclick = () => endMove(false);
$('mvRot').onclick = () => { moving.r = (moving.r + Math.PI / 4) % (Math.PI * 2); moveShow(); };

// ---------------- flow ----------------
function resetRuntime() {
  if (R.mgr) { scene.remove(R.mgr.av); R.mgr = null; } hideTut();
  for (const c of R.crew || []) scene.remove(c); R.crew = [];
  for (const v of R.visitors) { scene.remove(v.av); scene.remove(v.hud); } for (const rs of R.staff) scene.remove(rs.av);
  for (const l of R.litter) scene.remove(l.mesh); for (const r of R.rats) scene.remove(r.mesh); if (R.inspector) scene.remove(R.inspector.av);
  R.visitors.length = 0; R.staff.length = 0; R.deskQ.length = 0; R.deskQs = [R.deskQ]; R.litter.length = 0; R.rats.length = 0; R.later.length = 0; R.inspector = null; WAIT_SPOTS.forEach((s) => s.busy = null);
  for (const k of Object.keys(world.roomGroups)) { const g = world.roomGroups[k]; if (g && g.parent) g.parent.remove(g); delete world.roomGroups[k]; }
  for (const k of Object.keys(R.rooms)) delete R.rooms[k];
  clearLabels(); selectVisitor(null); spawnT = 3;
}
function startGame() {
  S.tips = S.tips || {}; if (S.tut == null) S.tut = -1; S.pepT = S.pepT || 0; S.pepCd = S.pepCd || 0; S.desk = S.desk || { x: 5.25, z: 5.25, r: Math.PI / 4 };
  if (!Array.isArray(S.rooms)) {
    const P = { A: [-3.5, -3.5, Math.PI / 2], B: [3.5, -3.5, 0], C: [-3.5, 3.5, Math.PI / 2], E: [9.75, -3.5, 0], F: [9.75, 3.5, Math.PI] }, old = S.rooms; S.rooms = [];
    for (const k in old) if (old[k] && P[k]) S.rooms.push({ id: S.nextId++, type: old[k], size: 'm', x: P[k][0], z: P[k][1], a: P[k][2] });
  }
  S.city = S.city || 'london'; preloadVisitors(S.city); TV.city = t('city.' + S.city); TV.transit = t('tr.' + S.city); const C = CITIES[S.city]; RENT = Math.round(C.rent * BILL_K / 50) * 50; GOALS = mkGoals(S.mode === 'career' ? C.goals : CITIES.london.goals); buildCityDecor(S.city);
  resetRuntime(); buildAnnexLot(); rebuildGrid();
  if (!S.mod2) { S.mod2 = 1; for (const r of S.rooms) { if (Math.abs(((r.x - 0.5) % 1)) < 1e-6 && Math.abs(((r.z - 0.5) % 1)) < 1e-6) continue; // old saves: move rooms onto the 2 m lattice
    let done = false; for (const dx of [0.5, -0.5, 0]) { for (const dz of [0.5, -0.5, 0]) { const tr = { ...r, x: snapC(r.x + dx), z: snapC(r.z + dz), edit: r }; if (placeValid(tr)) { r.x = tr.x; r.z = tr.z; done = true; break; } } if (done) break; } } }
  { const bad = S.rooms.filter((r) => { const q = roomRect(r); for (let x = q.x0 + 0.25; x < q.x1; x += 0.5) for (let z = q.z0 + 0.25; z < q.z1; z += 0.5) if (!buildable(x, z)) return true; return false; }); if (bad.length) { for (const r of bad) S.cash += roomCost(r.type, r.size); S.rooms = S.rooms.filter((r) => !bad.includes(r)); rebuildGrid(); setTimeout(() => toast(t('plot.refund', { n: bad.length })), 800); } }
  for (const r of S.rooms) buildRoom(r);
  for (const k in world.decor) { scene.remove(world.decor[k]); delete world.decor[k]; } for (const d of S.decor || []) buildDecor(d);
  if (S.ev) { S.ev = null; } renderer.toneMappingExposure = 0.92;
  for (const st of S.staff) spawnStaffAvatar(st);
  spawnManager();
  assignStaff(); restoreVisitors(); refreshCandidates(); updateBadge();
  setSpeed(1); placeDesk(); AU.startMusic(S.city);
  show('game'); view.tx = -0.6; view.tz = -1.6; view.half = 15.5; view.yaw = Math.PI / 4; view.pitch = 0.53; view.yawT = view.pitchT = null; placeCam();
  if (S.chat.length) { $('bnFrom').textContent = S.chat[0].from.toUpperCase(); $('bnText').innerHTML = S.chat[0].text; }
}
function startNew(city) {
  RNG = Math.random; S = newState(); S.city = city || 'london'; S.cash = CITIES[S.city].cash;
  const host = makeCandidate('host'); host.skill = 3; host.name = 'Amara Okafor'; host.traits = ['Calm Voice', 'Plant Parent']; host.wage = 750; host.id = S.nextId++;
  host.look = { skin: SKIN[3], hair: '#1C120C', style: 'curly', tall: 1, wide: 1, glasses: false, nose: false };
  S.staff.push(host);
  startGame();
  chat(t('from.landlord'), t(CITIES[S.city].start, { r: money(RENT) }), '🏠');
  let tutSeen = false; try { tutSeen = localStorage.getItem('ahq_tut_done') === '1'; } catch (e) {}
  if (tutSeen) chat('Amara · ' + roleN('host'), t('start.amara'), '👋');
  S.unread = 1; updateBadge(); save();
  let tutDone = false; try { tutDone = localStorage.getItem('ahq_tut_done') === '1'; } catch (e) {}
  modal(`<img src="${amaraImg()}" style="width:84px;height:84px;border-radius:50%;border:3px solid #fff;box-shadow:0 3px 0 var(--sh)"><h2>${t('tut.askT')}</h2><p>${t('tut.askP', { name: MGR.name, g: MGR.pron })}</p><div class="row2" style="margin-top:12px"><button class="btn y" id="tNo">${t('tut.askNo')}</button><button class="btn g" id="tYes">${t('tut.askYes')}</button></div>`);
  $('tYes').onclick = () => { closeModal(); S.tut = 0; tutDrawn = null; S.unread = 0; updateBadge(); };
  $('tNo').onclick = () => { closeModal(); try { localStorage.setItem('ahq_tut_done', '1'); } catch (e) {} chat('Amara · ' + roleN('host'), t('start.amara'), '👋'); toast(t('start.toast')); };
  if (tutDone) $('tYes').className = 'btn w';
}
$('camMap').onclick = () => { if (!inGame || placingR || moving) return; toMap(); };
// Save code: all progress (every city, profile, manager) as one text code — works across browsers, devices and new versions of the game
function exportSave() {
  if (inGame) save(); const data = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('ahq_')) data[k] = localStorage.getItem(k); }
  const code = 'MLT1:' + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  modal(`<div style="font-size:42px">💾</div><h2>${t('sv.export')}</h2><p>${t('sv.exportP')}</p><textarea id="svCode" readonly style="width:100%;height:110px;font-size:11px;border-radius:12px;padding:8px">${code}</textarea><button class="btn g" id="svCopy" style="width:100%;margin-top:8px">${t('sv.copy')}</button><button class="btn w" id="svClose" style="width:100%;margin-top:8px">${t('tut.ok')}</button>`);
  $('svCopy').onclick = () => { const ta = $('svCode'); ta.select(); try { (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => toast('✅ ' + t('sv.copied'), 2000), () => { document.execCommand('copy'); toast('✅ ' + t('sv.copied'), 2000); }); } catch (e) { document.execCommand('copy'); } };
  $('svClose').onclick = closeModal;
}
function importSave() {
  modal(`<div style="font-size:42px">📥</div><h2>${t('sv.import')}</h2><p>${t('sv.importP')}</p><textarea id="svIn" style="width:100%;height:110px;font-size:11px;border-radius:12px;padding:8px" placeholder="MLT1:…"></textarea><button class="btn g" id="svGo" style="width:100%;margin-top:8px">${t('sv.restore')}</button><button class="btn w" id="svNo" style="width:100%;margin-top:8px">${t('new.no')}</button>`);
  $('svNo').onclick = closeModal;
  $('svGo').onclick = () => { try { const raw = $('svIn').value.trim(); if (!raw.startsWith('MLT1:')) throw 0; const data = JSON.parse(decodeURIComponent(escape(atob(raw.slice(5))))); for (const [k, v] of Object.entries(data)) if (k.startsWith('ahq_')) localStorage.setItem(k, v); toast('✅ ' + t('sv.done'), 1500); setTimeout(() => location.reload(), 900); } catch (e) { toast('⚠️ ' + t('sv.bad'), 2500); } };
}
// ---------------- online save: every ahq_ key is mirrored to the player's private rows (db capability, data/users/<id>/…).
// The phone's local storage alone can be wiped (iOS, in-app browsers, new device); on start the newest/most advanced copy wins.
const CLOUD = { api: null, uid: null, ready: false, sent: {}, timer: 0, early: new Set(), busy: false, on: false };
const LS_SET = Storage.prototype.setItem;
const CLOUD_SKIP = new Set(['ahq_sync_at', 'ahq_gfx', 'ahq_gfx_hint2']);
function lsAt() { try { return JSON.parse(localStorage.getItem('ahq_sync_at')) || {}; } catch (e) { return {}; } }
Storage.prototype.setItem = function (k, v) {
  LS_SET.call(this, k, v);
  if (this !== localStorage || typeof k !== 'string' || !k.startsWith('ahq_') || CLOUD_SKIP.has(k)) return;
  try { const a = lsAt(); a[k] = Date.now(); LS_SET.call(localStorage, 'ahq_sync_at', JSON.stringify(a)); } catch (e) {}
  if (!CLOUD.ready) CLOUD.early.add(k); else cloudSoon();
};
const cloudProgress = (k, v) => { try { const o = JSON.parse(v); if (/_v2$/.test(k) && o) return (o.stars || 0) * 100000 + (o.day || 0); } catch (e) {} return null; };
function cloudSoon(ms = 4000) { if (!CLOUD.ready) return; clearTimeout(CLOUD.timer); CLOUD.timer = setTimeout(cloudPush, ms); }
async function cloudPush() {
  if (!CLOUD.ready || CLOUD.busy) { if (CLOUD.ready) cloudSoon(2000); return; }
  CLOUD.busy = true; const at = lsAt();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); if (!k || !k.startsWith('ahq_') || CLOUD_SKIP.has(k)) continue;
      let v = localStorage.getItem(k); if (v == null || CLOUD.sent[k] === v) continue;
      if (v.length > 240000) { try { const o = JSON.parse(v); delete o.vis; v = JSON.stringify(o); } catch (e) { continue; } } // stay under row-size limits
      await CLOUD.api.put(k, v, at[k] || Date.now());
      CLOUD.sent[k] = localStorage.getItem(k);
    }
  } catch (e) { console.warn('[cloud] push', e && (e.code || e.message)); if (e && (e.code === 'revoked' || e.code === 'invalid_argument')) CLOUD.ready = false; }
  CLOUD.busy = false;
}
// two backends, one sync: the standalone app (Supabase accounts, window.MLT_ACCOUNT from account.js) or the Claude artifact's db
async function cloudBackend() {
  if (window.MLT_APP) {
    for (let i = 0; i < 100 && !window.MLT_ACCOUNT; i++) await new Promise((r) => setTimeout(r, 100));
    return window.MLT_ACCOUNT ? window.MLT_ACCOUNT.api() : null;
  }
  if (!window.claude || !window.claude.use) return null;
  const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
  const uid = user && (await user.id()); if (!db || !uid) return null;
  const col = db.collection('data/users/' + uid);
  return { uid, list: async () => (await col.get()).docs.map((d) => ({ k: d.id, ...(d.data() || {}) })), put: (k, v, at) => col.doc(k).set({ v, at }) };
}
let cloudHooked = false;
async function cloudInit() {
  try {
    CLOUD.ready = false; CLOUD.on = false;
    const api = await cloudBackend(); if (!api) { const ci = document.getElementById('cloudInfo'); if (ci && !inGame) ci.textContent = t(window.MLT_APP ? 'sv.cloudOffApp' : 'sv.cloudOff'); return; }
    CLOUD.api = api; CLOUD.uid = api.uid; CLOUD.sent = {};
    const rows = await Promise.race([api.list(), new Promise((_, rej) => setTimeout(() => rej({ code: 'timeout' }), 10000))]);
    const at = lsAt(); let got = 0;
    for (const b of rows) {
      const k = b.k; if (!k || !k.startsWith('ahq_') || typeof b.v !== 'string') continue;
      const loc = localStorage.getItem(k); CLOUD.sent[k] = b.v;
      if (loc === b.v) continue;
      let useCloud;
      if (loc == null || !at[k]) useCloud = true;                       // wiped / new device: take the online copy
      else if (CLOUD.early.has(k)) { const pl = cloudProgress(k, loc), pc = cloudProgress(k, b.v); useCloud = pl != null && pc != null ? pc > pl : (b.at || 0) > at[k]; } // written before sync: never let a fresh start erase progress
      else useCloud = (b.at || 0) > at[k];                              // otherwise the newest copy wins
      if (k === 'ahq_profile') { try { const L = JSON.parse(loc || '{}'), C = JSON.parse(b.v), W = useCloud ? C : L, O = useCloud ? L : C; W.stars = W.stars || {}; for (const [c, n] of Object.entries(O.stars || {})) W.stars[c] = Math.max(W.stars[c] || 0, n); if (O.cu) W.cu = Object.assign({}, O.cu, W.cu); const js = JSON.stringify(W); if (js !== loc) { LS_SET.call(localStorage, k, js); got++; } at[k] = Math.max(b.at || 0, at[k] || 0); continue; } catch (e) {} }
      if (useCloud) { LS_SET.call(localStorage, k, b.v); at[k] = b.at || Date.now(); got++; }
    }
    LS_SET.call(localStorage, 'ahq_sync_at', JSON.stringify(at));
    CLOUD.ready = true; CLOUD.on = true; cloudSoon(500);
    if (!cloudHooked) { cloudHooked = true;
      addEventListener('pagehide', () => { if (inGame) save(); cloudPush(); });
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { if (inGame) save(); cloudPush(); } }); }
    if (got && !inGame) { refreshTitle(); toast(t('sv.cloudGot'), 4000); }
    const ci = document.getElementById('cloudInfo'); if (ci) ci.textContent = t(window.MLT_APP ? 'sv.cloudOnApp' : 'sv.cloudOn');
  } catch (e) { console.warn('[cloud] init', e && (e.code || e.message)); }
}
window.mltCloudStart = cloudInit; // the account screen calls this after sign-in
window.mltCloudStop = () => { CLOUD.ready = false; CLOUD.on = false; CLOUD.api = null; const ci = document.getElementById('cloudInfo'); if (ci) ci.textContent = t(window.MLT_APP ? 'sv.cloudOffApp' : 'sv.cloudOff'); };
setTimeout(cloudInit, 0);
function toMap() { if (inGame) save(); AU.setCity('london'); inGame = false; RNG = Math.random; resetRuntime(); buildCityDecor('london'); showMap(); } // progress is kept: reopen the city from the map
function toTitle() { AU.setCity('london'); inGame = false; RNG = Math.random; resetRuntime(); buildCityDecor('london'); refreshTitle(); show('title'); }
function cityStars(c) { const p = profile(); const s = load(c); return Math.max((p.stars || {})[c] || 0, s ? s.stars : 0); }
function cityUnlocked(c) { const C = CITIES[c]; return !C.unlock || localStorage.getItem('ahq_unlock') === '1' || cityStars(C.unlock) >= 1; }
// playtest shortcut: tap the star counter on the title screen 5 times to open every city (again to close them)
{ let n = 0, tm = 0; document.getElementById('starTotal').addEventListener('click', () => { clearTimeout(tm); tm = setTimeout(() => (n = 0), 1500); if (++n < 5) return; n = 0;
  const on = localStorage.getItem('ahq_unlock') !== '1'; localStorage.setItem('ahq_unlock', on ? '1' : '0'); toast(on ? '🔓 ' + t('dev.unlockOn') : '🔒 ' + t('dev.unlockOff'), 3000); refreshTitle(); renderMap(); }); }
function refreshTitle() {
  $('bRestore').textContent = '📥 ' + t('sv.import'); $('bRestore').onclick = importSave;
  const last = profile().last || 'london', s = load(last) || load('london'); $('bContinue').disabled = !s;
  $('contInfo').textContent = s ? t('city.' + (s.city || 'london')) + ' · ' + dayN(s.day) + ' · ' + money(s.cash) : t('title.noSave');
  $('starTotal').textContent = Object.keys(CITIES).reduce((a, c) => a + cityStars(c), 0) + ' / 66 ★';
  const ci = document.getElementById('cloudInfo'); if (ci) ci.textContent = CLOUD.on ? t(window.MLT_APP ? 'sv.cloudOnApp' : 'sv.cloudOn') : t(window.MLT_APP ? 'sv.cloudOffApp' : 'sv.cloudOff');
}
let mapCity = 'london';
function renderMap() {
  const inner = $('mapInner'); inner.querySelectorAll('.pin').forEach((x) => x.remove());
  for (const [k, C] of Object.entries(CITIES)) {
    const ok = cityUnlocked(k), b = document.createElement('button'); b.className = 'pin ' + (k === mapCity ? 'g' : ok ? 'w' : 'y');
    b.style.left = C.pin[0] + '%'; b.style.top = C.pin[1] + '%'; b.textContent = (ok ? '' : '🔒 ') + t('city.' + k) + (cityStars(k) ? ' ' + '★'.repeat(cityStars(k)) : '');
    b.onclick = () => { if (!ok) { toast(t('map.lockC', { city: t('city.' + C.unlock) })); return; } mapCity = k; renderMap(); }; inner.appendChild(b);
  }
  for (const [nk, x, y] of LOCKED_PINS) { const b = document.createElement('button'); b.className = 'pin y'; b.style.cssText = `left:${x}%;top:${y}%;font-size:12px`; b.textContent = '🔒 ' + t(nk); b.onclick = () => toast(t('map.soon')); inner.appendChild(b); }
  const C = CITIES[mapCity], s = load(mapCity), st = cityStars(mapCity);
  $('mapSheet').innerHTML = `<div class="grab"></div><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="lbl">${t('map.lvl', { n: C.lvl + 1 })} · ${t(C.region)}</div><h2 class="f" style="margin:0;font-size:30px">${t('city.' + mapCity)}</h2></div><div class="stars" style="font-size:22px">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</div></div>
    <div style="font-weight:700;color:#2D3748;font-size:14.5px">${t(C.desc)}</div><div>${C.chips.map(([c, k]) => `<span class="chip ${c}">${t(k)}</span>`).join('')}</div>
    <button class="btn g" id="mOpen" style="font-size:20px">${s ? t('map.contC', { city: t('city.' + mapCity) }) : t('map.openC', { city: t('city.' + mapCity) })}</button>`;
  $('mOpen').onclick = openBrief;
}
function showMap() { const l = profile().last; if (l && CITIES[l] && cityUnlocked(l)) mapCity = l; renderMap(); show('map'); requestAnimationFrame(() => { const sc = $('mapScroll'), w = $('mapInner').clientWidth; sc.scrollLeft = w * CITIES[mapCity].pin[0] / 100 - sc.clientWidth / 2; }); }
function openBrief() {
  const C = CITIES[mapCity], s = load(mapCity);
  buildCityDecor(mapCity); view.tx = 19; view.tz = 18; view.half = 24; placeCam();
  GOALS = mkGoals(C.goals);
  $('briefBody').innerHTML = `<div><h1 class="f" style="margin:0;font-size:32px">${t('city.' + mapCity)}</h1><div style="font-weight:700;color:#2D3748">${t(C.brief)}</div></div>
    <div class="lbl">${t('brief.rules')}</div>${C.rules.map(([e, k]) => `<div class="rule w">${e} <span>${t(k)}</span></div>`).join('')}
    ${(() => { const lp = Object.keys(PROBLEMS).filter((k) => PROBLEMS[k].city === mapCity); return lp.length ? `<div class="lbl" style="margin-top:4px">${t('br.probs')}</div><div class="w" style="border-radius:16px;padding:8px 12px">${lp.map((k) => `<div style="font-size:13px;margin:3px 0"><b>${PROBLEMS[k].e} ${t('p.' + k)}</b> → ${ROOMS[PROBLEMS[k].room].e} ${rn(PROBLEMS[k].room)}<div style="color:#4A5568;font-weight:700">${t('pd.' + k)}</div></div>`).join('')}</div>` : ''; })()}
    ${(() => { const lv = CITIES[mapCity].lvl || 0, nb = Object.keys(BEH).filter((k) => BEH[k] === lv); return nb.length ? `<div class="lbl" style="margin-top:4px">${t('br.new')}</div><div class="w" style="border-radius:16px;padding:8px 12px">${nb.map((k) => `<div style="font-size:13px;margin:3px 0"><b>${BEH_E[k]} ${t('bh.' + k)}</b><div style="color:#4A5568;font-weight:700">${t('bh.' + k + '.d')}</div></div>`).join('')}</div>` : ''; })()}
    <div class="lbl" style="margin-top:4px">${t('brief.goals')}</div><div class="w" style="border-radius:16px;padding:8px 12px">${GOALS.map((g, i) => `<div class="goal"><span><span class="stars">${'★'.repeat(i + 1)}</span> ${goalText(g)}</span><span style="color:${s && s.stars > i ? '#1E8A3A' : 'var(--muted)'}">${s && s.stars > i ? t('goals.done') : ''}</span></div>`).join('')}</div>
    <div style="display:flex;justify-content:space-between;font-weight:800;font-size:13px;color:#2D3748"><span>${t('brief.budgetC', { m: money(C.cash) })}</span><span>${t('brief.rentC', { m: money(Math.round(C.rent * BILL_K / 50) * 50) })}</span></div>
    <button class="btn g" id="bOpen" style="font-size:21px;margin-top:auto">${t('brief.open')}</button>`;
  $('briefTag').textContent = t(C.tag);
  $('bOpen').onclick = () => { const sv = load(mapCity); if (sv) { RNG = Math.random; S = sv; S.city = S.city || mapCity; startGame(); } else startNew(mapCity); };
  show('brief');
}
function resetCareer() { for (const c of Object.keys(CITIES)) localStorage.removeItem(saveKey(c)); const p = profile(); p.stars = {}; p.last = 'london'; localStorage.setItem('ahq_profile', JSON.stringify(p)); }
$('bContinue').onclick = showMap;
$('bNew').onclick = () => {
  const go = () => { resetCareer(); mapCity = 'london'; if (!loadMgr()) openCreate('map'); else showMap(); };
  if (Object.keys(CITIES).some((c) => load(c))) { modal(`<div style="font-size:44px">🧹</div><h2>${t('new.confirmT')}</h2><p>${t('new.confirmP')}</p><div class="row2" style="margin-top:10px"><button class="btn y" id="nNo">${t('new.no')}</button><button class="btn g" id="nYes">${t('new.yes')}</button></div>`); $('nNo').onclick = closeModal; $('nYes').onclick = () => { closeModal(); go(); }; }
  else go();
};
$('bMgr').onclick = () => openCreate('title');
$('bQuick').onclick = () => startQuick(false);
$('bDaily').onclick = () => startQuick(true);
$('bLang').onclick = openLang;
$('mBack').onclick = () => { refreshTitle(); show('title'); };
$('bBack').onclick = () => { buildCityDecor('london'); showMap(); };
document.addEventListener('visibilitychange', () => { if (document.hidden && S && inGame) save(); });
addEventListener('pagehide', () => { if (S && inGame) save(); }); addEventListener('blur', () => { if (S && inGame) save(); });

setLang(detectLang()); applyStatic();
S = newState();
buildWorld(); resize(); refreshTitle();
// ---------------- manager actions ----------------
const MGR_CD = 45, AURA_R = 3.5; let mgrPick = null;
const auraRing = new THREE.Mesh(new THREE.RingGeometry(AURA_R - 0.1, AURA_R, 56), new THREE.MeshBasicMaterial({ color: '#FFD25E', transparent: true, opacity: 0.6, depthWrite: false }));
auraRing.rotation.x = -Math.PI / 2; auraRing.visible = false; auraRing.renderOrder = 2; scene.add(auraRing);
{ const f = new THREE.Mesh(new THREE.CircleGeometry(AURA_R, 56), new THREE.MeshBasicMaterial({ color: '#FFD25E', transparent: true, opacity: 0.1, depthWrite: false })); auraRing.add(f); }
function mgrSpot() { return S.mgrSpot || (S.mgrSpot = { x: 3.6, z: 1.3 }); }
function inAura(p) { if (!R.mgr || R.mgr.path.length) return false; const s = R.mgr.av.position; return Math.hypot(p.x - s.x, p.z - s.z) < 2.6; } // around the boss, wherever they stand
const mgrRoomF = (id) => (S.mgrHelp && S.mgrHelp.kind === 'room' && S.mgrHelp.id === id ? S.mgrHelp.f || 1.6 : 1);
const mgrDeskF = () => (S.mgrHelp && S.mgrHelp.kind === 'desk' ? S.mgrHelp.f || 2 : 1);
function mgrHome() { const M = R.mgr; if (!M) return; M.task = null; M.idleT = 1.5; }
function mgrGo(task, auto) {
  const M = R.mgr; if (!M) return;
  if (!auto && S.mgrCd > 0) { toast(t('mg.cd', { s: Math.ceil(S.mgrCd) }), 1400); return; }
  if (auto) { M.autoCd = 14; task.auto = true; } else S.mgrCd = MGR_CD;
  S.mgrHelp = null; M.task = task; M.look = null;
  let dest;
  if (task.kind === 'v') { const p = task.v.av.position; dest = { x: p.x + 0.55, z: p.z + 0.35 }; }
  else if (task.kind === 'room') { const r = R.rooms[task.id]; dest = doorPt(r.def, -0.9); }
  else { const d = deskSpot(); dest = { x: d.x + 0.9, z: d.z - 0.3 }; }
  setPath(M, findPath(M.av.position, dest)); if (!auto) toast('⭐ ' + t('mg.onWay', { name: MGR.name }), 1600);
}
function mgrArrive() {
  const M = R.mgr, tk = M.task; if (!tk) return;
  if (tk.kind === 'v') {
    const v = tk.v; M.task = null;
    if (!R.visitors.includes(v) || ['exit', 'angry'].includes(v.state)) { toast(t('mg.late'), 1600); mgrHome(); return; }
    v.pat = Math.min(1, v.pat + 0.5); v.prio = true; floatAt(v.av.position, '😌 +50%');
    if (!v.known && R.deskQ.includes(v)) finishCheckin(v);
    M.av.lookAt(v.av.position.x, M.av.position.y, v.av.position.z); M.cheer = 1.0; mgrHome(); return;
  }
  if (tk.kind === 'patrol') { M.task = null; M.idleT = 3 + RNG() * 3; return; }
  if (tk.kind === 'room') { if (!R.rooms[tk.id]) { mgrHome(); return; } const rm = R.rooms[tk.id]; M.look = Math.atan2(rm.cx - M.av.position.x, rm.cz - M.av.position.z); S.mgrHelp = { kind: 'room', id: tk.id, t: tk.auto ? 15 : 25, f: tk.auto ? 1.3 : 1.6 }; floatAt(M.av.position, tk.auto ? '⚡ ×1.3' : '⚡ ×1.6'); }
  else { S.mgrHelp = { kind: 'desk', t: tk.auto ? 15 : 25, f: tk.auto ? 1.5 : 2 }; floatAt(M.av.position, tk.auto ? '⚡ ×1.5' : '⚡ ×2'); }
  M.task = null; M.cheer = 0.8;
}
function openMgr() {
  if (!inGame || !R.mgr) return; selectVisitor(null);
  const pc = S.pepCd > 0 ? Math.ceil(S.pepCd) : 0, mc = S.mgrCd > 0 ? Math.ceil(S.mgrCd) : 0;
  openSheet(`<div style="display:flex;gap:12px;align-items:center;margin-bottom:6px"><img src="${mgrPortrait()}" style="width:58px;height:58px;border-radius:50%;border:3px solid var(--gold-b)"><div><h2 style="margin:0">${MGR.name}</h2><p class="sub" style="margin:0">${t('mg.sub', { g: MGR.pron })}</p></div></div>
  <div class="opt w"><div class="oi" style="background:#FFF3C4">📣</div><div class="ot"><b>${t('pep.btn')}</b><div>${t('pep.go')}</div></div><button class="btn g" id="mgPep" ${pc ? 'disabled' : ''}>${pc ? pc + 's' : t('mg.do')}</button></div>
  <div class="opt w"><div class="oi" style="background:#FFE1DC">🎯</div><div class="ot"><b>${t('mg.go')}</b><div>${t('mg.goD')}</div></div><button class="btn g" id="mgGo" ${mc ? 'disabled' : ''}>${mc ? mc + 's' : t('mg.do')}</button></div>
  <div class="opt w"><div class="oi" style="background:#FFF8E0">🚶</div><div class="ot"><b>${t('mg.auto')}</b><div>${t('mg.autoD')}</div></div><button class="btn ${S.mgrAuto !== false ? 'g' : 'y'}" id="mgAuto">${S.mgrAuto !== false ? t('mg.on') : t('mg.off')}</button></div>`);
  $('mgPep').onclick = () => { closeSheet(); pepTalk(); };
  $('mgGo').onclick = () => { closeSheet(); startPick('go'); };
  $('mgAuto').onclick = () => { S.mgrAuto = S.mgrAuto === false; save(); openMgr(); };
}
function startPick(kind) { mgrPick = { kind }; $('pickTxt').textContent = kind === 'go' ? '🎯 ' + t('mg.pickGo') : '📍 ' + t('mg.pickAura'); $('pickbar').classList.add('on'); }
function endPick() { mgrPick = null; $('pickbar').classList.remove('on'); }
$('pickX').onclick = endPick;
function mgrPickAt(e) {
  if (mgrPick.kind === 'go') {
    const v = pickVisitor(e); if (v) { if (['exit', 'angry'].includes(v.state)) { toast(t('mg.late')); return; } endPick(); mgrGo({ kind: 'v', v }); return; }
    if (ray.intersectObject(world.desk, true).length) { endPick(); mgrGo({ kind: 'desk' }); return; }
    if (ray.ray.intersectPlane(gPlane, gHit)) { const hr = S.rooms.find((r) => { const q = roomRect(r); return gHit.x > q.x0 && gHit.x < q.x1 && gHit.z > q.z0 && gHit.z < q.z1; }); if (hr && ROOMS[hr.type].role) { endPick(); mgrGo({ kind: 'room', id: hr.id }); return; } }
    toast(t('mg.pickNone'), 1400); return;
  }
  if (ray.ray.intersectPlane(gPlane, gHit) && inFloor(gHit.x, gHit.z) && !S.rooms.some((r) => { const q = roomRect(r); return gHit.x > q.x0 && gHit.x < q.x1 && gHit.z > q.z0 && gHit.z < q.z1; })) { S.mgrSpot = { x: gHit.x, z: gHit.z }; endPick(); if (!R.mgr.task && !S.mgrHelp) mgrHome(); save(); return; }
  toast(t('mg.pickBad'), 1400);
}
function pickVisitor(e) { // finger-friendly: nearest visitor to the tap (body or the bubble over their head) within ~a fingertip
  let best = null, bd = 50;
  for (const v of R.visitors) { if (v.state === 'exit' || !v.av.visible) continue; const t0 = v.look.tall || 1;
    for (const y of [0.5 * t0, 1.1 * t0, 2.3]) { const [sx, sy] = toScreen(v.av.position.x, y, v.av.position.z); const d = Math.hypot(sx - e.clientX, sy - e.clientY); if (d < bd) { bd = d; best = v; } } }
  if (best) return best;
  const hits = ray.intersectObjects(R.visitors.map((v) => v.av), true);
  if (hits.length) { const owner = hits[0].object.userData.owner; const v = R.visitors.find((x) => x.av === owner || x.av === hits[0].object.parent); if (v) return v; }
  return null;
}
// ---------------- inspect: desk & room queues ----------------
function vChip(v) { const c = v.pat > 0.6 ? '#7ACB4E' : v.pat > 0.3 ? '#FFB800' : '#E5484D'; return `<button class="vchip w" data-vid="${v.id}"><span class="vf">${v.em ? '🚨' : v.vip ? '👑' : v.known && !isMystK(v.prob) ? PROBLEMS[v.prob].e : '❔'}</span><span class="vn">${v.name}</span><i style="width:${Math.round(v.pat * 100)}%;background:${c}"></i></button>`; }
function bindChips() { $('sheet').querySelectorAll('[data-vid]').forEach((b) => b.onclick = () => { const v = R.visitors.find((x) => x.id === +b.dataset.vid); closeSheet(); if (v) selectVisitor(v); }); }
// express check-in upgrades: ×2 then ×3 speed for one desk (pricey on purpose)
const DESK_UP = [0, 6000, 15000];
const deskLv = (di) => ((desks()[di] || {}).lv || 1);
function deskUpRow(di) { const lv = deskLv(di); if (lv >= 3) return `<div class="msg">⚡ ${t('dk.upMax')}</div>`;
  return `<div class="opt w" style="margin-top:8px"><div class="oi" style="background:#FFF3C4">⚡</div><div class="ot"><b>${t('dk.up', { x: lv + 1 })}</b><div>${t('dk.upD', { x: lv + 1 })}</div></div><button class="btn g" id="dkUp" ${S.cash < DESK_UP[lv] ? 'disabled' : ''}>${money(DESK_UP[lv])}</button></div>`; }
function bindDeskUp(di, reopen) { const b = $('dkUp'); if (!b) return; b.onclick = () => { const lv = deskLv(di); if (S.cash < DESK_UP[lv]) return; S.cash -= DESK_UP[lv]; if (di === 0 && S.desk.segs) S.desk.segs.forEach((sg) => (sg.lv = lv + 1)); else desks()[di].lv = lv + 1; AU.sfx('build'); toast('⚡ ' + t('dk.up', { x: lv + 1 }), 2000); save(); reopen(); }; }
const DESK_LONG = 2500;
function lengthenDesk() {
  const lv = S.desk.lv || 1; S.desk.segs = [{ lv }, { lv }];
  // extra desks shift up one index: move their hosts and lines along
  for (const rs of R.staff) if (rs.at === 'desk' && (rs.desk || 0) >= 1) rs.desk++;
  R.deskQs.splice(1, 0, []);
  for (const v of R.visitors) if ((v.desk || 0) >= 1) v.desk++;
  placeDesk(); assignStaff(); const h = deskHost(0); if (h) goStaff(h, deskSpot(0));
  for (const v of R.deskQ.slice(Math.ceil(R.deskQ.length / 2))) { R.deskQ.splice(R.deskQ.indexOf(v), 1); joinQueue(v); } // half the line moves over
}
function openDesk() {
  if (!inGame || placingR || moving) return; selectVisitor(null);
  const host = R.staff.find((rs) => rs.at === 'desk'), q = R.deskQ, avg = q.length ? Math.round(q.reduce((a, v) => a + v.pat, 0) / q.length * 100) : 100;
  let h = `<h2>🛎️ ${t('dk.title')}</h2><p class="sub">${host ? t('dk.host', { name: host.data.name }) : '⚠️ ' + t('desk.need')} · ${t('dk.line', { n: q.length })}${q.length ? ' · ' + t('dk.mood', { p: avg }) : ''}</p>`;
  h += q.length ? `<div class="chips">${q.slice(0, 12).map(vChip).join('')}</div>${q.length > 12 ? `<div class="sub">+${q.length - 12}</div>` : ''}` : `<div class="msg">${t('dk.empty')}</div>`;
  if (q.length >= 6) h += `<div class="msg">💡 ${t('dk.tip')}</div>`;
  if (!S.desk.segs) h += `<div class="opt w" style="margin-top:8px"><div class="oi" style="background:#DDF3E2">🛎️🛎️</div><div class="ot"><b>${t('dk.long')}</b><div>${t('dk.longD')}</div></div><button class="btn g" id="dkLong" ${S.cash < DESK_LONG ? 'disabled' : ''}>${money(DESK_LONG)}</button></div>`;
  else h += `<div class="msg">🛎️🛎️ ${t('dk.longOn', { a: deskHost(0) ? deskHost(0).data.name : '—', b: deskHost(1) ? deskHost(1).data.name : t('desk.need') })}</div>`;
  h += deskUpRow(0);
  h += `<div class="row2" style="margin-top:10px"><button class="btn y" id="dkMove">✋ ${t('build.moveDesk')}</button>${host ? `<button class="btn g" id="dkMgr" ${S.mgrCd > 0 ? 'disabled' : ''}>⭐ ${t('dk.mgr')}</button>` : `<button class="btn g" id="dkHire">${t('next.host')}</button>`}</div>`;
  openSheet(h); bindChips(); bindDeskUp(0, openDesk);
  { const b = $('dkLong'); if (b) b.onclick = () => { if (S.cash < DESK_LONG) return; S.cash -= DESK_LONG; lengthenDesk(); AU.sfx('build'); toast('🛎️🛎️ ' + t(R.staff.some((rs) => rs.data.role === 'host' && (!rs.at || rs.at === 'idle')) ? 'desk2.done' : 'desk2.hire'), 3000); save(); openDesk(); }; }
  $('dkMove').onclick = () => { closeSheet(); startMove(); };
  const m = $('dkMgr'); if (m) m.onclick = () => { closeSheet(); mgrGo({ kind: 'desk' }); };
  const hh = $('dkHire'); if (hh) hh.onclick = () => openHire('host');
}
function roomQueueHtml(room) {
  const q = roomQ(room.id), cap = room.spots.length, busy = room.spots.filter((s) => s.busy).length, others = Object.values(R.rooms).filter((r) => r.type === room.type && r.id !== room.id);
  let h = `<div class="lbl" style="margin:2px 0 6px">👥 ${t('rq.title', { n: q.length })} · ${t('rq.inUse', { a: busy, b: cap })}</div>`;
  h += q.length ? `<div class="chips">${q.slice(0, 12).map(vChip).join('')}</div>` : `<div class="msg">${t('rq.empty')}</div>`;
  if (q.length >= 2 && others.length) h += `<button class="btn g" id="rqSplit" style="width:100%;margin-top:8px">↔️ ${t('rq.split', { room: rn(room.type) + roomNo(others[0]) })}</button>`;
  else if (q.length >= 4 && !others.length) h += `<div class="msg">💡 ${t('rq.tip', { room: rn(room.type) })}</div>`;
  if (ROOMS[room.type].role) h += `<button class="btn w" id="rqMgr" style="width:100%;margin-top:8px" ${S.mgrCd > 0 ? 'disabled' : ''}>⭐ ${t('rq.mgr', { name: MGR.name })}</button>`;
  return h;
}
function bindRoomQueue(room) {
  bindChips();
  const s = $('rqSplit'); if (s) s.onclick = () => { const n = splitQueue(room.id); closeSheet(); toast('↔️ ' + t('rq.moved', { n }), 1800); };
  const m = $('rqMgr'); if (m) m.onclick = () => { closeSheet(); mgrGo({ kind: 'room', id: room.id }); };
}
// ---------------- visitor card helpers ----------------
function feeFor(v) { if (isMystK(v.prob)) return 0; const pr = (S.price || 1) * (cityOf().hustle ? 1.1 : 1) * (isNight() ? 1.15 : 1); return Math.round(PROBLEMS[v.prob].fee * 1.3 * (0.7 + S.vibes / 200) * pr) * (v.vip ? 2 : 1); }
function leaveCost(v) { return (v.known && !isMystK(v.prob) && !hasRoom(PROBLEMS[v.prob].room) ? 1 : PROBLEMS[v.prob].care ? 5 : 3) + (v.vip ? 10 : 0); }
function vThought(v) {
  const need = v.known ? needOf(v) : null, host = R.staff.some((rs) => rs.at === 'desk' && rs.mode === 'there');
  if (['exit'].includes(v.state)) return t('th.happy');
  if (v.state === 'angry') return t('th.gone');
  if (v.em) return t('th.em');
  if (v.need > 1 && !hasRoom('toilet')) return t('th.loo');
  if (need && !hasRoom(need)) return t('th.noRoom', { room: rn(need) });
  if (S.ev && S.ev.k === 'power') return t('th.power');
  if (R.rats.length) return t('th.rats');
  if (R.litter.length >= 4) return t('th.dirty');
  if (['queue', 'toQueue'].includes(v.state) && !host) return t('th.noHost');
  if (need && v.target != null && R.rooms[v.target] && !R.rooms[v.target].staff.some((s) => s && s.mode === 'there')) return t('th.noStaff', { room: rn(need) });
  if (v.pat < 0.3) return t('th.long');
  if (['queue', 'toQueue'].includes(v.state) && DQ(v.desk || 0).length > 4) return t('th.line');
  if ((S.price || 1) > 1.2) return t('th.price');
  if (inAura(v.av.position)) return t('th.boss', { name: MGR.name });
  return v.pat > 0.7 ? t('th.good') : t('th.ok');
}
// ---------------- save / restore visitors ----------------
function snapVisitor(v) { const p = v.av.position; return { prob: v.prob, em: v.em, vip: v.vip, name: v.name, age: v.age, known: v.known, pat: v.pat, need: v.need || 0, urgent: !!v.urgent, x: p.x, z: p.z, look: v.look, gid: v.gid, spent: v.spent || 0, waitT: v.waitT || 0, prio: !!v.prio }; }
function restoreVisitors() {
  const list = S.vis || []; S.vis = null;
  for (const d of list) {
    if (!PROBLEMS[d.prob]) continue;
    const v = spawnVisitor(d.prob, d.em, false, d.look); Object.assign(v, { name: d.name, age: d.age, pat: d.pat, need: d.need, urgent: d.urgent, gid: d.gid, spent: d.spent, waitT: d.waitT, prio: d.prio || d.em });
    if (d.vip) { v.vip = true; const cr = new THREE.Sprite(iconTex('👑')); cr.scale.set(0.45, 0.45, 1); cr.position.set(0.35, 2.5 * v.look.tall, -0.35); cr.renderOrder = 10; v.hud.add(cr); }
    v.av.position.set(d.x, 0.1, d.z);
    if (d.known) finishCheckin(v, true); else { const i = R.deskQ.indexOf(v); setPath(v, [QUEUE(i)]); }
  }
}

// ---------------- audio settings & PA ----------------
function say(k, txt, cd = 45) { if (!S || !inGame || speedMul === 0 || sheetPaused || modalPaused && cd) return; AU.announce(k, txt, getLang(), cd); }
function openAudio() {
  const row = (k, ic) => `<div class="opt w"><div class="oi" style="background:#EEF2F7">${ic}</div><div class="ot"><b>${t('au.' + k)}</b><div>${t('au.' + k + 'D')}</div></div><button class="btn ${AU.st[k] ? 'g' : 'y'}" data-au="${k}">${AU.st[k] ? t('au.on') : t('au.off')}</button></div>`;
  const gb = (k) => `<button class="btn ${GFX.pref === k ? 'g' : 'w'}" data-gfx="${k}" style="flex:1;padding:8px 4px;font-size:14px">${t('gfx.' + k)}</button>`;
  openSheet(`<h2>🔊 ${t('au.title')}</h2>` + row('music', '🎵') + row('sfx', '🔔') + row('voice', '📢') + `<div class="opt w" style="display:block"><div class="ot"><b>🖥️ ${t('gfx.title')}</b><div>${t('gfx.D', { m: t('gfx.' + GFX.mode) })}</div></div><div style="display:flex;gap:6px;margin-top:8px">${gb('auto')}${gb('high')}${gb('low')}</div></div><button class="btn w" id="scBtn" style="width:100%;margin-top:8px">🎨 ${t('sc.btn')}</button>`);
  $('scBtn').onclick = () => { closeSheet(); startShowcase().catch((e) => toast(String(e))); };
  $('sheet').querySelectorAll('[data-gfx]').forEach((b) => b.onclick = () => { const k = b.dataset.gfx; try { if (k === 'auto') { localStorage.removeItem('ahq_gfx'); localStorage.removeItem('ahq_gfx_hint2'); } else localStorage.setItem('ahq_gfx', k); } catch (e) {} save(); location.reload(); });
  $('sheet').querySelectorAll('[data-au]').forEach((b) => b.onclick = () => { const k = b.dataset.au; AU.set(k, !AU.st[k]); if (k === 'voice' && AU.st.voice) AU.announce('test', t('au.test'), getLang(), 0); openAudio(); });
}
for (const ev of ['pointerdown', 'touchend', 'click']) addEventListener(ev, () => { AU.ensure(); if (inGame) AU.startMusic(); }, { passive: true }); // iOS only unlocks audio on some of these
// ---------------- staff cover ----------------
let coverT = 0;
function staffCover(dt) {
  coverT += dt; if (coverT < 3) return; coverT = 0;
  for (const room of Object.values(R.rooms)) {
    const role = ROOMS[room.type].role; if (!role || role === 'host' || room.closed || room.staff.some(Boolean) || !room.staffSpots[0]) continue;
    if (!R.visitors.some((v) => v.state === 'wait' && v.known && needOf(v) === room.type)) continue;
    const donor = R.staff.find((rs) => {
      if (rs.data.role !== role || rs.mode !== 'there' || rs.onBreak || rs.data.awayT > 0) return false;
      const A = R.rooms[rs.at]; if (!A || A.id === room.id || A.type === room.type) return false;
      if (A.spots.some((s) => s.st === rs.st && s.busy)) return false;
      if (R.visitors.some((v) => (v.state === 'wait' || v.state === 'toWait') && v.known && needOf(v) === A.type)) return false;
      return true;
    });
    if (!donor) continue;
    const A = R.rooms[donor.at]; A.staff[donor.st] = null;
    donor.at = room.id; donor.st = 0; room.staff[0] = donor; goStaff(donor, room.staffSpots[0]);
    floatAt(donor.av.position, '🔁'); toast('🔁 ' + t('cover.go', { name: donor.data.name.split(' ')[0], room: rn(room.type), from: rn(A.type) }), 2200);
    say('cover' + room.id, t('cover.go', { name: donor.data.name.split(' ')[0], room: rn(room.type), from: rn(A.type) }), 40);
  }
}

const MODELS_URL = (() => { const q = new URLSearchParams(location.search).get('models'); return q && !/:\/\//.test(q) ? q : 'models/manifest.json'; })();
function swapStaffAvatar(rs) {
  const old = rs.av, av = person(staffLook(rs.data), 'staff'); if (!av.userData.p.glb) return;
  av.position.copy(old.position); av.rotation.copy(old.rotation); scene.remove(old); scene.add(av); rs.av = av; delete portraits['s' + rs.data.id];
  const p = av.userData.p, sp = rs.target;
  if (rs.mode === 'walk') poseWalk(p, 0); else if (rs.mode === 'there') { rs.busyPose = null; if (sp && sp.sit) poseSit(p); else poseStand(p); } else if (sp && sp.sit) poseSit(p); else poseStand(p);
}
CHAR.onModel = (role) => { if (role.startsWith('mgr_')) { refreshMgrModel(); return; } if (VIS[role]) { for (const v of R.visitors) if (v.look.vm === role && !v.av.userData.p.glb) swapVisitorAvatar(v); return; } for (const rs of R.staff) if (rs.data.role === role && !rs.av.userData.p.glb) swapStaffAvatar(rs); };
loadCharacters(MODELS_URL).then((ok) => { if (ok) { if (S) preloadVisitors(S.city); for (const k in portraits) delete portraits[k]; console.info('[chars] GLB avatars ready', CHAR.errors); } });

// ---------------- style showcase (GLB modelled in Blender) ----------------
let scMixer = null;
async function loadGLB64(name) {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const b64 = (await import('./models/showcase/' + name + '.js')).default; const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Promise((res, rej) => new GLTFLoader().parse(bin.buffer, '', res, rej));
}
async function startShowcase() {
  const [room, host, pod, plantG] = await Promise.all(['nap_showcase', 'host', 'pod', 'plant'].map(loadGLB64));
  if (!S) { startNew('london'); closeModal(); }
  S.rooms.slice().forEach((r) => demolish(r.id)); closeSheet(); closeModal();
  for (const v of R.visitors.slice()) removeVisitor(v);
  for (const rs of R.staff) rs.av.visible = false; if (R.mgr) R.mgr.av.visible = false;
  setSpeed(0);
  const g0 = new THREE.Group(); g0.position.set(-7.5, 0.17, -2.6); scene.add(g0); world.showcase = g0;
  // room shell modelled in Blender; its placeholder bed / plant / character are replaced by the Meshy models
  room.scene.traverse((m) => { if (m.isMesh && /^(char|bed|plant)_/.test(m.name)) m.visible = false; });
  g0.add(room.scene);
  const place = (gl, x, z, ry) => { const o = gl.scene; o.position.set(x, 0, z); o.rotation.y = ry; g0.add(o); return o; };
  place(pod, 0.55, -0.4, 0); place(plantG, -1.2, -1.15, 0.4);
  const h = place(host, -0.45, 0.55, 0.65);
  g0.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; if (m.material && m.material.isMeshStandardMaterial) { m.material.metalness = 0; m.material.roughness = Math.max(0.7, m.material.roughness ?? 0.8); } } });
  if (host.animations.length) { scMixer = new THREE.AnimationMixer(h); scMixer.clipAction(host.animations[0]).play(); }
  $('hud').style.display = 'none'; $('labels').style.display = 'none'; hideTut();
  view.tx = -7.95; view.tz = -3.0; view.half = 2.3; view.yaw = Math.PI / 4; view.pitch = 0.6; placeCam();
  return g0;
}
if (new URLSearchParams(location.search).get('showcase')) setTimeout(() => startShowcase().catch((e) => console.warn(e)), 600);

window.__dbg = { buildShell: (c) => buildShell(c), buildAnnexLot: () => { world.shellOwn = null; buildAnnexLot(); }, get gridRid() { return gridRid; }, get gridDoors() { return gridDoors; }, get gridBlk() { return gridBlk; }, ci, crossOK, lengthenDesk, PROBLEMS, ROOMS, CITIES, unlocked, roomCost, billInfo, get GOALS() { return GOALS; }, gameOver, billWarn, openBills, cityVictory, hemi, fill, sun, startShowcase, CHAR, GFX, person, AU, openAudio, staffCover, selectVisitor, openMgr, mgrGo, startPick, endPick, openDesk, splitQueue, roomQ, capOf, get view() { return view; }, camRot, camTilt, placeCam, snapVisitor, save, load, step, closeModal, closeSheet, get S() { return S; }, R, spawnVisitor, hire, startPlace, endPlace, placeShow, get placingR() { return placingR; }, openRoomMenu, demolish, findPath, placeValid, openHire,  startNew, startQuick, offerEmergency, spawnInspector, dropLitter, setLang: (l) => { setLang(l); applyStatic(); refreshTitle(); }, pepTalk, lifeEvent, get cnt() { return S.cnt; }, isNight, renderMap, showMap, openBrief, get mapCity() { return mapCity; }, setMapCity: (c) => { mapCity = c; }, crewVisit, vandalism, showWrapped, openMarketing, openCreate, startEvent, endEvent, raiseRequest, startDecor, endDecor, decorTo: (x, z) => { placingD.x = x; placingD.z = z; decorShow(); }, openDecorMenu, startMove, endMove, moveTo: (x, z) => { moving.x = x; moving.z = z; moveShow(); }, nextSteps, openGoals, setSpeed, get MGR() { return MGR; }, renderer, scene, cam, updateLabels, updateTut, updatePep, updateHUD };
requestAnimationFrame(loop);
