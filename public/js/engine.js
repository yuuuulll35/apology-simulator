import { PERSONALITIES, LINES, NARRATION, THOUGHTS, MOOD_TIERS, ENDINGS, MESSAGES, ACTIONS } from './data.js';

const DOOR_ORDER = ['CLOSED', 'AJAR', 'UNLOCKED', 'OPEN'];
const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

const PATTERNS = {
  ack: /미안|죄송|잘못|내 탓|내탓|사과할|사과하고|반성|내가 (너무|심했|그랬|실수)/,
  empathy: /속상|서운|아팠|아프게|힘들었|힘들게|상처|외로|화날 만|화가 날 만|기분 (나빴|상했)|마음 (아팠|상했)|이해해/,
  commit: /다음(엔|에는|부터)|앞으로|다시는|약속|노력|고칠|바꿀|조심할|안 그럴/,
  affection: /사랑|좋아해|보고 싶|소중|고마워|고마웠/,
  excuse: /근데|그런데|하지만|그치만|그래도|어쩔 수|일부러 (그런|그랬|한) (건|게) 아니|바빠서|그럴 의도|오해/,
  blame: /너도|니가|네가 먼저|너 때문|니 때문|예민|오버|별것도|별거 아닌|그만 삐|유난/,
  pressure: /빨리|열어|문 좀|언제까지|그만 좀|나와|나오라|대답 좀|대답해/,
  joke: /ㅋ|ㅎㅎ|ㅋㅋ|^ㅇㅇ$|ㅗ/,
};

