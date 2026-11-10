# CLOSED DOOR

닫힌 문 너머의 NPC에게 사과하고, 마음을 돌려 문을 열게 만드는 턴제 사과 시뮬레이터 웹게임.

## 플레이

1. 사과할 상대(NPC)의 이름, 관계, 성격, 다툰 이유, 상처의 깊이, 좋아하는 것을 정한다.
2. 원하면 NPC 이미지를 올린다. 이미지는 문이 열리는 순간까지 공개되지 않고, 서버로 전송되지 않는다.
3. 매 턴 행동 하나를 고른다: 노크하기 · 편지 넣기 · 말 걸기 · 선물 두기 · 기다리기 · 직접 입력.
4. NPC가 문을 열면 결과 화면에서 총 시도 횟수, 최종 감정, 결정적 계기, 내면심리 변화, 문을 열기 직전의 생각, 하고 싶은 말, 화해 결과(완전한 화해 / 조건부 화해 / 어색한 화해)가 공개된다.

단축키: `1`~`5` 행동 선택, `Esc` 창 닫기.

### 문 상태

| 상태 | 의미 |
| --- | --- |
| CLOSED (LOCKED) | 완전히 닫힘 |
| AJAR | 문에 기대어 듣고 있음, 문틈으로 빛이 샘 |
| UNLOCKED | 잠금 해제 |
| OPEN | 문이 열림, 게임 종료 |

마음이 상하면 문 상태는 뒤로 돌아갈 수 있다. 정해진 횟수가 되었다고 열리지는 않는다.

## 실행

Node.js 22 이상이 필요하다.

```bash
npm install
```

```bash
npm start
```

브라우저에서 `http://localhost:3000`을 연다.

### NPC 반응 엔진

- **AI 모드**: `.env`에 `ANTHROPIC_API_KEY`를 넣고 서버를 실행하면 NPC 대사, 감정 변화, 문 개방 판정, 결과 화면을 Claude가 생성한다. API 키는 서버(`server.js`)에서만 쓰이고 프론트엔드에 노출되지 않는다.
- **로컬 모드**: 키가 없거나 서버 없이 `public/` 폴더만 정적으로 배포한 경우(GitHub Pages 등) 내장 엔진이 반응한다. 사과의 진정성(책임 인정, 공감, 구체성, 약속)과 감점 요소(변명, 탓하기, 재촉, 같은 행동 반복)를 분석해 상처·신뢰 수치를 바꾼다.

AI 응답에 실패하면 해당 턴은 로컬 엔진으로 자동 대체된다. 설정에서 엔진을 자동 / AI / 로컬 중에 고를 수 있다.

```bash
cp .env.example .env
```

| 변수 | 설명 |
| --- | --- |
| `ANTHROPIC_API_KEY` | Anthropic API 키 |
| `NPC_MODEL` | 사용할 모델 (기본 `claude-opus-5-5`) |
| `PORT` | 서버 포트 (기본 3000) |

## 구조

```
server.js          정적 파일 서빙 + /api/health, /api/turn, /api/result
public/index.html  화면 구조 (설정, 게임, 편지, 기록, 설정, 결과)
public/styles.css  디자인
public/js/app.js   UI, 턴 진행, 애니메이션
public/js/engine.js 로컬 NPC 엔진 (감정 수치, 문 판정, 결과 생성)
public/js/data.js  성격별 대사, 문 너머 묘사, 속마음, 엔딩 문구
```

## 사용한 리소스

- 폰트: [Pretendard](https://github.com/orioncactus/pretendard) © Kil Hyung-jin, SIL Open Font License 1.1
- 아이콘: [Lucide](https://lucide.dev) 아이콘을 기반으로 한 인라인 SVG, ISC License
