import { ACTIONS, ACTION_ORDER, DOOR, HANGER, MOOD_TIERS, SAMPLE_STORY, SAMPLE_INNER } from './data.js';
import { buildStoryPrompt, buildMorePrompt, buildInnerPrompt, parseStory, parseInner, DOOR_ORDER as ORDER } from './ooc.js';

const ICONS = {
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  clock: '<path d="M5 22h14M5 2h14"/><path d="M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22"/><path d="M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>',
  sparkle: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2Z"/>',
  quote: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  unlock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  wave: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
  ear: '<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/>',
  eyeoff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  first: '<path d="M18 6v12L9 12zM6 6v12"/>',
  prev: '<path d="M15 6 9 12l6 6"/>',
  next: '<path d="m9 6 6 6-6 6"/>',
  play: '<path d="M7 5v14l12-7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  door: '<path d="M13 4h3a2 2 0 0 1 2 2v14M2 20h3M13 20h9M10 12v.01"/><path d="M13 4.56v16.16a.5.5 0 0 1-.68.46l-6.32-2.5A1.5 1.5 0 0 1 5 17.29V5.79a2 2 0 0 1 1.32-1.88l5-1.79A1 1 0 0 1 13 3.18z"/>',
};
const icon = (name) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
const paintIcons = (root = document) => root.querySelectorAll('[data-icon]').forEach((el) => (el.innerHTML = icon(el.dataset.icon)));

const FACE_COLORS = { angry: '#f4dcd7', sulky: '#f6e3d4', aside: '#f6ebcf', soft: '#e3eadc', happy: '#e3eadc', sad: '#e1ebf0' };
function face(expr) {
  const eyes = '<circle cx="17" cy="23" r="2.6" fill="#4a3832"/><circle cx="31" cy="23" r="2.6" fill="#4a3832"/>';
  const blush = '<ellipse cx="12.5" cy="30" rx="3.6" ry="2.1" fill="#d48f86" opacity=".38"/><ellipse cx="35.5" cy="30" rx="3.6" ry="2.1" fill="#d48f86" opacity=".38"/>';
  const parts = {
    angry: `${eyes}<path d="M11 15.5 20 18.5M37 15.5 28 18.5M17 34q7-6 14 0"/>`,
    sulky: `${eyes}<path d="M12 17.5h8M28 17.5h8M18.5 33q5.5-2.4 11 0"/>`,
    aside: '<circle cx="19.5" cy="23" r="2.4" fill="#4a3832"/><circle cx="33" cy="23" r="2.4" fill="#4a3832"/><path d="M20 32.5h8.5"/>',
    soft: `${eyes}${blush}<path d="M18 31q6 4.5 12 0"/>`,
    happy: `${blush}<path d="M13.5 24q3.5-4.5 7 0M27.5 24q3.5-4.5 7 0M17 30q7 8 14 0"/>`,
    sad: `${eyes}<path d="M12 18.5 20 16M36 18.5 28 16M18.5 34q5.5-3.6 11 0"/><path d="M33.5 27.5q-2.2 3.4 0 4.6 2.2-1.2 0-4.6z" fill="#a9c2cf" stroke="none"/>`,
  };
  return `<svg viewBox="0 0 48 48" fill="none" stroke="#4a3832" stroke-width="2.6" stroke-linecap="round"><circle class="face-bg" cx="24" cy="24" r="21.5" fill="${FACE_COLORS[expr]}" stroke="#4a3832" stroke-width="2.6"/>${parts[expr]}</svg>`;
}
const TIER_FACE = ['angry', 'sulky', 'aside', 'soft', 'happy'];

