import { ACTIONS, DOOR, RELATIONS, PERSONALITIES } from './data.js';
import { createGame, localTurn, commitTurn, localResult, moodTier } from './engine.js';

const ICONS = {
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  clock: '<path d="M5 22h14M5 2h14"/><path d="M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22"/><path d="M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  unlock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
};
const icon = (name) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
const paintIcons = (root = document) => root.querySelectorAll('[data-icon]').forEach((el) => (el.innerHTML = icon(el.dataset.icon)));

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const store = {
  get(k, d) { try { const v = localStorage.getItem('closed-door:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('closed-door:' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

const TALK_PRESETS = ['미안해. 내가 잘못했어.', '나 아직 여기 있어.', '얼굴 보고 얘기하고 싶어.', '네 얘기 듣고 싶어.'];
const GIFT_PRESETS = ['꽃 한 송이', '따뜻한 음료', '달달한 디저트', '작은 인형'];
const SAMPLE = {
  name: '하윤', callName: '너', relation: '연인', personality: 'tsun', severity: 3,
  incident: '기념일 저녁 약속을 잊고 친구들과 늦게까지 놀다가 연락도 안 했다',
  likes: '딸기 케이크, 고양이',
  personalityNote: '자존심이 세서 먼저 풀리는 척은 절대 안 한다',
};

const ui = {
  engine: store.get('engine', 'auto'),
  aiAvailable: false,
  busy: false,
  sub: null,
  image: null,
  imageName: '',
};
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
const usingAI = () => ui.aiAvailable && ui.engine !== 'local';

function renderEngine() {
  const note = usingAI()
    ? '<b>AI 모드</b> · NPC가 설정을 바탕으로 매번 새롭게 반응합니다.'
    : ui.aiAvailable
      ? '<b>로컬 모드</b> · 설정에서 AI 모드로 바꿀 수 있습니다.'
      : '<b>로컬 모드</b> · AI 서버 없이 내장 엔진으로 반응합니다.';
  $('engineNote').innerHTML = note;
  $('engineStatus').textContent = ui.aiAvailable ? 'AI 서버에 연결되어 있습니다.' : 'AI 서버를 찾지 못했습니다. 로컬 엔진만 사용할 수 있습니다.';
  document.querySelectorAll('#engineSeg button').forEach((b) => {
    b.classList.toggle('on', b.dataset.engine === ui.engine);
    b.disabled = b.dataset.engine === 'ai' && !ui.aiAvailable;
  });
}

async function api(path, body) {
  const res = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
const npcPayload = () => ({
  ...npc,
  personalityLabel: PERSONALITIES[npc.personality].label,
  speech: PERSONALITIES[npc.personality].speech,
});
const historyPayload = () =>
  game.history.map(({ turn, actionLabel, text, npcLine, narration, thought, door, hurt, trust }) => ({ turn, actionLabel, text, npcLine, narration, thought, door, hurt, trust }));

/* ---------- setup ---------- */
function buildSetup() {
  const saved = store.get('npc', null);
  const form = $('setupForm');
  const rel = $('relChips');
  rel.innerHTML = RELATIONS.map((r) => `<button type="button" class="chip" data-rel="${r}" aria-pressed="false">${r}</button>`).join('');
  $('persGrid').innerHTML = Object.entries(PERSONALITIES)
    .map(([k, p]) => `<button type="button" class="pers" data-pers="${k}" aria-pressed="false"><em>${p.speech === 'formal' ? '존댓말' : '반말'}</em><strong>${p.label}</strong><span>${p.desc}</span></button>`)
    .join('');
  rel.addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) setChoice(rel, 'rel', b.dataset.rel); });
  $('persGrid').addEventListener('click', (e) => { const b = e.target.closest('.pers'); if (b) setChoice($('persGrid'), 'pers', b.dataset.pers); });

  const sevLabels = ['', '사소함', '서운함', '보통', '깊음', '아주 깊음'];
  const sev = form.elements.severity;
  const syncSev = () => ($('sevOut').textContent = sevLabels[sev.value]);
  sev.addEventListener('input', syncSev);

  const fill = (d) => {
    for (const k of ['name', 'callName', 'incident', 'likes', 'personalityNote', 'severity']) if (d[k] != null) form.elements[k].value = d[k];
    setChoice(rel, 'rel', d.relation || '연인');
    setChoice($('persGrid'), 'pers', d.personality || 'tsun');
    syncSev();
  };
  fill(saved || { relation: '연인', personality: 'tsun', severity: 3 });
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
      callName: f.callName.value.trim(),
      relation: rel.querySelector('[aria-pressed="true"]')?.dataset.rel || '친구',
      personality: $('persGrid').querySelector('[aria-pressed="true"]')?.dataset.pers || 'tsun',
      severity: Number(f.severity.value),
      incident: f.incident.value.trim(),
      likes: f.likes.value.trim(),
      personalityNote: f.personalityNote.value.trim(),
    };
    store.set('npc', npc);
    hide('setup');
    startGame();
  });
}
function setChoice(root, attr, value) {
  root.querySelectorAll(`[data-${attr}]`).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset[attr] === value)));
}
function syncDrop() {
  const has = Boolean(ui.image);
  $('drop').classList.toggle('filled', has);
  $('dropInner').hidden = has;
  $('dropSecret').hidden = !has;
  $('fileName').textContent = ui.imageName;
}

