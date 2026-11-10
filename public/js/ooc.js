// OOC 모드: 턴마다 복사할 OOC를 만들고, AI 답변을 읽는다.
// - 롤플 채팅 입력창 제한에 맞춰 조각마다 1,500자 이하, 혼자서 완결
// - 마음 수치는 문자로 숨겨 채팅에 결과가 드러나지 않게 한다
// - 속마음은 턴마다 받지 않고, 문이 열린 뒤 결과 OOC에서 한 번에 받는다

export const INPUT_LIMIT = 1500;
export const TEXT_LIMIT = 400;

const CODE = 'ZKFRMTHBXV';
const TABLE = [...CODE].map((c, i) => `${i}=${c}`).join(' ');
const DOOR_KO = { CLOSED: '잠김', AJAR: '기댐', UNLOCKED: '해제', OPEN: '열림' };
const DOOR_ORDER = ['CLOSED', 'AJAR', 'UNLOCKED', 'OPEN'];

const levelToCode = (v) => CODE[Math.max(0, Math.min(9, Math.floor(v / 10)))];
const clip = (s, n) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n) + '…' : t;
};

const HEAD = (title, npc) => `[OOC · CLOSED DOOR ${title}] 잠시 역할극 중단. 새로운 에피소드.
조건 : NPC/PC 기존설정, 관계성, 성격, 성향, 말투, 서사, 캐릭터정보, 유저노트, 로어북 종합참고
상황 : NPC(${npc.name})가 PC(${npc.pcName || 'PC'})와 다툰 뒤 방에 들어가 문을 잠갔다. PC는 문밖에서 사과한다. NPC는 성인이다.`;

function incidentLine(npc, first) {
  if (npc.incident) return `다툰 이유 : ${clip(npc.incident, 120)}`;
  return first ? '다툰 이유 : 기존 서사에서 가장 개연성 있는 갈등으로 정한다.' : '다툰 이유 : 첫 턴에 정한 갈등을 유지한다.';
}

function historyLines(history) {
  if (!history.length) return '지난 턴 : 없음 (첫 턴)';
  const recent = history.slice(-5);
  const lines = recent.map((h) => `${h.turn}턴 ${h.actionLabel}${h.text ? ` "${clip(h.text, 22)}"` : ''} → ${h.npcLine ? `"${clip(h.npcLine, 18)}"` : '침묵'} (문 ${DOOR_KO[h.door]})`);
  const skipped = history.length - recent.length;
  return `지난 턴${skipped ? ` (앞의 ${skipped}턴 생략)` : ''} :\n${lines.join('\n')}`;
}

export function buildTurnPrompt({ npc, history, state, action }) {
  const turn = history.length + 1;
  const first = turn === 1;
  const said = action.text ? `\nPC가 ${action.type === 'act' ? '한 행동' : action.type === 'letter' ? '쓴 편지' : '한 말'} : "${clip(action.text, TEXT_LIMIT)}"` : '';
  const caseLine = first && !npc.incident ? '\n사건 | 다툰 이유 한 문장' : '';
  return `${HEAD(`${turn}턴`, npc)}
${incidentLine(npc, first)}
${historyLines(history)}
현재 문 : ${DOOR_KO[state.door]} / 직전 마음 : ${levelToCode(state.hurt)} ${levelToCode(state.trust)}

[이번 PC 행동] ${action.label}${said}

[판정] NPC의 성격·말투로 이번 행동 하나에만 반응한다. 쉽게 용서하지 않는다. 진정성·구체성·책임 인정·공감은 마음을 열고, 변명·탓·재촉·같은 행동 반복은 닫는다. 선물과 기다림은 성격에 따라 다르게 받아들인다. 문은 한 턴에 한 단계까지만 바뀌며 마음이 상하면 되돌아간다(잠김→기댐→해제→열림). 횟수가 아니라 NPC가 납득했을 때만 연다.
마음은 상처(남은 화·서운함)와 신뢰(다시 믿고 싶은 마음)를 0~9로 판정해 숫자 대신 문자로만 쓴다. ${TABLE}

[출력] 역할극 서술 없이 코드블록 하나에 아래 줄만 쓴다. PC의 대사·감정·행동은 쓰지 않는다. 숫자와 속마음은 쓰지 않는다.
대사 | NPC가 문 너머에서 하는 말 1~2문장 (침묵이면 …)
소리 | 문 너머에서 들리는 소리나 기척 한 문장
문 | 잠김·기댐·해제·열림 중 하나
마음 | 상처문자 신뢰문자${caseLine}`;
}