const HEART_OUTLINE = '<rect x="-1" y="1" width="1" height="1"/><rect x="-1" y="2" width="1" height="1"/><rect x="0" y="0" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="1" y="-1" width="1" height="1"/><rect x="1" y="4" width="1" height="1"/><rect x="2" y="-1" width="1" height="1"/><rect x="2" y="5" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="-1" width="1" height="1"/><rect x="4" y="5" width="1" height="1"/><rect x="5" y="-1" width="1" height="1"/><rect x="5" y="4" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="7" y="1" width="1" height="1"/><rect x="7" y="2" width="1" height="1"/>';
const HEART_PX = '<rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="1" y="1" width="1" height="1"/><rect x="2" y="1" width="1" height="1"/><rect x="3" y="1" width="1" height="1"/><rect x="4" y="1" width="1" height="1"/><rect x="5" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="1" y="2" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="5" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="1" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="5" y="3" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="3" y="5" width="1" height="1"/>';
const HEART = (on) => `<svg viewBox="-1 -1 9 8"><g fill="#4a3832" transform="translate(0 0)">${HEART_OUTLINE}</g><g fill="${on ? '#e8928c' : '#fffaf0'}">${HEART_PX}</g></svg>`;

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const replay = (el, cls) => { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); };
const setCls = (el, cls) => el.setAttribute('class', cls);
const svgShow = (el, on) => el.classList.toggle('is-hidden', !on);
const store = {
  get(k, d) { try { const v = localStorage.getItem('closed-door:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('closed-door:' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
const TONES = { peach: ['#fbe1cf', '#b46f45'], sky: ['#d8eaf1', '#4f8299'], sage: ['#dde9d1', '#6b8a5e'], rose: ['#f8d6d0', '#c25d55'], lav: ['#e8e0f4', '#73639a'], butter: ['#fae9bd', '#a07a22'] };
const toneStyle = (a) => { const [l, d] = TONES[ACTIONS[a]?.tone] || TONES.sage; return `--tone-l:${l};--tone-d:${d}`; };
const START_STATE = { door: 'CLOSED', hurt: 75, trust: 35 };

function moodTier({ hurt, trust }) {
  const w = trust - hurt;
  if (w < -35) return 0;
  if (w < -15) return 1;
  if (w < 0) return 2;
  if (w < 15) return 3;
  return 4;
}

const ui = { image: null, imageName: '', idx: 0, seen: 0, playing: false, speed: 1, token: 0, ooc: null, draft: null, sample: false };
let npc = null;
let story = null;
let inner = null;

/* ================= SETUP ================= */
function syncPlate() { $('miniPlate').textContent = ui.draft?.npcName || '?'; }
function syncDrop() {
  const has = Boolean(ui.image);
  $('drop').classList.toggle('filled', has);
  $('dropInner').hidden = has;
  $('dropSecret').hidden = !has;
  $('fileName').textContent = ui.imageName;
}

function setStoryStatus(res) {
  const el = $('storyStatus');
  if (!res) { el.innerHTML = ''; el.className = 'paste-status'; $('btnStart').disabled = true; return; }
  if (!res.ok) {
    el.className = 'paste-status bad';
    el.innerHTML = `<b>답을 읽지 못했어요</b>${res.errors.map((e) => `<span>${fmt(e)}</span>`).join('')}`;
    $('btnStart').disabled = true;
    return;
  }
  const st = res.story;
  const names = st.npcName ? `${st.npcName}${st.pcName ? ` · ${st.pcName}` : ''}` : '';
  el.className = 'paste-status good';
  el.innerHTML = `<b>${icon('check')} 답을 받았어요${names ? ` · ${esc(names)}` : ''}</b><span>어떻게 될지는 문 앞에서 확인해요.</span>${res.warnings.length ? '<span class="warn">읽지 못한 줄은 건너뛰었어요.</span>' : ''}`;
  $('btnStart').disabled = false;
}
const fmt = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');

function readStoryPaste() {
  const raw = $('storyPaste').value;
  if (!raw.trim()) { ui.draft = null; setStoryStatus(null); return; }
  const res = parseStory(raw);
  ui.draft = res.ok ? res.story : null;
  setStoryStatus(res);
  syncPlate();
}

function buildSetup() {
  syncPlate();
  $('storyCopy').addEventListener('click', async () => {
    const prompt = buildStoryPrompt();
    const ok = await copyText(prompt);
    if (!ok) return openPrompt('사과 과정 OOC', prompt);
    $('storyCopyLabel').textContent = '복사됨';
    $('storyCopy').classList.add('done');
    toast('OOC를 복사했어요. AI 채팅에 붙여넣어 보내세요.');
  });
  $('storyView').addEventListener('click', () => openPrompt('사과 과정 OOC', buildStoryPrompt()));
  $('storyPaste').addEventListener('input', readStoryPaste);

  $('btnSample').addEventListener('click', () => {
    $('storyPaste').value = SAMPLE_STORY;
    readStoryPaste();
    ui.sample = true;
    begin(true);
  });

  const input = $('imgInput');
  const drop = $('drop');
  const setFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return toast('이미지 파일만 올릴 수 있어요.');
    if (ui.image) URL.revokeObjectURL(ui.image);
    ui.image = URL.createObjectURL(file);
    ui.imageName = file.name;
    syncDrop();
  };
  input.addEventListener('change', () => setFile(input.files[0]));
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('drag'); }));
  drop.addEventListener('drop', (e) => setFile(e.dataTransfer.files[0]));
  $('imgClear').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (ui.image) URL.revokeObjectURL(ui.image);
    ui.image = null;
    input.value = '';
    syncDrop();
  });

  $('setupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!ui.draft) return toast('AI 답을 먼저 붙여넣어 주세요.');
    ui.sample = false;
    begin(true);
  });
  $('btnResume').addEventListener('click', resumeSession);
  syncResume();
}