/* ---------- game ---------- */
function startGame() {
  game = createGame(npc);
  closeSub();
  const frame = document.querySelector('.frame');
  frame.classList.remove('revealed');
  $('roomImg').hidden = true;
  $('roomImg').removeAttribute('src');
  $('roomPlaceholder').hidden = true;
  $('door').className = 'door';
  $('giftOnMat').className = 'gift-on-mat';
  $('npcName').textContent = npc.name;
  $('npcRel').textContent = `${npc.relation} · ${PERSONALITIES[npc.personality].label}`;
  $('bubbleName').textContent = npc.name;
  document.querySelector('.npc-avatar').textContent = npc.name.slice(0, 1);
  setBubble(npc.personality === 'gentle' ? '...혼자 있고 싶어요.' : '...가.');
  setNarration('쾅. 문이 닫혔다. 문 너머는 조용하다.');
  renderStatus(false);
  renderHistory();
  hide('resultModal');
}

function renderStatus(animate = true) {
  const d = DOOR[game.door];
  const badge = $('doorBadge');
  if (badge.textContent !== d.label && animate) { badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop'); }
  badge.textContent = d.label;
  badge.className = `badge ${d.tone}${badge.classList.contains('pop') ? ' pop' : ''}`;
  badge.title = d.ko;
  const idx = ['CLOSED', 'AJAR', 'UNLOCKED', 'OPEN'].indexOf(game.door);
  const prog = $('doorProgress');
  prog.className = `door-progress ${d.tone}`;
  [...prog.children].forEach((el, i) => el.classList.toggle('on', i <= idx));

  const mood = $('moodText');
  const label = game.history.length ? game.history[game.history.length - 1].mood : '단단히 화남';
  if (mood.textContent !== label) { mood.textContent = label; if (animate) { mood.classList.remove('fade'); void mood.offsetWidth; mood.classList.add('fade'); } }

  const tryEl = $('tryCount');
  tryEl.textContent = pad(game.history.length);
  if (animate) { tryEl.classList.remove('bump'); void tryEl.offsetWidth; tryEl.classList.add('bump'); }

  const door = $('door');
  door.classList.toggle('ajar', idx === 1 || idx === 2);
  $('lockPlate').innerHTML = icon(idx >= 2 ? 'unlock' : 'lock');
  $('lockPlate').classList.toggle('unlocked', idx >= 2);
  const tier = moodTier(game);
  const light = idx >= 2 ? 3 : idx === 1 ? 2 : tier >= 2 ? 1 : 0;
  $('lightGap').className = `light-gap${light ? ' l' + light : ''}`;
}

function renderHistory() {
  const list = $('historyList');
  if (!game.history.length) { list.innerHTML = '<li class="empty">아직 아무것도 하지 않았다.</li>'; return; }
  list.innerHTML = game.history
    .map((h, i) => {
      const prev = i ? game.history[i - 1].door : 'CLOSED';
      return `<li><b>${h.turn}.</b>${esc(ACTIONS[h.action].short)}${h.text ? ` <span class="muted">“${esc(h.text.slice(0, 10))}${h.text.length > 10 ? '…' : ''}”</span>` : ''}<span class="dot${prev !== h.door ? ' door' : ''}"></span></li>`;
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
  el.classList.remove('in');
  void el.offsetWidth;
  el.textContent = text;
  el.classList.add('in');
}
function replay(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

function animateAction(action) {
  const door = $('door');
  const gift = $('giftOnMat');
  if (gift.classList.contains('on') && action !== 'gift') gift.className = 'gift-on-mat';
  if (action === 'knock') { replay(door, 'knock'); replay($('knockRing'), 'go'); }
  if (action === 'letter') replay($('letterFly'), 'go');
  if (action === 'gift') { gift.className = 'gift-on-mat'; void gift.offsetWidth; gift.classList.add('on'); }
}

async function play(action, text = '', extra = {}) {
  if (ui.busy || !game || game.over) return;
  ui.busy = true;
  document.getElementById('app').classList.add('busy');
  closeSub();
  animateAction(action);
  setBubble('', true);
  setNarration(action === 'wait' ? '문 앞에 조용히 기다린다…' : '문 너머의 반응을 기다린다…');

  const prevDoor = game.door;
  const local = localTurn(game, action, text, extra);
  let out = local;
  const started = Date.now();
  if (usingAI()) {
    try {
      const ai = await api('api/turn', { npc: npcPayload(), history: historyPayload(), action: { type: action, label: ACTIONS[action].label + (extra.gift ? ` (${extra.gift})` : ''), text }, state: { door: game.door, hurt: game.hurt, trust: game.trust } });
      out = { ...ai, tag: local.tag, cat: local.cat };
    } catch (err) {
      toast(`AI 응답 실패: ${err.message} · 로컬 반응으로 대체합니다.`);
    }
  }
  const minWait = action === 'wait' ? 1600 : action === 'letter' ? 1500 : 900;
  await sleep(Math.max(0, minWait - (Date.now() - started)));

  const entry = commitTurn(game, action, text, extra, out);
  setBubble(entry.npcLine);
  setNarration(entry.narration || '');
  if (action === 'gift') {
    const good = (out.cat || '').startsWith('giftGood') || entry.dw > 2;
    if (good) setTimeout(() => $('giftOnMat').classList.add('taken'), 900);
  }
  const order = ['CLOSED', 'AJAR', 'UNLOCKED', 'OPEN'];
  if (order.indexOf(entry.door) < order.indexOf(prevDoor)) replay($('door'), 'slam');
  if (entry.door === 'UNLOCKED' && prevDoor !== 'UNLOCKED') { $('door').classList.add('turn'); setTimeout(() => $('door').classList.remove('turn'), 600); }
  renderStatus();
  renderHistory();

  if (game.over) await openDoor();
  ui.busy = false;
  document.getElementById('app').classList.remove('busy');
  if (!game.over && action === 'free') $('directInput').focus();
}

async function openDoor() {
  const door = $('door');
  await sleep(1100);
  if (ui.image) { $('roomImg').src = ui.image; $('roomImg').hidden = false; }
  else $('roomPlaceholder').hidden = false;
  door.classList.add('turn');
  await sleep(350);
  door.classList.remove('ajar');
  door.classList.add('open');
  document.querySelector('.frame').classList.add('revealed');
  $('lightGap').className = 'light-gap l3';

  let result = null;
  const started = Date.now();
  if (usingAI()) {
    try { result = await api('api/result', { npc: npcPayload(), history: historyPayload() }); }
    catch (err) { toast(`결과 생성 실패: ${err.message} · 로컬 결과를 보여 줍니다.`); }
  }
  if (!result) result = localResult(game);
  await sleep(Math.max(0, 2600 - (Date.now() - started)));
  showResult(result);
}

function showResult(r) {
  $('resultImg').style.backgroundImage = ui.image ? `url("${ui.image}")` : '';
  $('resultImg').innerHTML = ui.image ? '' : icon('user');
  $('resultName').textContent = npc.name;
  $('resTries').textContent = `${game.history.length}회`;
  $('resEmotion').textContent = r.final_emotion;
  $('resType').textContent = r.reconciliation_type;
  $('resNote').textContent = r.reconciliation_note;
  $('resDecisive').textContent = r.decisive_moment;
  $('resJourney').innerHTML = (r.inner_journey || []).map((s) => `<li>${esc(s)}</li>`).join('');
  $('resLast').textContent = `“${r.last_thought}”`;
  $('resMsg').textContent = `“${r.message_to_pc}”`;
  show('resultModal');
}

/* ---------- actions panel ---------- */
function buildActions() {
  const list = $('actionList');
  list.innerHTML = ['knock', 'letter', 'talk', 'gift', 'wait']
    .map((k) => `<button type="button" class="action" data-action="${k}">${icon(ACTIONS[k].icon)}<span>${ACTIONS[k].label}</span><kbd>${ACTIONS[k].key}</kbd></button>`)
    .join('');
  list.addEventListener('click', (e) => { const b = e.target.closest('.action'); if (b) chooseAction(b.dataset.action); });
}

function chooseAction(a) {
  if (ui.busy || !game || game.over) return;
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

/* ---------- modals ---------- */
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
  if (!game || !game.history.length) list.innerHTML = '<p class="muted">아직 기록이 없습니다.</p>';
  else
    list.innerHTML = game.history
      .map((h) => `<div class="log-turn"><div class="t"><span>TRY ${pad(h.turn)}</span><span>${DOOR[h.door].label}</span></div>
        <p class="pc">나 · ${esc(h.actionLabel)}${h.text ? ` — “${esc(h.text)}”` : ''}</p>
        <p class="npc">${esc(npc.name)} · ${h.npcLine ? `“${esc(h.npcLine)}”` : '(침묵)'}</p>
        ${h.narration ? `<p class="nar">${esc(h.narration)}</p>` : ''}
        ${game.over && h.thought ? `<p class="think">속마음 · ${esc(h.thought)}</p>` : ''}</div>`)
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
    play('free', v);
  });
  $('subpanel').addEventListener('click', (e) => {
    const say = e.target.closest('[data-say]');
    const gift = e.target.closest('[data-gift]');
    if (say) play('talk', say.dataset.say);
    if (gift) play('gift', '', { gift: gift.dataset.gift });
    if (e.target.closest('[data-custom]')) { closeSub(); $('directInput').focus(); }
  });
  $('subpanel').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = e.target.querySelector('input').value.trim();
    if (v) play('gift', '', { gift: v });
  });
  $('letterText').addEventListener('input', (e) => ($('letterCount').textContent = `${e.target.value.length} / 500`));
  $('letterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('letterText').value.trim();
    if (!v) return;
    $('letterText').value = '';
    $('letterCount').textContent = '0 / 500';
    hide('letterModal');
    play('letter', v);
  });
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => (b.closest('.overlay').hidden = true)));
  document.querySelectorAll('.overlay:not(#setup):not(#resultModal)').forEach((o) => o.addEventListener('click', (e) => { if (e.target === o) o.hidden = true; }));

  $('btnLog').addEventListener('click', openLog);
  $('btnLog2').addEventListener('click', openLog);
  $('resLog').addEventListener('click', openLog);
  $('btnSettings').addEventListener('click', () => show('settingsModal'));
  $('engineSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    ui.engine = b.dataset.engine;
    store.set('engine', ui.engine);
    renderEngine();
  });
  const rm = $('reduceMotion');
  rm.checked = store.get('reduceMotion', false);
  document.body.classList.toggle('reduce-motion', rm.checked);
  rm.addEventListener('change', () => { document.body.classList.toggle('reduce-motion', rm.checked); store.set('reduceMotion', rm.checked); });
  const restart = () => { if (ui.busy) return; hide('settingsModal'); hide('resultModal'); hide('logModal'); startGame(); };
  const reset = () => { if (ui.busy) return; hide('settingsModal'); hide('resultModal'); hide('logModal'); game = null; show('setup'); };
  $('btnRestart').addEventListener('click', () => npc && restart());
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