function keywordsOf(text) {
  return (text || '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/(을|를|이|가|은|는|에서|에게|에|와|과|도|만|으로|로|했다|해서|하고)$/u, ''))
    .filter((w) => w.length >= 2);
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const A = new Set(keywordsOf(a));
  const B = new Set(keywordsOf(b));
  if (!A.size || !B.size) return a.trim() === b.trim() ? 1 : 0;
  let hit = 0;
  A.forEach((w) => B.has(w) && hit++);
  return hit / Math.max(A.size, B.size);
}

export function analyzeWords(text, incidentWords) {
  const t = (text || '').trim();
  const f = {};
  for (const [k, re] of Object.entries(PATTERNS)) f[k] = re.test(t);
  const words = keywordsOf(t);
  f.specific = words.some((w) => incidentWords.some((iw) => iw.includes(w) || w.includes(iw)));
  f.length = t.length;
  let pos = (f.ack ? 6 : 0) + (f.empathy ? 7 : 0) + (f.commit ? 5 : 0) + (f.specific ? 6 : 0) + (f.affection ? 3 : 0);
  pos += Math.min(6, Math.floor(t.length / 20));
  if (t.length < 4) pos = 0;
  const neg = (f.excuse ? 8 : 0) + (f.blame ? 15 : 0) + (f.pressure ? 7 : 0) + (f.joke ? 6 : 0);
  return { pos, neg, f };
}

export function createGame(npc) {
  const sev = Number(npc.severity) || 3;
  const relBase = { 연인: 38, 가족: 42, 친구: 36, 룸메이트: 32, '직장 동료': 28, 선후배: 30 }[npc.relation] ?? 34;
  return {
    npc,
    pers: PERSONALITIES[npc.personality] || PERSONALITIES.tsun,
    incidentWords: keywordsOf(npc.incident),
    likeWords: keywordsOf(npc.likes),
    hurt: clamp(46 + sev * 9),
    trust: clamp(relBase + (sev <= 2 ? 8 : 0)),
    door: 'CLOSED',
    history: [],
    used: new Set(),
    streak: { action: null, count: 0 },
    counts: { knock: 0, letter: 0, talk: 0, gift: 0, wait: 0, free: 0 },
    lastText: '',
    sincere: 0,
    over: false,
  };
}

export const warmthOf = (g) => g.trust - g.hurt;

export function moodTier(g) {
  const w = warmthOf(g);
  if (w < -35) return 0;
  if (w < -15) return 1;
  if (w < 0) return 2;
  if (w < 15) return 3;
  return 4;
}

export const moodLabel = (g) => MOOD_TIERS[moodTier(g)];

function pick(g, pool, tag) {
  if (!pool || !pool.length) return '';
  const fresh = pool.filter((l) => !g.used.has(tag + l));
  const list = fresh.length ? fresh : pool;
  const line = list[Math.floor(Math.random() * list.length)];
  g.used.add(tag + line);
  return line;
}

function evaluate(g, action, text, extra) {
  const m = g.pers.mod;
  const tier = moodTier(g);
  const repeat = g.streak.action === action ? g.streak.count : 0;
  let dH = 0;
  let dT = 0;
  let cat = 'cold';
  let tag = '';
  let sincere = false;

  if (action === 'knock') {
    if (repeat >= 1) {
      dH = (5 + repeat * 3) / m.knock;
      dT = -2;
      cat = 'annoyed';
      tag = '연속 노크';
    } else {
      dT = 3 * m.knock;
      dH = -1;
      cat = tier >= 2 ? 'soft' : 'cold';
      tag = '조용한 노크';
    }
  } else if (action === 'wait') {
    const last = g.history[g.history.length - 1];
    if (repeat >= 1) {
      dT = -(3 + repeat * 2) / m.wait;
      dH = -1;
      cat = 'lonely';
      tag = '너무 긴 침묵';
    } else if (last && last.dw > 0) {
      dH = -6 * m.wait;
      dT = 1;
      cat = 'silence';
      tag = '생각할 시간';
    } else {
      dH = -3 * m.wait;
      cat = 'silence';
      tag = '기다림';
    }
  } else if (action === 'gift') {
    const name = extra?.gift || '';
    const liked = g.likeWords.some((w) => name.includes(w) || w.includes(name.replace(/\s/g, '').slice(0, 2)));
    const many = g.counts.gift;
    if (many >= 2 || (tier === 0 && !liked)) {
      dH = 4 / m.gift;
      dT = -3;
      cat = 'giftBad';
      tag = many >= 2 ? '선물 공세' : '이른 선물';
    } else {
      const base = liked ? 5 : 2;
      dH = -(base * m.gift) / (1 + many);
      dT = (liked ? 3 : 1) * m.gift;
      cat = liked ? 'giftGood' : tier >= 2 ? 'giftGood' : 'giftBad';
      if (cat === 'giftBad') dH = Math.max(dH, 0);
      tag = liked ? '좋아하는 것을 기억함' : '성의 표시';
    }
  } else {
    const { pos, neg, f } = analyzeWords(text, g.incidentWords);
    let factor = m.words;
    if (action === 'letter') factor *= 1.15 * m.letter / (1 + 0.6 * g.counts.letter);
    if (action === 'talk') factor *= 0.55;
    const sim = similarity(text, g.lastText);
    if (sim > 0.6) factor *= 0.25;
    const bonus = action === 'letter' ? 2 : 0;
    dH = -(pos * 0.3 + bonus) * factor + neg * (action === 'letter' ? 0.8 : 1);
    dT = (pos * 0.25 + bonus) * factor - neg * 0.55;
    sincere = pos >= 12 && neg === 0 && sim <= 0.6;
    if (neg >= 8 && f.blame) cat = 'annoyed';
    else if (f.excuse && pos < 12) cat = 'excuse';
    else if (f.pressure) cat = 'annoyed';
    else if (pos - neg > 4) cat = action === 'letter' ? 'letter' : tier >= 3 ? 'warm' : tier >= 1 ? 'soft' : 'cold';
    else cat = g.npc.personality === 'quiet' && Math.random() < 0.4 ? 'silence' : 'cold';
    tag = f.blame ? '상대 탓' : f.excuse ? '변명 섞임' : f.ack && f.empathy ? '책임과 공감' : f.ack ? '잘못 인정' : f.specific ? '구체적인 사과' : sim > 0.6 ? '같은 말 반복' : '말 걸기';
    if (sim > 0.6 && cat !== 'annoyed') cat = 'cold';
  }

  dH -= 1;
  return { dH, dT, cat, tag, sincere };
}

function nextDoor(w, prev, dw, canOpen) {
  let target = w < -22 ? 0 : w < -4 ? 1 : w < 14 ? 2 : 3;
  if (!canOpen) target = Math.min(target, 2);
  let i = DOOR_ORDER.indexOf(prev);
  if (target > i) {
    if (target === 3 && (i < 2 || dw < 0)) return DOOR_ORDER[Math.min(i + 1, 2)];
    i += 1;
  } else if (target < i - 1 || (target < i && dw < -6)) {
    i -= 1;
  }
  return DOOR_ORDER[i];
}

export function localTurn(g, action, text = '', extra = {}) {
  const ev = evaluate(g, action, text, extra);
  const hurt = clamp(g.hurt + ev.dH);
  const trust = clamp(g.trust + ev.dT);
  const dw = trust - hurt - warmthOf(g);
  const prevDoor = g.door;
  const sincereCount = g.sincere + (ev.sincere ? 1 : 0);
  const door = nextDoor(trust - hurt, prevDoor, dw, sincereCount >= (Number(g.npc.severity) >= 4 ? 2 : 1));

  let cat = ev.cat;
  if (DOOR_ORDER.indexOf(door) > DOOR_ORDER.indexOf(prevDoor)) cat = { AJAR: 'ajar', UNLOCKED: 'unlock', OPEN: 'open' }[door];
  else if (DOOR_ORDER.indexOf(door) < DOOR_ORDER.indexOf(prevDoor) && cat !== 'annoyed') cat = 'annoyed';

  const lines = LINES[g.npc.personality] || LINES.tsun;
  return {
    npcLine: pick(g, lines[cat], 'L'),
    narration: pick(g, NARRATION[cat], 'N'),
    thought: pick(g, THOUGHTS[cat], 'T'),
    door,
    hurt,
    trust,
    mood: MOOD_TIERS[moodTier({ trust, hurt })],
    tag: ev.tag,
    sincere: ev.sincere,
    cat,
  };
}

export function commitTurn(g, action, text, extra, out) {
  const w0 = warmthOf(g);
  g.hurt = out.hurt;
  g.trust = out.trust;
  g.door = out.door;
  g.streak = g.streak.action === action ? { action, count: g.streak.count + 1 } : { action, count: 1 };
  g.counts[action] = (g.counts[action] || 0) + 1;
  if (text) g.lastText = text;
  if (out.sincere) g.sincere += 1;
  const w = warmthOf(g);
  const entry = {
    turn: g.history.length + 1,
    action,
    actionLabel: ACTIONS[action].label + (extra?.gift ? `(${extra.gift})` : ''),
    text,
    npcLine: out.npcLine,
    narration: out.narration,
    thought: out.thought,
    door: out.door,
    hurt: out.hurt,
    trust: out.trust,
    mood: out.mood || moodLabel(g),
    tag: out.tag || '',
    w,
    dw: w - w0,
  };
  g.history.push(entry);
  if (out.door === 'OPEN') g.over = true;
  return entry;
}

export function localResult(g) {
  const h = g.history;
  const decisive = h.reduce((a, b) => (b.dw > a.dw ? b : a), h[0]);
  const lowest = h.reduce((a, b) => (b.dw < a.dw ? b : a), h[0]);
  const negatives = h.filter((e) => e.dw < -3).length;
  const material = h.filter((e) => e.action === 'gift' || e.action === 'wait' || e.action === 'knock').length;

  let key = 'conditional';
  if (g.hurt <= 28 && g.trust >= 58 && negatives <= 1) key = 'full';
  else if (material > h.length / 2 || g.trust < 45) key = 'awkward';

  const quote = (e) => (e.text ? ` “${e.text.length > 40 ? e.text.slice(0, 40) + '…' : e.text}”` : '');
  const journey = [];
  const seen = new Set();
  const addStep = (e, prefix) => {
    if (!e || seen.has(e.turn) || !e.thought) return;
    seen.add(e.turn);
    journey.push({ turn: e.turn, text: `${prefix} ${e.thought}` });
  };
  addStep(h[0], '처음엔,');
  if (lowest && lowest.dw < 0) addStep(lowest, `${lowest.turn}번째 시도에선,`);
  addStep(decisive, `${decisive.turn}번째 시도에서,`);
  addStep(h[h.length - 2], '문 앞에서,');
  journey.sort((a, b) => a.turn - b.turn);

  const ending = ENDINGS[key];
  const msgs = MESSAGES[g.npc.personality] || MESSAGES.tsun;
  return {
    final_emotion: ending.emotion,
    decisive_moment: `${decisive.turn}번째 시도 · ${decisive.actionLabel}${quote(decisive)}${decisive.tag ? ` — ${decisive.tag}` : ''}`,
    inner_journey: journey.map((j) => j.text),
    last_thought: h[h.length - 1].thought,
    message_to_pc: msgs[key],
    reconciliation_type: ending.type,
    reconciliation_note: ending.note,
  };
}