function begin(autoplay) {
  story = ui.draft;
  npc = { name: story.npcName || 'NPC', pcName: story.pcName || 'PC' };
  inner = null;
  ui.seen = 0;
  hide('setup');
  startSim();
  if (autoplay) setTimeout(() => play(), 500);
}

/* ================= SIMULATION ================= */
function startSim() {
  stop();
  hideOoc();
  resetDoor();
  $('npcName').textContent = npc.name;
  $('npcRel').textContent = story.incident ? story.incident : '다툰 뒤 방문을 잠갔다';
  $('npcRel').title = story.incident || '';
  $('npcInitial').textContent = npc.name.slice(0, 1);
  $('bubbleName').textContent = npc.name;
  $('nameplate').textContent = npc.name.length > 5 ? npc.name.slice(0, 5) : `${npc.name}의 방`;
  $('pcName').textContent = npc.pcName;
  $('pcInitial').textContent = npc.pcName.slice(0, 1);
  buildTrack();
  hide('resultModal');
  $('tip').innerHTML = '<b>PLAY</b> 재생을 누르면 AI가 쓴 사과 과정이 한 시도씩 펼쳐져요. ← → 로 넘겨 볼 수도 있어요.';
  jump(0);
  saveSession();
}

function resetDoor() {
  $('frame').classList.remove('revealed');
  svgShow($('roomImg'), false);
  $('roomImg').removeAttribute('href');
  svgShow($('roomPlaceholder'), false);
  setCls($('door'), 'door');
  $('spill').classList.remove('on');
  setCls($('giftOnMat'), 'gift');
}

const turnAt = (i) => (i > 0 ? story.turns[i - 1] : null);
const stateAt = (i) => turnAt(i) || START_STATE;
const total = () => story.turns.length;

function buildTrack() {
  const seen = story.turns.slice(0, ui.seen);
  $('plTrack').innerHTML = seen
    .map((t, i) => `<button type="button" class="tick ${DOOR[t.door].tone}" data-i="${i + 1}" title="T${pad(t.n)} · ${ACTIONS[t.action].label}" aria-label="T${pad(t.n)}"><i></i></button>`)
    .join('') + (ui.seen < total() ? '<span class="tick unknown" aria-hidden="true">?</span>' : '');
  $('plTotal').textContent = ui.seen < total() ? '/ ??' : `/ ${pad(total())}`;
}
function markSeen(i) {
  if (i > ui.seen) { ui.seen = i; buildTrack(); }
}

/** 상태를 i번째 시도 직후로 바로 맞춘다 (애니메이션 없음). */
function jump(i) {
  ui.idx = Math.max(0, Math.min(ui.seen, i));
  resetDoor();
  const t = turnAt(ui.idx);
  if (t) {
    setBubble(t.npc);
    setNarration(t.sound);
  } else {
    setBubble(story.start || (story.speech === 'formal' ? '...혼자 있고 싶어요.' : '...가.'));
    setNarration('쾅. 문이 닫혔다.');
  }
  renderPc(t, false);
  renderStatus(false);
  renderHistory();
  renderPlayer();
  if (t && t.door === 'OPEN' && ui.idx === total()) { revealRoom(); setDoorOpen(); }
  saveSession();
}