export function buildResultPrompt({ npc, history }) {
  const lines = history.map((h) => `${h.turn}턴 ${h.actionLabel}${h.text ? ` "${clip(h.text, 16)}"` : ''} → 문 ${DOOR_KO[h.door]}`);
  const shown = lines.length > 14 ? [...lines.slice(0, 4), `… (${lines.length - 10}턴 생략)`, ...lines.slice(-6)] : lines;
  return `${HEAD('결과', npc)}
${npc.incident ? `다툰 이유 : ${clip(npc.incident, 120)}` : '다툰 이유 : 앞서 정한 갈등.'}
NPC가 방금 문을 열었다. 총 ${history.length}번의 사과 시도가 있었다.
${shown.join('\n')}

[판정] 사과 과정 전체를 NPC 시점에서 돌아본다. 겉으로 한 말이 아니라 그때의 진짜 속마음을 쓴다. 근거 없는 미화는 금지한다. 화해 결과는 완전한 화해·조건부 화해·어색한 화해 중 NPC의 실제 마음에 가장 가까운 것을 고른다.

[출력] 역할극 서술 없이 코드블록 하나에 아래 줄만 쓴다. PC의 대사·감정·행동은 쓰지 않는다. 각 줄 100자 이내.
감정 | 최종 감정 상태 (짧은 구)
계기 | 문을 열기로 결심한 결정적 계기 (몇 턴의 어떤 행동이었는지 포함)
변화 | 처음 문을 잠갔을 때의 속마음
변화 | 사과를 들으며 흔들리던 속마음
변화 | 마음이 기운 순간의 속마음
직전 | 문을 열기 직전의 생각 (1인칭 독백)
한마디 | PC에게 하고 싶은 말 (NPC 말투)
화해 | 완전한 화해·조건부 화해·어색한 화해 중 하나 | 그 이유 한 문장`;
}

/* ---------- parsing ---------- */
const KEY_ALIASES = {
  line: ['대사', '말', 'npc', '대답'],
  sound: ['소리', '기척', '묘사', '나레이션', '서술'],
  door: ['문', '문상태', '문 상태', 'door'],
  mind: ['마음', '코드', '마음코드', '마음 코드'],
  case: ['사건', '다툰이유', '다툰 이유', '갈등'],
  emotion: ['감정', '최종감정', '최종 감정'],
  trigger: ['계기', '결정적계기', '결정적 계기'],
  change: ['변화', '내면', '내면변화', '속마음'],
  last: ['직전', '열기직전', '문을 열기 직전'],
  message: ['한마디', '하고싶은말', '하고 싶은 말', '말하고싶은것'],
  ending: ['화해', '화해결과', '화해 결과', '결과'],
};
const norm = (s) => s.replace(/[\s*_`#>\-•·:：\[\]【】]/g, '').toLowerCase();
const KEY_INDEX = Object.entries(KEY_ALIASES).flatMap(([k, list]) => list.map((a) => [norm(a), k])).sort((a, b) => b[0].length - a[0].length);

function rows(text) {
  const out = [];
  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || /^```/.test(line)) continue;
    const m = line.match(/^(.{1,16}?)\s*[|｜:：]\s*(.*)$/);
    if (!m) continue;
    const head = norm(m[1]);
    const hit = KEY_INDEX.find(([a]) => head === a);
    if (!hit) continue;
    const value = m[2].replace(/^[*_\s]+|[*_\s]+$/g, '').trim();
    out.push({ key: hit[1], value, parts: value.split(/\s*[|｜]\s*/).map((p) => p.trim()) });
  }
  return out;
}

