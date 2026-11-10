// OOC: 사과 과정 한 번(+필요하면 이어서), 속마음·결과 한 번.
// - 롤플 채팅 입력창 제한에 맞춰 조각마다 1,500자 이하
// - 마음 수치는 문자로 숨기고, 속마음은 문이 열린 뒤에만 받는다

export const INPUT_LIMIT = 1500;
export const DOOR_ORDER = ['CLOSED', 'AJAR', 'UNLOCKED', 'OPEN'];
const DOOR_KO = { CLOSED: '잠김', AJAR: '기댐', UNLOCKED: '해제', OPEN: '열림' };
const CODE = 'ZKFRMTHBXV';
const TABLE = [...CODE].map((c, i) => `${i}=${c}`).join(' ');

const ACTION_WORDS = [
  ['knock', /노크|두드/],
  ['letter', /편지|쪽지|메모/],
  ['gift', /선물|두고|놓고/],
  ['wait', /기다|침묵|머무|앉아/],
  ['talk', /말|대화|대사|부르/],
  ['act', /행동|기타/],
];
const ACTION_KO = { knock: '노크', letter: '편지', talk: '말', gift: '선물', wait: '기다림', act: '행동' };

const clip = (s, n) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n) + '…' : t;
};

const who = (label, name) => (name ? `${label}(${name})` : label);
const HEAD = (n, title, story) => `[OOC ${n} · CLOSED DOOR ${title}] 잠시 역할극 중단. 새로운 에피소드.
조건 : NPC/PC 기존설정, 관계성, 성격, 성향, 말투, 서사, 캐릭터정보, 유저노트, 로어북 종합참고
상황 : ${who('NPC', story?.npcName)}가 ${who('PC', story?.pcName)}와 다툰 뒤 방에 들어가 문을 잠갔다. PC는 닫힌 문 앞에서 사과한다. 두 사람 모두 성인이다.`;

const RULES = `[진행] PC는 기존 설정의 성격대로 사과를 시도하고, NPC는 기존 설정의 성격과 말투로 반응한다. 쉽게 용서하지 않는다. 진정성·구체성·책임 인정·공감은 마음을 열고, 변명·탓·재촉·같은 행동의 반복은 닫는다. 선물과 기다림은 NPC의 성격에 따라 다르게 받아들인다. 문은 한 번에 한 단계까지만 바뀌고 마음이 상하면 되돌아간다(잠김→기댐→해제→열림). 횟수가 아니라 NPC가 납득했을 때 연다.
행동 : 노크·편지·말·선물·기다림·행동 중 하나
마음 : 그 시도 직후 NPC의 상처(남은 화·서운함)와 신뢰(다시 믿고 싶은 마음)를 0~9로 판정해 숫자 대신 문자로만 쓴다. ${TABLE}`;

const TURN_FORMAT = (from) => `T${pad2(from)} | 행동 | PC의 말이나 행동 | NPC 대사(침묵이면 …) | 문 너머 소리나 기척 | 문 상태 | 상처문자 신뢰문자`;
const pad2 = (n) => String(n).padStart(2, '0');

export function buildStoryPrompt() {
  return `${HEAD('1/2', '사과 과정')}
다툰 이유 : 기존 서사에서 가장 개연성 있는 갈등으로 정한다.

${RULES}
사과 시도는 6~10번이고, 마지막 시도에서 문이 열린다.

[출력] 역할극 서술 없이 코드블록 하나에 아래 형식으로만 쓴다. 속마음과 숫자는 쓰지 않는다. 칸마다 80자 이내.
이름 | NPC 이름 | PC 이름
사건 | 다툰 이유 한 문장
말투 | 반말 또는 존댓말
시작 | 문을 닫으며 NPC가 한 말
${TURN_FORMAT(1)}
(T02, T03 … 같은 형식으로 문이 열릴 때까지 한 시도 한 줄)`;
}

const summary = (turns, max = 12) => {
  const lines = turns.map((t) => `T${pad2(t.n)} ${ACTION_KO[t.action]}${t.pc ? ` "${clip(t.pc, 14)}"` : ''} → ${DOOR_KO[t.door]}`);
  return lines.length > max ? [...lines.slice(0, 3), `… (${lines.length - max + 3}번 생략)`, ...lines.slice(-(max - 4))].join('\n') : lines.join('\n');
};

export function buildMorePrompt(story) {
  const last = story.turns[story.turns.length - 1];
  const next = last.n + 1;
  return `${HEAD('+', '이어서', story)}
다툰 이유 : ${clip(story.incident || '앞서 정한 갈등', 120)}
앞서 출력한 사과 과정이 T${pad2(last.n)}에서 끝났지만 문은 아직 ${DOOR_KO[last.door]} 상태다. 마지막 마음 ${CODE[Math.floor(last.hurt / 10)]} ${CODE[Math.floor(last.trust / 10)]}.
${summary(story.turns, 8)}

${RULES}
T${pad2(next)}부터 이어서 최대 6번 더 시도하고, NPC가 납득하면 문을 연다.

[출력] 역할극 서술 없이 코드블록 하나에 아래 형식으로만 쓴다. 속마음과 숫자는 쓰지 않는다. 칸마다 80자 이내.
${TURN_FORMAT(next)}`;
}