/** i-1 → i 로 한 시도를 연출하며 진행한다. */
async function advance(token) {
  if (ui.idx >= total()) return false;
  const i = ui.idx + 1;
  const t = turnAt(i);
  const prev = stateAt(i - 1);
  const sp = ui.speed;
  ui.idx = i;
  markSeen(i);
  renderPlayer();
  renderPc(t, true);
  animateAction(t.action);
  setBubble('', true);
  setNarration(t.action === 'wait' ? '문 앞에서 가만히 기다린다…' : '');
  await sleep((t.pc.length * 30 + 1300) / sp);
  if (token !== ui.token) return false;
  setBubble(t.npc);
  setNarration(t.sound);
  if (t.action === 'gift' && t.trust > prev.trust) setTimeout(() => $('giftOnMat').classList.add('taken'), 900 / sp);
  const a = ORDER.indexOf(prev.door);
  const b = ORDER.indexOf(t.door);
  if (b < a) replay($('door'), 'slam');
  if (t.door === 'UNLOCKED' && prev.door !== 'UNLOCKED') { $('door').classList.add('turn'); setTimeout(() => $('door').classList.remove('turn'), 650); }
  renderStatus(true);
  renderHistory();
  doorTip(prev, t);
  saveSession();
  if (t.door === 'OPEN' && i === total()) {
    await openDoor();
    return false;
  }
  await sleep((t.npc.length * 55 + (t.sound ? 900 : 300) + 1400) / sp);
  return token === ui.token;
}

async function play() {
  if (!story) return;
  if (ui.idx >= total()) jump(0);
  ui.playing = true;
  const token = ++ui.token;
  renderPlayer();
  while (ui.playing && token === ui.token) {
    const go = await advance(token);
    if (!go || ui.idx >= total()) break;
  }
  if (token === ui.token) {
    ui.playing = false;
    renderPlayer();
    if (ui.idx >= total() && turnAt(ui.idx)?.door !== 'OPEN') showStageEnd();
  }
}
function stop() {
  ui.playing = false;
  ui.token++;
  renderPlayer();
}
function step(dir) {
  stop();
  if (dir > 0 && ui.idx < total()) {
    const token = ++ui.token;
    advance(token).then(() => { if (ui.idx >= total() && turnAt(ui.idx)?.door !== 'OPEN') showStageEnd(); });
  } else if (dir < 0) jump(ui.idx - 1);
}

async function openDoor() {
  const door = $('door');
  await sleep(1000);
  revealRoom();
  door.classList.add('turn');
  await sleep(380);
  setDoorOpen();
  setNarration('문이 열렸다.');
  $('tip').innerHTML = '<b>OPEN</b> 문이 열렸어요. 속마음 OOC로 그동안의 진짜 마음을 받아 와요.';
  await sleep(1400);
  ui.playing = false;
  renderPlayer();
  if (inner) showResult();
  else beginOoc('inner');
}
function revealRoom() {
  if (ui.image) { $('roomImg').setAttribute('href', ui.image); svgShow($('roomImg'), true); }
  else svgShow($('roomPlaceholder'), true);
}
function setDoorOpen() {
  const door = $('door');
  door.classList.remove('ajar');
  door.classList.add('open');
  $('frame').classList.add('revealed');
  $('spill').classList.add('on');
  setCls($('lightGap'), 'light-gap l3');
  $('stage').dataset.tier = '4';
}

function showStageEnd() {
  const last = turnAt(total());
  $('tip').innerHTML = `<b>${DOOR[last.door].label}</b> 문이 아직 열리지 않았어요. 이어서 OOC로 다음 시도를 받아 올 수 있어요.`;
  renderPlayer();
}

