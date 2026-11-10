import { ACTIONS, DOOR, RELATIONS, PERSONALITIES, HANGER } from './data.js';
import { createGame, localTurn, commitTurn, localResult, moodTier } from './engine.js';
import { buildTurnPrompt, buildResultPrompt, parseTurn, parseResult, INPUT_LIMIT } from './ooc.js';

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
const PERS_FACE = { tsun: 'sulky', quiet: 'aside', fiery: 'angry', gentle: 'sad' };

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const replay = (el, cls) => { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); };
const setCls = (el, cls) => el.setAttribute('class', cls);
const svgShow = (el, on) => el.classList.toggle('is-hidden', !on);
const HEART_OUTLINE = '<rect x="-1" y="1" width="1" height="1"/><rect x="-1" y="2" width="1" height="1"/><rect x="0" y="0" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="1" y="-1" width="1" height="1"/><rect x="1" y="4" width="1" height="1"/><rect x="2" y="-1" width="1" height="1"/><rect x="2" y="5" width="1" height="1"/><rect x="3" y="0" width="1" height="1"/><rect x="3" y="6" width="1" height="1"/><rect x="4" y="-1" width="1" height="1"/><rect x="4" y="5" width="1" height="1"/><rect x="5" y="-1" width="1" height="1"/><rect x="5" y="4" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="6" y="3" width="1" height="1"/><rect x="7" y="1" width="1" height="1"/><rect x="7" y="2" width="1" height="1"/>';
const HEART_PX = '<rect x="1" y="0" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="4" y="0" width="1" height="1"/><rect x="5" y="0" width="1" height="1"/><rect x="0" y="1" width="1" height="1"/><rect x="1" y="1" width="1" height="1"/><rect x="2" y="1" width="1" height="1"/><rect x="3" y="1" width="1" height="1"/><rect x="4" y="1" width="1" height="1"/><rect x="5" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="1" y="2" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="5" y="2" width="1" height="1"/><rect x="6" y="2" width="1" height="1"/><rect x="1" y="3" width="1" height="1"/><rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="5" y="3" width="1" height="1"/><rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="3" y="5" width="1" height="1"/>';
const HEART = (on) => `<svg viewBox="-1 -1 9 8"><g fill="#4a3832" transform="translate(0 0)">${HEART_OUTLINE}</g><g fill="${on ? '#e8928c' : '#fffaf0'}">${HEART_PX}</g></svg>`;
const store = {
  get(k, d) { try { const v = localStorage.getItem('closed-door:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('closed-door:' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

const ORDER = ['CLOSED', 'AJAR', 'UNLOCKED', 'OPEN'];
const TONES = { peach: ['#f6e3d4', '#b8754a'], sky: ['#e1ebf0', '#5f8699'], sage: ['#e3eadc', '#6c8562'], rose: ['#f4dcd7', '#b4574c'], lav: ['#e9e4f1', '#7a6c98'] };
const toneStyle = (a) => { const [l, d] = TONES[ACTIONS[a].tone] || TONES.sage; return `--tone-l:${l};--tone-d:${d}`; };
const TALK_PRESETS = ['미안해. 내가 잘못했어.', '나 아직 여기 있어.', '얼굴 보고 얘기하고 싶어.', '네 얘기 듣고 싶어.'];
const GIFT_PRESETS = ['꽃 한 송이', '따뜻한 음료', '달달한 디저트', '작은 인형'];
const SEV_LABELS = ['', '사소함', '서운함', '보통', '깊음', '아주 깊음'];
const TIPS = {
  start: '<b>TIP</b> 무엇을 잘못했는지 구체적으로, 상대의 마음을 헤아리며 말할수록 문이 가까워져요.',
  '연속 노크': '<b>TIP</b> 같은 행동을 계속하면 재촉처럼 느껴질 수 있어요.',
  '너무 긴 침묵': '<b>TIP</b> 너무 오래 조용하면 떠난 줄 알지도 몰라요.',
  '변명 섞임': '<b>TIP</b> "근데", "하지만"이 붙으면 사과가 변명처럼 들려요.',
  '상대 탓': '<b>TIP</b> 탓하는 말은 문을 더 단단히 잠가요.',
  '같은 말 반복': '<b>TIP</b> 같은 말을 반복하기보다 새로운 진심을 건네 보세요.',
  '선물 공세': '<b>TIP</b> 물건만으로는 마음이 풀리지 않아요.',
  '이른 선물': '<b>TIP</b> 아직 화가 많이 났을 때의 선물은 때우려는 것처럼 보여요.',
  '생각할 시간': '<b>TIP</b> 진심을 전한 뒤의 기다림은 생각할 시간을 줘요.',
};
const SAMPLE = {
  name: '하윤', pcName: '도윤', callName: '너', relation: '연인', personality: 'tsun', severity: 3,
  incident: '기념일 저녁 약속을 잊고 친구들과 늦게까지 놀다가 연락도 안 했다',
  likes: '딸기 케이크, 고양이',
  personalityNote: '자존심이 세서 먼저 풀리는 척은 절대 안 한다',
};

const ui = { engine: ({ auto: 'ooc' }[store.get('engine', 'ooc')] || store.get('engine', 'ooc')), pending: null, aiAvailable: false, busy: false, sub: null, image: null, imageName: '', mode: 'say' };
let npc = null;
let game = null;

/* ---------- engine ---------- */
async function checkHealth() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch('api/health', { signal: ctrl.signal });
    clearTimeout(t);
    ui.aiAvailable = res.ok && (await res.json()).ai === true;
  } catch {
    ui.aiAvailable = false;
  }
  renderEngine();
}
const usingAI = () => ui.aiAvailable && ui.engine === 'ai';
const usingOOC = () => ui.engine === 'ooc' || (ui.engine === 'ai' && !ui.aiAvailable);

function renderEngine() {
  const note = $('engineNote');
  note.classList.toggle('ai', usingOOC() || usingAI());
  note.innerHTML = usingOOC()
    ? '<span><b>OOC 모드</b> · 행동마다 OOC를 복사해 AI 채팅에 보내요.</span>'
    : usingAI()
      ? '<span><b>AI 서버 모드</b> · 서버의 AI가 바로 반응해요.</span>'
      : '<span><b>바로 플레이</b> · 내장 NPC가 반응해요.</span>';
  $('engineStatus').textContent = usingOOC()
    ? '행동을 고르면 OOC 복사 → AI 답변 붙여넣기 순서로 턴이 진행돼요.'
    : ui.aiAvailable ? 'AI 서버에 연결되어 있어요.' : '내장 NPC가 설정한 성격대로 반응해요.';
  document.querySelectorAll('#engineSeg button, #playMode .pm').forEach((b) => {
    const on = b.dataset.engine === ui.engine;
    b.classList.toggle('on', on);
    if (b.classList.contains('pm')) b.setAttribute('aria-checked', String(on));
    if (b.dataset.engine === 'ai') { b.disabled = !ui.aiAvailable; b.hidden = !ui.aiAvailable; }
  });
  $('setupForm').classList.toggle('mode-ooc', usingOOC());
}

function setEngine(engine) {
  if (ui.pending) return toast('진행 중인 OOC를 마치거나 취소한 뒤 바꿀 수 있어요.');
  ui.engine = engine;
  store.set('engine', engine);
  renderEngine();
}

async function api(path, body) {
  const res = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
const npcPayload = () => ({ ...npc, personalityLabel: PERSONALITIES[npc.personality].label, speech: PERSONALITIES[npc.personality].speech });
const historyPayload = () =>
  game.history.map(({ turn, actionLabel, text, npcLine, narration, thought, door, hurt, trust }) => ({ turn, actionLabel, text, npcLine, narration, thought, door, hurt, trust }));

/* ---------- setup ---------- */
function setChoice(root, attr, value) {
  root.querySelectorAll(`[data-${attr}]`).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset[attr] === value)));
}
function setSeverity(v) {
  $('setupForm').elements.severity.value = v;
  $('sevOut').textContent = SEV_LABELS[v];
  [...$('sevPick').children].forEach((b, i) => b.classList.toggle('on', i < v));
}
function syncDrop() {
  const has = Boolean(ui.image);
  $('drop').classList.toggle('filled', has);
  $('dropInner').hidden = has;
  $('dropSecret').hidden = !has;
  $('fileName').textContent = ui.imageName;
}