const unquote = (s) => s.replace(/^["“'「『]+|["”'」』]+$/g, '').trim();

function parseDoor(v) {
  const s = v.replace(/\s/g, '').toLowerCase();
  if (/열림|열었|open(?!.*un)|^opened/.test(s)) return 'OPEN';
  if (/해제|풀림|unlock/.test(s)) return 'UNLOCKED';
  if (/기댐|기대|살짝|틈|듣|ajar/.test(s)) return 'AJAR';
  if (/잠김|잠금|닫힘|closed|locked/.test(s)) return 'CLOSED';
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

export function parseTurn(text, state) {
  const r = rows(text);
  const get = (k) => r.find((x) => x.key === k);
  const errors = [];
  const lineRow = get('line');
  const doorRow = get('door');
  const mindRow = get('mind');
  if (!lineRow && !get('sound')) errors.push('`대사 |` 줄을 찾지 못했어요.');
  const door = doorRow ? parseDoor(doorRow.value) : null;
  if (!doorRow) errors.push('`문 |` 줄을 찾지 못했어요.');
  else if (!door) errors.push(`문 상태 "${doorRow.value}"를 읽지 못했어요. 잠김·기댐·해제·열림 중 하나여야 해요.`);
  let hurt = state.hurt;
  let trust = state.trust;
  if (mindRow) {
    const letters = mindRow.value.replace(/[^A-Za-z0-9]/g, ' ').trim().split(/\s+/).filter(Boolean);
    const flat = letters.length === 1 && letters[0].length === 2 ? [...letters[0]] : letters;
    const h = parseLevel(flat[0]);
    const t = parseLevel(flat[1]);
    if (h != null) hurt = h;
    if (t != null) trust = t;
  }
  if (errors.length) return { ok: false, errors };

  let line = unquote(lineRow?.value || '');
  if (/^[.…\s]*$|^\(?침묵\)?$/.test(line)) line = '';
  const a = DOOR_ORDER.indexOf(state.door);
  let b = DOOR_ORDER.indexOf(door);
  if (b - a > 2) b = a + 2;
  return {
    ok: true,
    out: {
      npcLine: clip(line, 240),
      narration: clip(unquote(get('sound')?.value || ''), 160),
      thought: '',
      door: DOOR_ORDER[b],
      hurt,
      trust,
      incident: get('case') ? clip(unquote(get('case').value), 120) : '',
    },
  };
}

export function parseResult(text) {
  const r = rows(text);
  const get = (k) => r.find((x) => x.key === k)?.value || '';
  const changes = r.filter((x) => x.key === 'change').map((x) => unquote(x.value)).filter(Boolean);
  const endRow = r.find((x) => x.key === 'ending');
  const errors = [];
  if (!get('emotion') && !get('trigger') && !get('message')) errors.push('`감정 |`, `계기 |`, `한마디 |` 같은 줄을 찾지 못했어요.');
  if (errors.length) return { ok: false, errors };
  let type = '조건부 화해';
  let note = '';
  if (endRow) {
    const t = endRow.parts[0].replace(/\s/g, '');
    if (/완전/.test(t)) type = '완전한 화해';
    else if (/어색/.test(t)) type = '어색한 화해';
    else if (/조건/.test(t)) type = '조건부 화해';
    note = unquote(endRow.parts.slice(1).join(' ') || '');
  }
  return {
    ok: true,
    result: {
      final_emotion: unquote(get('emotion')) || '-',
      decisive_moment: unquote(get('trigger')) || '-',
      inner_journey: changes,
      last_thought: unquote(get('last')) || '…',
      message_to_pc: unquote(get('message')) || '…',
      reconciliation_type: type,
      reconciliation_note: note,
    },
  };
}