/* ================= RENDER ================= */
function renderStatus(animate) {
  const s = stateAt(ui.idx);
  const d = DOOR[s.door];
  const idx = ORDER.indexOf(s.door);
  const badge = $('doorBadge');
  const changed = badge.textContent !== d.label;
  badge.textContent = d.label;
  badge.className = `badge ${d.tone}`;
  if (changed && animate) replay(badge, 'pop');
  const st = $('stepper');
  st.className = `stepper ${d.tone}`;
  [...st.children].forEach((li, i) => { li.classList.toggle('done', i <= idx); li.classList.toggle('now', i === idx); });

  const tier = moodTier(s);
  const label = MOOD_TIERS[tier];
  const mood = $('moodText');
  if (mood.textContent !== label) { mood.textContent = label; if (animate) replay(mood, 'fade'); }
  const faceEl = $('moodFace');
  if (faceEl.dataset.expr !== TIER_FACE[tier]) {
    faceEl.dataset.expr = TIER_FACE[tier];
    faceEl.innerHTML = face(TIER_FACE[tier]);
    if (animate) replay(faceEl, 'bump');
  }
  $('stage').dataset.tier = String(Math.max(tier, idx >= 2 ? 3 : 0));
  const tryEl = $('tryCount');
  tryEl.textContent = pad(ui.idx);
  if (animate) replay(tryEl, 'bump');

  $('door').classList.toggle('ajar', idx === 1 || idx === 2);
  const hanger = $('hanger');
  const text = HANGER[story.speech === 'formal' ? 'formal' : 'casual'][s.door];
  if ($('hangerText').textContent !== text && animate) replay(hanger, 'swing');
  $('hangerText').textContent = text;
  hanger.classList.toggle('is-hidden', !text);
  hanger.classList.remove('locked', 'ajar', 'unlocked', 'open');
  hanger.classList.add(d.tone);
  const light = idx >= 2 ? 3 : idx === 1 ? 2 : tier >= 2 ? 1 : 0;
  setCls($('lightGap'), `light-gap${light ? ' l' + light : ''}`);
  const filled = tier + 1;
  $('hearts').innerHTML = [0, 1, 2, 3, 4].map((i) => `<span class="${i < filled ? 'on' : ''}">${HEART(i < filled)}</span>`).join('');
}

function renderPc(t, animate) {
  $('actGrid').innerHTML = ACTION_ORDER.map((k) => `<div class="act${t && t.action === k ? ' on' : ''}" style="${toneStyle(k)}"><span class="a-ic">${icon(ACTIONS[k].icon)}</span><b>${ACTIONS[k].short}</b></div>`).join('');
  $('pcSayTag').textContent = t ? `T${pad(t.n)}` : 'T00';
  $('pcSayAction').textContent = t ? ACTIONS[t.action].label : '시작 전';
  const p = $('pcSayText');
  p.classList.toggle('acting', Boolean(t && (t.action === 'act' || t.action === 'wait' || t.action === 'gift')));
  p.textContent = t ? (t.pc || '…') : `${npc?.pcName || "PC"}은(는) 닫힌 문 앞에 섰다.`;
  if (animate) replay($('pcSay'), 'pop-in');
}

function renderHistory() {
  const list = $('historyList');
  const shown = story.turns.slice(0, ui.idx);
  if (!shown.length) { list.innerHTML = '<li class="empty">재생을 누르면 사과가 시작돼요.</li>'; return; }
  list.innerHTML = shown
    .map((t, i) => {
      const prevDoor = i ? shown[i - 1].door : 'CLOSED';
      const moved = prevDoor !== t.door;
      const back = ORDER.indexOf(t.door) < ORDER.indexOf(prevDoor);
      const sub = t.pc ? ` <em>“${esc(t.pc.slice(0, 14))}${t.pc.length > 14 ? '…' : ''}”</em>` : '';
      return `<li class="${i === shown.length - 1 ? 'cur' : ''}" data-i="${i + 1}" title="T${pad(t.n)}로 이동"><span class="h-num">${t.n}</span><span class="h-ic" style="${toneStyle(t.action)}">${icon(ACTIONS[t.action].icon)}</span><span class="h-txt">${esc(ACTIONS[t.action].short)}${sub}</span>${moved ? `<span class="h-door${back ? ' back' : ''}">${DOOR[t.door].label}</span>` : '<span></span>'}</li>`;
    })
    .join('');
  list.scrollTop = list.scrollHeight;
}

function renderPlayer() {
  if (!story) return;
  $('plNow').textContent = `T${pad(ui.idx)}`;
  $('plPlayIc').innerHTML = icon(ui.playing ? 'pause' : 'play');
  $('plPlay').setAttribute('aria-label', ui.playing ? '일시정지' : '재생');
  $('plPlay').classList.toggle('on', ui.playing);
  [...$('plTrack').children].forEach((b) => {
    const i = Number(b.dataset.i);
    b.classList.toggle('past', i <= ui.idx);
    b.classList.toggle('now', i === ui.idx);
  });
  $('plPrev').disabled = ui.idx === 0;
  $('plFirst').disabled = ui.idx === 0;
  $('plNext').disabled = ui.idx >= total();
  const end = ui.idx >= total() && !ui.playing;
  const last = turnAt(total());
  const btn = $('plStage');
  if (end && last.door === 'OPEN') {
    btn.hidden = false;
    btn.innerHTML = inner ? `${icon('heart')}결과 보기` : `${icon('copy')}속마음 OOC`;
  } else if (end) {
    btn.hidden = false;
    btn.innerHTML = `${icon('copy')}이어서 OOC`;
  } else btn.hidden = true;
}