function buildSetup() {
  const form = $('setupForm');
  const rel = $('relChips');
  const pers = $('persGrid');
  rel.innerHTML = RELATIONS.map((r) => `<button type="button" class="chip" data-rel="${r}" aria-pressed="false">${r}</button>`).join('');
  pers.innerHTML = Object.entries(PERSONALITIES)
    .map(([k, p]) => `<button type="button" class="pers" data-pers="${k}" aria-pressed="false">${face(PERS_FACE[k])}<span><strong>${p.label}<i>${p.speech === 'formal' ? '존댓말' : '반말'}</i></strong><span>${p.desc}</span></span></button>`)
    .join('');
  $('sevPick').innerHTML = [1, 2, 3, 4, 5].map((n) => `<button type="button" style="--h:${4 + n * 4}px" aria-label="${SEV_LABELS[n]}" data-sev="${n}"></button>`).join('');
  rel.addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) setChoice(rel, 'rel', b.dataset.rel); });
  pers.addEventListener('click', (e) => { const b = e.target.closest('.pers'); if (b) setChoice(pers, 'pers', b.dataset.pers); });
  $('sevPick').addEventListener('click', (e) => { const b = e.target.closest('[data-sev]'); if (b) setSeverity(Number(b.dataset.sev)); });
  const syncPlate = () => ($('miniPlate').textContent = form.elements.name.value.trim() || '이름');
  form.elements.name.addEventListener('input', syncPlate);

  const fill = (d) => {
    for (const k of ['name', 'pcName', 'incident', 'likes', 'personalityNote']) if (d[k] != null) form.elements[k].value = d[k];
    setChoice(rel, 'rel', d.relation || '연인');
    setChoice(pers, 'pers', d.personality || 'tsun');
    setSeverity(Number(d.severity) || 3);
    syncPlate();
  };
  fill(store.get('npc', null) || { relation: '연인', personality: 'tsun', severity: 3 });
  $('btnSample').addEventListener('click', () => fill(SAMPLE));

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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements;
    npc = {
      name: f.name.value.trim() || '그 사람',
      pcName: f.pcName.value.trim(),
      relation: rel.querySelector('[aria-pressed="true"]')?.dataset.rel || '친구',
      personality: pers.querySelector('[aria-pressed="true"]')?.dataset.pers || 'tsun',
      severity: Number(f.severity.value) || 3,
      incident: f.incident.value.trim(),
      likes: f.likes.value.trim(),
      personalityNote: f.personalityNote.value.trim(),
    };
    store.set('npc', npc);
    hide('setup');
    startGame();
  });
  $('playMode').addEventListener('click', (e) => { const b = e.target.closest('.pm'); if (b) setEngine(b.dataset.engine); });
  $('btnResume').addEventListener('click', resumeSession);
  syncResume();
}