export function buildInnerPrompt(story) {
  const n = story.turns.length;
  return `${HEAD('2/2', '속마음', story)}
다툰 이유 : ${clip(story.incident || '앞서 정한 갈등', 120)}
앞서 출력한 사과 과정 끝에 NPC가 문을 열었다. 총 ${n}번의 시도.
${summary(story.turns)}

[판정] 각 시도에서 NPC가 겉으로 한 말이 아니라 그때의 진짜 속마음을 쓴다. 근거 없는 미화는 금지한다. 화해 결과는 완전한 화해·조건부 화해·어색한 화해 중 NPC의 실제 마음에 가장 가까운 것을 고른다.

[출력] 역할극 서술 없이 코드블록 하나에 아래 줄만 쓴다. PC의 감정은 쓰지 않는다. 줄마다 80자 이내.
T01 | 그 시도 때 NPC의 속마음 (1인칭)
(T${pad2(n)}까지 모든 시도)
감정 | 최종 감정 상태 (짧은 구)
계기 | 문을 열기로 결심한 결정적 계기 (몇 번째 시도인지 포함)
직전 | 문을 열기 직전의 생각 (1인칭 독백)
한마디 | PC에게 하고 싶은 말 (NPC 말투)
화해 | 완전한 화해·조건부 화해·어색한 화해 중 하나 | 그 이유 한 문장`;
}

/* ---------- parsing ---------- */
const KEYS = {
  names: ['이름', '등장인물', '인물'],
  case: ['사건', '다툰이유', '갈등'],
  speech: ['말투'],
  start: ['시작', '첫마디', '처음'],
  emotion: ['감정', '최종감정'],
  trigger: ['계기', '결정적계기'],
  last: ['직전', '열기직전'],
  message: ['한마디', '하고싶은말'],
  ending: ['화해', '화해결과', '결과'],
};
const norm = (s) => s.replace(/[\s*_`#>\-•·:：\[\]【】]/g, '').toLowerCase();
const KEY_INDEX = Object.entries(KEYS).flatMap(([k, list]) => list.map((a) => [norm(a), k]));
const unquote = (s) => String(s || '').replace(/^[*_\s"“'「『(]+|[*_\s"”'」』)]+$/g, '').trim();

function lines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((raw, i) => ({ no: i + 1, line: raw.trim() }))
    .filter((l) => l.line && !/^```/.test(l.line));
}
const split = (s) => s.split(/\s*[|｜]\s*/).map((p) => p.trim());
const turnHead = (line) => line.match(/^[*_\s]*T\s*0*(\d{1,2})[*_\s]*[|｜:：]\s*(.*)$/i);

function parseDoor(v) {
  const s = String(v || '').replace(/\s/g, '').toLowerCase();
  if (/열림|열었|열린|^open/.test(s)) return 'OPEN';
  if (/해제|풀림|풀었|unlock/.test(s)) return 'UNLOCKED';
  if (/기댐|기대|살짝|틈|듣|ajar/.test(s)) return 'AJAR';
  if (/잠김|잠금|잠겨|닫힘|closed|locked/.test(s)) return 'CLOSED';
  return null;
}
function parseAction(v) {
  const s = String(v || '');
  for (const [k, re] of ACTION_WORDS) if (re.test(s)) return k;
  return null;
}
function parseLevel(ch) {
  if (!ch) return null;
  const c = ch.toUpperCase();
  const i = CODE.indexOf(c);
  if (i >= 0) return i * 10 + 5;
  if (/^[0-9]$/.test(c)) return Number(c) * 10 + 5;
  return null;
}
function parseMind(v) {
  const tokens = String(v || '').replace(/[^A-Za-z0-9]/g, ' ').trim().split(/\s+/).filter(Boolean);
  const flat = tokens.length === 1 && tokens[0].length === 2 ? [...tokens[0]] : tokens;
  return [parseLevel(flat[0]), parseLevel(flat[1])];
}
const silent = (s) => (/^[.…\s]*$|^\(?침묵\)?$|^-$/.test(s) ? '' : s);