function doorTip(prev, t) {
  const a = ORDER.indexOf(prev.door);
  const b = ORDER.indexOf(t.door);
  const tips = {
    up: ['<b>AJAR</b> 문 너머에서 기척이 가까워졌어요. 듣고 있어요.', '<b>UNLOCKED</b> 딸깍. 잠금이 풀렸어요.', '<b>OPEN</b> 문이 열려요.'],
    down: '<b>!</b> 마음이 상해서 문이 다시 멀어졌어요.',
  };
  if (b > a) $('tip').innerHTML = tips.up[b - 1];
  else if (b < a) $('tip').innerHTML = tips.down;
  else return;
  replay($('tip'), 'flash');
}

function setBubble(line, typing = false) {
  const el = $('bubbleLine');
  el.classList.remove('in', 'silent');
  if (typing) { el.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>'; return; }
  void el.offsetWidth;
  if (!line) { el.textContent = '……'; el.classList.add('silent'); }
  else el.textContent = `"${line}"`;
  el.classList.add('in');
}
function setNarration(text) {
  const el = $('narration');
  el.hidden = !text;
  el.textContent = text || '';
  replay(el, 'in');
}
function animateAction(action) {
  const door = $('door');
  const gift = $('giftOnMat');
  if (gift.classList.contains('on') && action !== 'gift') setCls(gift, 'gift');
  if (action === 'knock') { replay(door, 'knock'); replay($('knockRing'), 'go'); replay($('hanger'), 'swing'); }
  if (action === 'letter') replay($('letterFly'), 'go');
  if (action === 'gift') { setCls(gift, 'gift'); void gift.getBoundingClientRect(); gift.classList.add('on'); }
}

/* ================= OOC BAR (속마음 / 이어서) ================= */
function beginOoc(kind) {
  stop();
  const prompt = kind === 'inner' ? buildInnerPrompt(story) : buildMorePrompt(story);
  ui.ooc = { kind, prompt, title: kind === 'inner' ? '속마음 OOC' : '이어서 OOC', sub: kind === 'inner' ? `문이 열렸어요 · 총 ${total()}번의 시도` : `T${pad(total() + 1)}부터 이어서 받아요` };
  $('oocTitle').textContent = ui.ooc.title;
  $('oocSub').textContent = `${ui.ooc.sub} · ${prompt.length.toLocaleString()}자`;
  $('oocCopyLabel').textContent = 'OOC 복사';
  $('oocCopy').classList.remove('done');
  $('oocPaste').value = '';
  $('oocErr').hidden = true;
  $('oocSample').hidden = !(ui.sample && kind === 'inner');
  $('oocBar').hidden = false;
  $('player').hidden = true;
  if (matchMedia('(max-width: 1000px)').matches) $('oocBar').scrollIntoView({ block: 'end', behavior: 'smooth' });
}
function hideOoc() {
  ui.ooc = null;
  $('oocBar').hidden = true;
  $('player').hidden = false;
}

function showOocError(errors) {
  const el = $('oocErr');
  el.innerHTML = `<b>답을 읽지 못했어요</b>${errors.map((e) => `<span>${fmt(e)}</span>`).join('')}<span>OOC를 다시 보내거나, 형식 줄만 남겨 붙여넣어 보세요.</span>`;
  el.hidden = false;
  replay(el, 'shake');
}

function applyOoc() {
  const o = ui.ooc;
  const raw = $('oocPaste').value;
  if (!o || !raw.trim()) return;
  if (o.kind === 'inner') {
    const res = parseInner(raw, story);
    if (!res.ok) return showOocError(res.errors);
    inner = res.result;
    hideOoc();
    saveSession();
    renderPlayer();
    showResult();
  } else {
    const before = total();
    const res = parseStory(raw, story);
    if (!res.ok) return showOocError(res.errors);
    story = res.story;
    hideOoc();
    buildTrack();
    renderPlayer();
    saveSession();
    toast(`${total() - before}번의 시도를 이어 붙였어요.`);
    play();
  }
}

/* ================= RESULT ================= */
function showResult() {
  const r = inner;
  $('resultImg').style.backgroundImage = ui.image ? `url("${ui.image}")` : '';
  $('resultImg').innerHTML = ui.image ? '' : icon('user');
  $('resultName').textContent = npc.name;
  $('resTries').textContent = `${total()}회`;
  $('resEmotion').textContent = r.final_emotion || '-';
  $('resType').textContent = r.reconciliation_type;
  $('resSeal').className = `seal ${{ '완전한 화해': 'full', '조건부 화해': 'conditional', '어색한 화해': 'awkward' }[r.reconciliation_type] || 'full'}`;
  $('resNote').textContent = r.reconciliation_note;
  $('resDecisive').textContent = r.decisive_moment || '-';
  $('resJourney').innerHTML = (r.inner_journey || []).map((j) => `<li><span class="j-tag" style="${toneStyle(j.action)}">T${pad(j.n)} ${ACTIONS[j.action].short}</span>${esc(j.text)}</li>`).join('');
  $('resLast').textContent = `“${r.last_thought || '…'}”`;
  $('resMsg').textContent = `“${r.message_to_pc || '…'}”`;
  show('resultModal');
}

/* ================= COMMON ================= */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}
function openPrompt(title, prompt) {
  $('promptTitle').textContent = title;
  $('promptText').value = prompt;
  $('promptCount').textContent = `${prompt.length.toLocaleString()}자`;
  show('promptModal');
  $('promptText').focus();
  $('promptText').select();
}
function show(id) { $(id).hidden = false; }
function hide(id) { $(id).hidden = true; }
let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 3200);
}