/* ---------- game ---------- */
function startGame() {
  game = createGame(npc);
  closeSub();
  hideOoc();
  $('frame').classList.remove('revealed');
  svgShow($('roomImg'), false);
  $('roomImg').removeAttribute('href');
  svgShow($('roomPlaceholder'), false);
  setCls($('door'), 'door');
  $('spill').classList.remove('on');
  setCls($('giftOnMat'), 'gift');
  $('npcName').textContent = npc.name;
  $('npcRel').textContent = `${npc.relation} · ${PERSONALITIES[npc.personality].label}`;
  $('npcInitial').textContent = npc.name.slice(0, 1);
  $('bubbleName').textContent = npc.name;
  $('nameplate').textContent = npc.name.length > 5 ? npc.name.slice(0, 5) : `${npc.name}의 방`;
  $('letterTo').textContent = `To. ${npc.name}`;
  setBubble(npc.personality === 'gentle' ? '...혼자 있고 싶어요.' : '...가.');
  setNarration('쾅. 문이 닫혔다.');
  $('tip').innerHTML = TIPS.start;
  renderStatus(false);
  renderHistory();
  hide('resultModal');
  saveSession();
}

function renderStatus(animate = true) {
  const d = DOOR[game.door];
  const idx = ORDER.indexOf(game.door);
  const badge = $('doorBadge');
  const changed = badge.textContent !== d.label;
  badge.textContent = d.label;
  badge.className = `badge ${d.tone}`;
  badge.title = d.ko;
  if (changed && animate) replay(badge, 'pop');

  const step = $('stepper');
  step.className = `stepper ${d.tone}`;
  [...step.children].forEach((li, i) => { li.classList.toggle('done', i <= idx); li.classList.toggle('now', i === idx); });

  const tier = game.history.length ? moodTier(game) : 0;
  const label = game.history.length ? game.history[game.history.length - 1].mood : '단단히 화남';
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
  tryEl.textContent = pad(game.history.length);
  if (animate) replay(tryEl, 'bump');

  const door = $('door');
  door.classList.toggle('ajar', idx === 1 || idx === 2);
  const hanger = $('hanger');
  const text = HANGER[PERSONALITIES[npc.personality].speech][game.door];
  if ($('hangerText').textContent !== text && animate) replay(hanger, 'swing');
  $('hangerText').textContent = text;
  hanger.classList.toggle('is-hidden', !text);
  hanger.classList.remove('locked', 'ajar', 'unlocked', 'open');
  hanger.classList.add(d.tone);
  const light = idx >= 2 ? 3 : idx === 1 ? 2 : tier >= 2 ? 1 : 0;
  setCls($('lightGap'), `light-gap${light ? ' l' + light : ''}`);
  const hearts = $('hearts');
  const filled = game.history.length ? tier + 1 : 1;
  const prevFilled = Number(hearts.dataset.n || 0);
  hearts.innerHTML = [0, 1, 2, 3, 4].map((i) => `<span class="${i < filled ? 'on' : ''}${animate && i === filled - 1 && filled > prevFilled ? ' on' : ''}">${HEART(i < filled)}</span>`).join('');
  hearts.dataset.n = filled;
}