/** 사과 과정(또는 이어서) 답. prev가 있으면 마지막 상태에서 이어 읽는다. */
export function parseStory(text, prev = null) {
  const story = prev ? { ...prev, turns: [...prev.turns] } : { npcName: '', pcName: '', incident: '', speech: 'casual', start: '', turns: [] };
  const errors = [];
  const added = [];
  let state = prev?.turns.length ? prev.turns[prev.turns.length - 1] : { door: 'CLOSED', hurt: 75, trust: 35 };
  for (const { no, line } of lines(text)) {
    const t = turnHead(line);
    if (t) {
      const n = Number(t[1]);
      const p = split(t[2]);
      if (p.length < 5) { errors.push(`${no}번째 줄(T${pad2(n)}): 칸이 ${p.length}개뿐이에요. 행동 | PC | NPC 대사 | 소리 | 문 | 마음 순서로 6칸이 필요해요.`); continue; }
      const action = parseAction(p[0]) || 'act';
      let door = null;
      let doorIdx = -1;
      for (let i = p.length - 1; i >= 2; i--) { const d = parseDoor(p[i]); if (d && p[i].length <= 8) { door = d; doorIdx = i; break; } }
      if (!door) { errors.push(`${no}번째 줄(T${pad2(n)}): 문 상태를 찾지 못했어요. 잠김·기댐·해제·열림 중 하나를 써 주세요.`); continue; }
      const [h, tr] = doorIdx + 1 < p.length ? parseMind(p[doorIdx + 1]) : [null, null];
      const pc = unquote(p[1]);
      const npcLine = silent(unquote(p[2] || ''));
      const sound = doorIdx > 3 ? unquote(p[3]) : '';
      const a = DOOR_ORDER.indexOf(state.door);
      let b = DOOR_ORDER.indexOf(door);
      if (b - a > 2) b = a + 2;
      const turn = { n, action, pc: clip(pc === '-' ? '' : pc, 160), npc: clip(npcLine, 200), sound: clip(sound, 140), door: DOOR_ORDER[b], hurt: h ?? state.hurt, trust: tr ?? state.trust };
      const existing = story.turns.findIndex((x) => x.n === n);
      if (existing >= 0) story.turns[existing] = turn; else story.turns.push(turn);
      added.push(turn);
      state = turn;
      continue;
    }
    const m = line.match(/^(.{1,12}?)\s*[|｜:：]\s*(.*)$/);
    if (!m) continue;
    const key = KEY_INDEX.find(([a]) => a === norm(m[1]))?.[1];
    const val = unquote(m[2]);
    if (key === 'names') { const p = split(m[2]).map(unquote); if (p[0]) story.npcName = clip(p[0].replace(/^NPC\s*[:：]?\s*/i, ''), 12); if (p[1]) story.pcName = clip(p[1].replace(/^PC\s*[:：]?\s*/i, ''), 12); }
    if (key === 'case') story.incident = clip(val, 120);
    if (key === 'speech') story.speech = /존댓|존대|formal/.test(val) ? 'formal' : 'casual';
    if (key === 'start') story.start = silent(clip(val, 160));
  }
  story.turns.sort((x, y) => x.n - y.n);
  if (!added.length && !errors.length) errors.push('`T01 | …` 처럼 시도마다 한 줄씩 쓴 부분을 찾지 못했어요.');
  if (errors.length && !added.length) return { ok: false, errors };
  return { ok: true, story, added: added.length, warnings: errors };
}

export function parseInner(text, story) {
  const thoughts = {};
  const res = { final_emotion: '', decisive_moment: '', last_thought: '', message_to_pc: '', reconciliation_type: '조건부 화해', reconciliation_note: '' };
  let hit = 0;
  for (const { line } of lines(text)) {
    const t = turnHead(line);
    if (t) { thoughts[Number(t[1])] = clip(unquote(split(t[2])[0]), 160); hit++; continue; }
    const m = line.match(/^(.{1,12}?)\s*[|｜:：]\s*(.*)$/);
    if (!m) continue;
    const key = KEY_INDEX.find(([a]) => a === norm(m[1]))?.[1];
    const parts = split(m[2]);
    const val = unquote(m[2]);
    if (key === 'emotion') { res.final_emotion = val; hit++; }
    if (key === 'trigger') { res.decisive_moment = val; hit++; }
    if (key === 'last') { res.last_thought = val; hit++; }
    if (key === 'message') { res.message_to_pc = val; hit++; }
    if (key === 'ending') {
      const kind = parts[0].replace(/\s/g, '');
      res.reconciliation_type = /완전/.test(kind) ? '완전한 화해' : /어색/.test(kind) ? '어색한 화해' : '조건부 화해';
      res.reconciliation_note = unquote(parts.slice(1).join(' '));
      hit++;
    }
  }
  if (!hit) return { ok: false, errors: ['`T01 | 속마음`, `감정 |`, `한마디 |` 같은 줄을 찾지 못했어요.'] };
  res.thoughts = thoughts;
  res.inner_journey = story.turns.filter((t) => thoughts[t.n]).map((t) => ({ n: t.n, action: t.action, text: thoughts[t.n] }));
  return { ok: true, result: res };
}