function openLog() {
  const list = $('logList');
  if (!story || !story.turns.length) { list.innerHTML = '<p class="log-empty">아직 기록이 없어요.</p>'; show('logModal'); return; }
  const shown = story.turns.slice(0, Math.max(ui.seen, 0));
  list.innerHTML = shown.length
    ? shown.map((t) => `<div class="log-turn"><span class="h-ic" style="${toneStyle(t.action)}">${icon(ACTIONS[t.action].icon)}</span><div>
        <div class="t"><span>T${pad(t.n)} · ${ACTIONS[t.action].label}</span><span>${DOOR[t.door].label}</span></div>
        <p class="pc">${esc(npc.pcName)} · ${t.pc ? esc(t.pc) : '…'}</p>
        <p class="npc">${t.npc ? esc(t.npc) : '……'}</p>
        ${t.sound ? `<p class="nar">${esc(t.sound)}</p>` : ''}
        ${inner?.thoughts?.[t.n] ? `<p class="think">속마음 · ${esc(inner.thoughts[t.n])}</p>` : ''}</div></div>`).join('')
    : '<p class="log-empty">아직 재생된 시도가 없어요.</p>';
  show('logModal');
  list.scrollTop = list.scrollHeight;
}

/* ---------- session ---------- */
function saveSession() {
  if (!story || !npc) return;
  store.set('session', { v: 3, npc, story, inner, idx: ui.idx, seen: ui.seen, sample: ui.sample });
  syncResume();
}
function clearSession() { store.set('session', null); syncResume(); }
function syncResume() {
  const s = store.get('session', null);
  const ok = s && s.v === 3 && s.story && s.story.turns?.length;
  $('resumeBox').hidden = !ok;
  if (ok) $('resumeText').textContent = `${s.npc.name}의 문 앞 · T${pad(s.seen || 0)}까지 봤어요${s.inner ? ' · 결과까지' : ''}`;
}
function resumeSession() {
  const s = store.get('session', null);
  if (!s || !s.story) return;
  npc = s.npc;
  story = s.story;
  inner = s.inner;
  ui.sample = Boolean(s.sample);
  ui.seen = s.seen || 0;
  hide('setup');
  startSim();
  jump(s.idx || 0);
  renderPlayer();
}