function renderHistory() {
  const list = $('historyList');
  if (!game.history.length) { list.innerHTML = '<li class="empty">아직 아무것도 하지 않았다.</li>'; return; }
  list.innerHTML = game.history
    .map((h, i) => {
      const prev = i ? game.history[i - 1].door : 'CLOSED';
      const moved = prev !== h.door;
      const back = ORDER.indexOf(h.door) < ORDER.indexOf(prev);
      const sub = h.text ? ` <em>“${esc(h.text.slice(0, 14))}${h.text.length > 14 ? '…' : ''}”</em>` : h.actionLabel.includes('(') ? ` <em>${esc(h.actionLabel.split('(')[1].replace(')', ''))}</em>` : '';
      return `<li><span class="h-num">${h.turn}</span><span class="h-ic" style="${toneStyle(h.action)}">${icon(ACTIONS[h.action].icon)}</span><span class="h-txt">${esc(ACTIONS[h.action].short)}${sub}</span>${moved ? `<span class="h-door${back ? ' back' : ''}">${DOOR[h.door].label}</span>` : '<span></span>'}</li>`;
    })
    .join('');
  list.scrollTop = list.scrollHeight;
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
  el.textContent = text;
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

function setBusy(on) {
  ui.busy = on;
  $('app').classList.toggle('busy', on);
}

async function play(action, text = '', extra = {}) {
  if (ui.busy || ui.pending || !game || game.over) return;
  closeSub();
  animateAction(action);
  setBubble('', true);
  const prevDoor = game.door;
  const local = localTurn(game, action, text, extra);

  if (usingOOC()) {
    const label = ACTIONS[action].label + (extra.gift ? ` (${extra.gift})` : '');
    const prompt = buildTurnPrompt({ npc, history: game.history, state: { door: game.door, hurt: game.hurt, trust: game.trust }, action: { type: action, label, text } });
    setNarration(action === 'wait' ? '문 앞에 가만히 앉아 기다린다… AI 채팅에서 반응을 받아 와 주세요.' : 'AI 채팅에 OOC를 보내고, 받은 답을 아래에 붙여넣어 주세요.');
    ui.pending = { kind: 'turn', action, text, extra, local, prevDoor, prompt, title: `${game.history.length + 1}턴 OOC`, sub: label };
    showOoc();
    saveSession();
    return;
  }

  setBusy(true);
  setNarration(action === 'wait' ? '문 앞에 가만히 앉아 기다린다…' : '문 너머의 반응을 기다린다…');
  let out = local;
  const started = Date.now();
  if (usingAI()) {
    try {
      const label = ACTIONS[action].label + (extra.gift ? ` (${extra.gift})` : '');
      const ai = await api('api/turn', { npc: npcPayload(), history: historyPayload(), action: { type: action, label, text }, state: { door: game.door, hurt: game.hurt, trust: game.trust } });
      out = { ...ai, tag: local.tag, cat: local.cat, sincere: local.sincere };
    } catch (err) {
      toast(`AI 응답 실패: ${err.message} · 내장 반응으로 대체했어요.`);
    }
  }
  const minWait = action === 'wait' ? 1700 : action === 'letter' ? 1500 : 950;
  await sleep(Math.max(0, minWait - (Date.now() - started)));
  await applyTurn(action, text, extra, out, prevDoor);
  setBusy(false);
  if (!game.over && (action === 'free' || action === 'act')) $('directInput').focus();
}

async function applyTurn(action, text, extra, out, prevDoor) {
  const entry = commitTurn(game, action, text, extra, out);
  setBubble(entry.npcLine);
  setNarration(entry.narration || '');
  if (action === 'gift' && ((out.cat || '') === 'giftGood' || entry.dw > 2)) setTimeout(() => $('giftOnMat').classList.add('taken'), 900);
  if (ORDER.indexOf(entry.door) < ORDER.indexOf(prevDoor)) replay($('door'), 'slam');
  if (entry.door === 'UNLOCKED' && prevDoor !== 'UNLOCKED') { $('door').classList.add('turn'); setTimeout(() => $('door').classList.remove('turn'), 650); }
  if (TIPS[entry.tag] && $('tip').innerHTML !== TIPS[entry.tag]) { $('tip').innerHTML = TIPS[entry.tag]; replay($('tip'), 'flash'); }
  renderStatus();
  renderHistory();
  saveSession();
  if (game.over) await openDoor();
}

/* ---------- OOC bar ---------- */
function showOoc() {
  const p = ui.pending;
  $('oocTitle').textContent = p.title;
  $('oocSub').textContent = `${p.sub} · ${p.prompt.length.toLocaleString()}자${p.prompt.length > INPUT_LIMIT ? ' (길어요)' : ''}`;
  $('oocCopyLabel').textContent = 'OOC 복사';
  $('oocCopy').classList.remove('done');
  $('oocPaste').value = '';
  $('oocErr').hidden = true;
  $('oocSkip').hidden = p.kind !== 'result';
  $('oocCancel').hidden = p.kind === 'result';
  $('oocBar').hidden = false;
  $('directForm').hidden = true;
  $('app').classList.add('waiting');
}
function hideOoc() {
  ui.pending = null;
  $('oocBar').hidden = true;
  $('directForm').hidden = false;
  $('app').classList.remove('waiting');
}

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

async function copyOoc() {
  if (!ui.pending) return;
  const ok = await copyText(ui.pending.prompt);
  if (!ok) return openPrompt();
  $('oocCopyLabel').textContent = '복사됨';
  $('oocCopy').classList.add('done');
  toast('OOC를 복사했어요. AI 채팅에 붙여넣어 보내세요.');
  $('oocPaste').focus();
}
function openPrompt() {
  if (!ui.pending) return;
  $('promptTitle').textContent = ui.pending.title;
  $('promptText').value = ui.pending.prompt;
  $('promptCount').textContent = `${ui.pending.prompt.length.toLocaleString()}자`;
  show('promptModal');
  $('promptText').select();
}

function showOocError(errors) {
  const el = $('oocErr');
  el.innerHTML = `<b>답을 읽지 못했어요</b>${errors.map((e) => `<span>${esc(e).replace(/`([^`]+)`/g, '<code>$1</code>')}</span>`).join('')}<span>OOC를 다시 보내거나, 답의 형식 줄만 남겨 붙여넣어 보세요.</span>`;
  el.hidden = false;
  replay(el, 'shake');
}

async function applyOoc() {
  const p = ui.pending;
  const raw = $('oocPaste').value;
  if (!p || !raw.trim()) return;
  if (p.kind === 'turn') {
    const res = parseTurn(raw, { door: game.door, hurt: game.hurt, trust: game.trust });
    if (!res.ok) return showOocError(res.errors);
    if (res.out.incident && !npc.incident) {
      npc.incident = res.out.incident;
      store.set('npc', npc);
      toast(`다툰 이유 · ${res.out.incident}`);
    }
    hideOoc();
    setBusy(true);
    await applyTurn(p.action, p.text, p.extra, { ...res.out, tag: p.local.tag, cat: p.local.cat, sincere: p.local.sincere }, p.prevDoor);
    setBusy(false);
  } else {
    const res = parseResult(raw);
    if (!res.ok) return showOocError(res.errors);
    hideOoc();
    clearSession();
    showResult(res.result);
  }
}

function cancelOoc() {
  const p = ui.pending;
  if (!p || p.kind !== 'turn') return;
  hideOoc();
  const last = game.history[game.history.length - 1];
  setBubble(last ? last.npcLine : (npc.personality === 'gentle' ? '...혼자 있고 싶어요.' : '...가.'));
  setNarration(last ? last.narration : '쾅. 문이 닫혔다.');
  if (p.action === 'gift') setCls($('giftOnMat'), 'gift');
  saveSession();
}

/* ---------- session (survives switching to the chat tab) ---------- */
function saveSession() {
  if (!game) return;
  const g = game;
  store.set('session', {
    v: 1, engine: ui.engine, npc,
    game: { hurt: g.hurt, trust: g.trust, door: g.door, history: g.history, streak: g.streak, counts: g.counts, lastText: g.lastText, sincere: g.sincere, over: g.over },
    pending: ui.pending ? { ...ui.pending, local: { tag: ui.pending.local?.tag, cat: ui.pending.local?.cat, sincere: ui.pending.local?.sincere } } : null,
  });
  syncResume();
}
function clearSession() { store.set('session', null); syncResume(); }
function syncResume() {
  const sess = store.get('session', null);
  const box = $('resumeBox');
  if (!box) return;
  const ok = sess && sess.npc && sess.game && (sess.game.history.length || sess.pending);
  box.hidden = !ok;
  if (ok) $('resumeText').textContent = `${sess.npc.name}에게 하던 사과가 남아 있어요 · ${sess.game.history.length}턴${sess.pending ? ' · 답변 대기 중' : ''}`;
}
function resumeSession() {
  const sess = store.get('session', null);
  if (!sess) return;
  npc = sess.npc;
  ui.engine = sess.engine || ui.engine;
  renderEngine();
  hide('setup');
  startGame();
  Object.assign(game, sess.game, { used: new Set() });
  renderStatus(false);
  renderHistory();
  const last = game.history[game.history.length - 1];
  if (last) { setBubble(last.npcLine); setNarration(last.narration); }
  if (game.over) { revealRoom(); setDoorOpen(); }
  if (sess.pending) {
    ui.pending = sess.pending;
    if (ui.pending.kind === 'turn') { setBubble('', true); setNarration('AI 채팅에서 받은 답을 아래에 붙여넣어 주세요.'); }
    showOoc();
  } else if (game.over) {
    beginResult();
  }
  saveSession();
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

async function openDoor() {
  const door = $('door');
  await sleep(1100);
  revealRoom();
  door.classList.add('turn');
  await sleep(380);
  setDoorOpen();

  if (usingOOC()) {
    await sleep(1600);
    beginResult();
    return;
  }

  let result = null;
  const started = Date.now();
  if (usingAI()) {
    try { result = await api('api/result', { npc: npcPayload(), history: historyPayload() }); }
    catch (err) { toast(`결과 생성 실패: ${err.message} · 로컬 결과를 보여 줄게요.`); }
  }
  if (!result) result = localResult(game);
  await sleep(Math.max(0, 2800 - (Date.now() - started)));
  showResult(result);
}

function beginResult() {
  ui.pending = { kind: 'result', prompt: buildResultPrompt({ npc, history: game.history }), title: '결과 OOC', sub: `문이 열렸어요 · 총 ${game.history.length}회` };
  setNarration('문이 열렸다. 결과 OOC로 그동안의 속마음을 받아 오세요.');
  showOoc();
  saveSession();
}

function showResult(r) {
  $('resultImg').style.backgroundImage = ui.image ? `url("${ui.image}")` : '';
  $('resultImg').innerHTML = ui.image ? '' : icon('user');
  $('resultName').textContent = npc.name;
  $('resTries').textContent = `${game.history.length}회`;
  $('resEmotion').textContent = r.final_emotion;
  $('resType').textContent = r.reconciliation_type;
  $('resSeal').className = `seal ${{ '완전한 화해': 'full', '조건부 화해': 'conditional', '어색한 화해': 'awkward' }[r.reconciliation_type] || 'full'}`;
  $('resNote').textContent = r.reconciliation_note;
  $('resDecisive').textContent = r.decisive_moment;
  $('resJourney').innerHTML = (r.inner_journey || []).map((s) => `<li>${esc(s)}</li>`).join('');
  $('resLast').textContent = `“${r.last_thought}”`;
  $('resMsg').textContent = `“${r.message_to_pc}”`;
  show('resultModal');
  clearSession();
}

/* ---------- actions panel ---------- */
function buildActions() {
  const list = $('actionList');
  list.innerHTML = ['knock', 'letter', 'talk', 'gift', 'wait']
    .map((k) => {
      const a = ACTIONS[k];
      return `<button type="button" class="action" data-action="${k}" data-tone="${a.tone}"><span class="a-ic">${icon(a.icon)}</span><span class="a-txt"><b>${a.label}</b><em>${a.desc}</em></span><kbd>${a.key}</kbd></button>`;
    })
    .join('');
  list.addEventListener('click', (e) => { const b = e.target.closest('.action'); if (b) chooseAction(b.dataset.action); });
}

function chooseAction(a) {
  if (ui.busy || !game || game.over) return;
  if (ui.pending) return toast('먼저 지금 OOC의 답을 붙여넣거나 취소해 주세요.');
  if (a === 'knock' || a === 'wait') return play(a);
  if (a === 'letter') { closeSub(); show('letterModal'); $('letterText').focus(); return; }
  if (ui.sub === a) return closeSub();
  openSub(a);
}

function openSub(a) {
  ui.sub = a;
  const sp = $('subpanel');
  document.querySelectorAll('.action').forEach((b) => b.classList.toggle('active', b.dataset.action === a));
  if (a === 'talk') {
    sp.innerHTML = `<h4>문 너머로 건넬 말</h4><div class="opt-list">${TALK_PRESETS.map((t) => `<button type="button" class="opt" data-say="${esc(t)}">${esc(t)}</button>`).join('')}<button type="button" class="opt alt" data-custom>직접 쓰기</button></div>`;
  } else {
    const likes = (npc.likes || '').split(/[,·/]/).map((s) => s.trim()).filter(Boolean).slice(0, 2);
    const opts = [...new Set([...likes, ...GIFT_PRESETS])].slice(0, 6);
    sp.innerHTML = `<h4>문 앞에 둘 선물</h4><div class="opt-list">${opts.map((t) => `<button type="button" class="opt" data-gift="${esc(t)}">${esc(t)}</button>`).join('')}</div><form class="sub-row" data-giftform><input maxlength="20" placeholder="다른 선물 입력" /><button class="btn primary" type="submit">두기</button></form>`;
  }
  sp.hidden = false;
}
function closeSub() {
  ui.sub = null;
  $('subpanel').hidden = true;
  document.querySelectorAll('.action').forEach((b) => b.classList.remove('active'));
}

function setMode(mode) {
  ui.mode = mode;
  document.querySelectorAll('#modeSeg button').forEach((b) => { const on = b.dataset.mode === mode; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
  $('directForm').classList.toggle('act', mode === 'act');
  $('directInput').placeholder = mode === 'act' ? '문 앞에서 할 행동을 적어 보세요... (예: 문에 등을 기대고 앉는다)' : 'NPC에게 하고 싶은 말을 입력하세요...';
}

/* ---------- modals ---------- */
function show(id) { $(id).hidden = false; }
function hide(id) { $(id).hidden = true; }
let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 3400);
}

function openLog() {
  const list = $('logList');
  if (!game || !game.history.length) list.innerHTML = '<p class="log-empty">아직 기록이 없어요.</p>';
  else
    list.innerHTML = game.history
      .map((h) => `<div class="log-turn"><span class="h-ic" style="${toneStyle(h.action)}">${icon(ACTIONS[h.action].icon)}</span><div>
        <div class="t"><span>TRY ${pad(h.turn)}</span><span>${DOOR[h.door].label}</span></div>
        <p class="pc">${esc(h.actionLabel)}${h.text ? ` — ${h.action === 'act' ? `<i>${esc(h.text)}</i>` : `“${esc(h.text)}”`}` : ''}</p>
        <p class="npc">${h.npcLine ? esc(h.npcLine) : '……'}</p>
        ${h.narration ? `<p class="nar">${esc(h.narration)}</p>` : ''}
        ${game.over && h.thought ? `<p class="think">속마음 · ${esc(h.thought)}</p>` : ''}</div></div>`)
      .join('');
  show('logModal');
  list.scrollTop = list.scrollHeight;
}

function bind() {
  $('directForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('directInput').value.trim();
    if (!v) return;
    $('directInput').value = '';
    play(ui.mode === 'act' ? 'act' : 'free', v);
  });
  $('modeSeg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { setMode(b.dataset.mode); $('directInput').focus(); } });
  $('subpanel').addEventListener('click', (e) => {
    const say = e.target.closest('[data-say]');
    const gift = e.target.closest('[data-gift]');
    if (say) play('talk', say.dataset.say);
    if (gift) play('gift', '', { gift: gift.dataset.gift });
    if (e.target.closest('[data-custom]')) { closeSub(); setMode('say'); $('directInput').focus(); }
  });
  $('subpanel').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = e.target.querySelector('input').value.trim();
    if (v) play('gift', '', { gift: v });
  });
  $('letterText').addEventListener('input', (e) => ($('letterCount').textContent = `${e.target.value.length} / 400`));
  $('letterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('letterText').value.trim();
    if (!v) return;
    $('letterText').value = '';
    $('letterCount').textContent = '0 / 400';
    hide('letterModal');
    play('letter', v);
  });
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => (b.closest('.overlay').hidden = true)));
  document.querySelectorAll('.overlay:not(#setup):not(#resultModal)').forEach((o) => o.addEventListener('click', (e) => { if (e.target === o) o.hidden = true; }));

  $('oocCopy').addEventListener('click', copyOoc);
  $('oocView').addEventListener('click', openPrompt);
  $('oocApply').addEventListener('click', applyOoc);
  $('oocCancel').addEventListener('click', cancelOoc);
  $('oocSkip').addEventListener('click', () => { hideOoc(); showResult(localResult(game)); });
  $('oocPaste').addEventListener('paste', () => setTimeout(applyOoc, 30));
  $('oocPaste').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); applyOoc(); } });
  $('promptCopy').addEventListener('click', async () => {
    const ok = await copyText($('promptText').value);
    if (ok && ui.pending) { $('oocCopyLabel').textContent = '복사됨'; $('oocCopy').classList.add('done'); }
    toast(ok ? 'OOC를 복사했어요.' : '복사가 막혀 있어요. 글을 전체 선택해 복사해 주세요.');
    if (ok) hide('promptModal');
  });
  $('btnLog').addEventListener('click', openLog);
  $('btnLog2').addEventListener('click', openLog);
  $('resLog').addEventListener('click', openLog);
  $('btnSettings').addEventListener('click', () => show('settingsModal'));
  $('engineSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    setEngine(b.dataset.engine);
  });
  const rm = $('reduceMotion');
  rm.checked = store.get('reduceMotion', false);
  document.body.classList.toggle('reduce-motion', rm.checked);
  rm.addEventListener('change', () => { document.body.classList.toggle('reduce-motion', rm.checked); store.set('reduceMotion', rm.checked); });
  const closeAll = () => ['settingsModal', 'resultModal', 'logModal', 'letterModal'].forEach(hide);
  const restart = () => { if (ui.busy || !npc) return; closeAll(); hideOoc(); startGame(); };
  const reset = () => { if (ui.busy) return; closeAll(); hideOoc(); clearSession(); game = null; show('setup'); };
  $('btnRestart').addEventListener('click', restart);
  $('btnRestartTop').addEventListener('click', restart);
  $('btnReset').addEventListener('click', reset);
  $('resAgain').addEventListener('click', restart);
  $('resNew').addEventListener('click', reset);

  document.addEventListener('keydown', (e) => {
    const open = [...document.querySelectorAll('.overlay')].find((o) => !o.hidden);
    if (e.key === 'Escape' && open && open.id !== 'setup' && open.id !== 'resultModal') { open.hidden = true; return; }
    if (open || e.target.closest('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    const a = Object.entries(ACTIONS).find(([, v]) => v.key && v.key === e.key);
    if (a) { e.preventDefault(); chooseAction(a[0]); }
    else if (e.key === 'Escape') closeSub();
  });
}

paintIcons();
buildActions();
buildSetup();
bind();
renderEngine();
checkHealth();
