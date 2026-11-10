export const ACTIONS = {
  knock: { label: '노크하기', short: '노크', icon: 'hand', tone: 'peach' },
  letter: { label: '편지 넣기', short: '편지', icon: 'mail', tone: 'sky' },
  talk: { label: '말 걸기', short: '말 걸기', icon: 'chat', tone: 'sage' },
  gift: { label: '선물 두기', short: '선물', icon: 'gift', tone: 'rose' },
  wait: { label: '기다리기', short: '기다림', icon: 'clock', tone: 'lav' },
  act: { label: '행동', short: '행동', icon: 'sparkle', tone: 'butter' },
};
export const ACTION_ORDER = ['knock', 'letter', 'talk', 'gift', 'wait', 'act'];

export const DOOR = {
  CLOSED: { label: 'LOCKED', ko: '잠김', tone: 'locked' },
  AJAR: { label: 'AJAR', ko: '기댐', tone: 'ajar' },
  UNLOCKED: { label: 'UNLOCKED', ko: '해제', tone: 'unlocked' },
  OPEN: { label: 'OPEN', ko: '열림', tone: 'open' },
};

export const MOOD_TIERS = ['단단히 화남', '아직 화가 남', '마음이 흔들림', '많이 누그러짐', '문 앞에 서 있음'];

export const HANGER = {
  casual: { CLOSED: '들어오지 마', AJAR: '듣고만 있음', UNLOCKED: '잠깐만', OPEN: '' },
  formal: { CLOSED: '혼자 있을게요', AJAR: '듣고 있어요', UNLOCKED: '잠시만요', OPEN: '' },
};

export const SAMPLE_STORY = `\`\`\`
이름 | 하윤 | 도윤
사건 | 기념일 저녁 약속을 잊고 친구들과 늦게까지 있다가 연락도 하지 않았다
말투 | 반말
시작 | 오늘은 말 걸지 마. 진짜로.
T01 | 노크 | 하윤아, 나야. 잠깐만 얘기하자. | …… | 이불을 뒤집어쓰는 소리가 난다. | 잠김 | X F
T02 | 말 | 미안해. 근데 나도 일부러 그런 건 아니었어. | 일부러가 아니면 다야? 그게 더 싫어. | 베개가 문에 쿵 하고 부딪힌다. | 잠김 | V K
T03 | 기다림 | 문 앞에 등을 기대고 말없이 앉아 있는다. | …… | 한참 뒤, 문 쪽으로 다가오는 발소리. | 잠김 | B F
T04 | 편지 | 기념일 잊은 거, 연락 안 한 거 전부 내 잘못이야. 혼자 기다렸을 너를 생각하니까 미안해서 잠이 안 와. | …글씨 엉망이네. | 종이 펼치는 소리가 길게 이어진다. | 기댐 | H R
T05 | 선물 | 네가 좋아하는 딸기 케이크를 문 앞에 둔다. | 이걸로 넘어갈 줄 알았어? | 상자는 문 앞에 그대로 남아 있다. | 기댐 | H R
T06 | 말 | 케이크는 핑계야. 네가 기다리는 동안 얼마나 서운했을지, 그거 다 듣고 싶어. | …진짜 듣고 싶어? 다 말해도 돼? | 문 바로 앞에서 작게 코를 훌쩍인다. | 기댐 | T T
T07 | 말 | 응. 그리고 다음 기념일은 내가 먼저 준비할게. 약속해. | 그 말, 처음부터 했으면 됐잖아. | 딸깍, 잠금이 풀리는 소리. | 해제 | M H
T08 | 노크 | 똑, 똑. 하윤아, 얼굴 보고 사과하고 싶어. | …들어와. 아니, 내가 나갈게. | 손잡이가 천천히 돌아간다. | 열림 | F B
\`\`\``;

export const SAMPLE_INNER = `\`\`\`
T01 | 지금 얼굴 보면 울 것 같아서 대답도 못 하겠어.
T02 | 일부러가 아니라는 말이 제일 아팠어. 결국 자기 변명이잖아.
T03 | 가 버린 줄 알았는데 아직 있네. 조금은 다행이었어.
T04 | 내가 혼자 기다린 걸 알고 있었구나. 그 한 줄에서 눈물이 났어.
T05 | 케이크는 반가웠지만, 그걸로 끝내려는 것 같아서 다시 서운해졌어.
T06 | 내 얘기를 듣고 싶다는 말에 마음이 무너졌어.
T07 | 약속까지 하니까, 한 번만 더 믿어 보고 싶어졌어.
T08 | 이제 문을 안 열면 내가 더 후회할 것 같았어.
감정 | 안도와 쑥스러움
계기 | 4번째 시도의 편지. 무엇을 잘못했는지 정확히 알고 있었다
직전 | 얼굴 보면 또 울 텐데. 그래도 오늘은 안아 주고 싶어.
한마디 | 다음엔 문 잠그기 전에 잡아. 바보야, 기다렸단 말이야.
화해 | 조건부 화해 | 약속을 지키는지 지켜보겠다는 마음이 아직 남아 있다
\`\`\``;