function bind() {
  $('plPlay').addEventListener('click', () => (ui.playing ? stop() : play()));
  $('plPrev').addEventListener('click', () => step(-1));
  $('plNext').addEventListener('click', () => step(1));
  $('plFirst').addEventListener('click', () => { stop(); jump(0); });
  $('plTrack').addEventListener('click', (e) => { const b = e.target.closest('.tick'); if (b) { stop(); jump(Number(b.dataset.i)); } });
  $('historyList').addEventListener('click', (e) => { const li = e.target.closest('li[data-i]'); if (li) { stop(); jump(Number(li.dataset.i)); } });
  $('plSpeed').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    ui.speed = Number(b.dataset.speed);
    [...$('plSpeed').children].forEach((x) => x.classList.toggle('on', x === b));
  });
  $('plStage').addEventListener('click', () => {
    const last = turnAt(total());
    if (last.door === 'OPEN') { if (inner) showResult(); else beginOoc('inner'); }
    else beginOoc('more');
  });

  $('oocCopy').addEventListener('click', async () => {
    if (!ui.ooc) return;
    const ok = await copyText(ui.ooc.prompt);
    if (!ok) return openPrompt(ui.ooc.title, ui.ooc.prompt);
    $('oocCopyLabel').textContent = '복사됨';
    $('oocCopy').classList.add('done');
    toast('OOC를 복사했어요. AI 채팅에 붙여넣어 보내세요.');
    $('oocPaste').focus();
  });
  $('oocView').addEventListener('click', () => ui.ooc && openPrompt(ui.ooc.title, ui.ooc.prompt));
  $('oocApply').addEventListener('click', applyOoc);
  $('oocPaste').addEventListener('paste', () => setTimeout(applyOoc, 30));
  $('oocPaste').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); applyOoc(); } });
  $('oocSample').addEventListener('click', () => { $('oocPaste').value = SAMPLE_INNER; applyOoc(); });
  $('oocClose').addEventListener('click', () => { hideOoc(); renderPlayer(); });
  $('promptCopy').addEventListener('click', async () => {
    const ok = await copyText($('promptText').value);
    toast(ok ? 'OOC를 복사했어요. AI 채팅에 붙여넣어 보내세요.' : '복사가 막혀 있어요. 글을 전체 선택해 복사해 주세요.');
    if (ok) hide('promptModal');
  });

  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => (b.closest('.overlay').hidden = true)));
  document.querySelectorAll('.overlay:not(#setup)').forEach((o) => o.addEventListener('click', (e) => { if (e.target === o) o.hidden = true; }));

  $('btnLog').addEventListener('click', openLog);
  $('btnLog2').addEventListener('click', openLog);
  $('resLog').addEventListener('click', () => { hide('resultModal'); openLog(); });
  $('btnSettings').addEventListener('click', () => show('settingsModal'));
  const rm = $('reduceMotion');
  rm.checked = store.get('reduceMotion', false);
  document.body.classList.toggle('reduce-motion', rm.checked);
  rm.addEventListener('change', () => { document.body.classList.toggle('reduce-motion', rm.checked); store.set('reduceMotion', rm.checked); });
  const closeAll = () => ['settingsModal', 'resultModal', 'logModal', 'promptModal'].forEach(hide);
  const replayAll = () => { if (!story) return; closeAll(); hideOoc(); jump(0); play(); };
  const edit = () => { closeAll(); stop(); show('setup'); };
  const reset = () => {
    closeAll(); stop(); hideOoc(); clearSession();
    story = null; inner = null; ui.draft = null; ui.sample = false; ui.seen = 0; syncPlate();
    $('storyPaste').value = ''; setStoryStatus(null);
    show('setup');
  };
  $('btnRestart').addEventListener('click', replayAll);
  $('btnRestartTop').addEventListener('click', replayAll);
  $('btnEdit').addEventListener('click', edit);
  $('btnReset').addEventListener('click', reset);
  $('resAgain').addEventListener('click', replayAll);
  $('resNew').addEventListener('click', reset);

  document.addEventListener('keydown', (e) => {
    const open = [...document.querySelectorAll('.overlay')].find((o) => !o.hidden);
    if (e.key === 'Escape' && open && open.id !== 'setup') { open.hidden = true; return; }
    if (open || !story || e.target.closest('input, textarea, button') && e.key === ' ' || e.target.closest('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === ' ') { e.preventDefault(); ui.playing ? stop() : play(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'Home') { e.preventDefault(); stop(); jump(0); }
    if (e.key === 'End') { e.preventDefault(); stop(); jump(ui.seen); }
  });
}

paintIcons();
buildSetup();
bind();
renderPc(null, false);
