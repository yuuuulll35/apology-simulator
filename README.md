# CLOSED DOOR

닫힌 문 너머의 NPC에게 사과하고, 마음을 돌려 문을 열게 만드는 턴제 사과 시뮬레이터 웹게임.

## 플레이

1. 플레이 방식을 고른다.
   - **OOC로 플레이** (기본): 지금 롤플 중인 AI 채팅에 OOC를 보내고, 받은 답으로 NPC가 반응한다. NPC의 성격·말투·관계는 AI가 기존 설정에서 가져온다.
   - **바로 플레이**: AI 없이 내장 NPC가 반응한다. 관계·성격·상처의 깊이·좋아하는 것을 직접 정한다.
2. NPC 이름과 내 이름(PC), 다툰 이유를 적는다. OOC 모드에서 다툰 이유를 비우면 첫 턴에 AI가 서사 속 가장 그럴듯한 갈등을 정해 준다.
3. 원하면 NPC 이미지를 올린다. 이미지는 문이 열리는 순간까지 공개되지 않고, 브라우저 밖으로 나가지 않는다.
4. 매 턴 행동 하나를 고른다: 노크하기 · 편지 넣기 · 말 걸기 · 선물 두기 · 기다리기 · 직접 입력(대사 / 행동).
5. NPC가 문을 열면 결과 화면에서 총 시도 횟수, 최종 감정, 결정적 계기, 내면심리 변화, 문을 열기 직전의 생각, 하고 싶은 말, 화해 결과(완전한 화해 / 조건부 화해 / 어색한 화해)가 공개된다.

단축키: `1`~`5` 행동 선택, `Esc` 창 닫기. 붙여넣기 칸에서는 `Ctrl/⌘ + Enter`로 반영.

### OOC 진행 방식

행동을 고르면 아래쪽 입력창이 OOC 바로 바뀐다.

1. **OOC 복사** → AI 채팅에 붙여넣어 보낸다. 복사가 막힌 환경에서는 눈 아이콘으로 전문을 열어 직접 복사한다.
2. AI 답을 통째로 **붙여넣기 칸**에 붙여넣는다. 붙여넣는 순간 읽어서 턴이 진행된다. 형식이 맞지 않으면 무엇이 빠졌는지 알려 준다.
3. 문이 열리면 **결과 OOC**를 한 번 더 보내 그동안의 속마음을 받는다(**내장 결과로 보기**로 건너뛸 수 있다).

- OOC는 조각마다 혼자서 완결되고 1,500자 이하다. 최근 5턴 요약과 현재 문 상태를 함께 보낸다.
- 마음 수치(상처·신뢰)는 숫자 대신 문자(`0=Z 1=K 2=F 3=R 4=M 5=T 6=H 7=B 8=X 9=V`)로 받아 채팅에 결과가 드러나지 않게 한다.
- 속마음은 턴마다 받지 않고, 결과 OOC에서 한꺼번에 받는다.
- 진행 상황은 브라우저에 저장되어, 채팅 탭에 다녀오다 페이지가 새로 열려도 처음 화면의 **이어서 하기**로 돌아올 수 있다(이미지는 다시 올려야 한다).

턴 답 형식 (코드블록·앞뒤 잡문·`**굵게**`·`:` 구분자도 읽는다):

```text
대사 | NPC가 문 너머에서 하는 말 (침묵이면 …)
소리 | 문 너머에서 들리는 소리나 기척
문 | 잠김 · 기댐 · 해제 · 열림 중 하나
마음 | 상처문자 신뢰문자
사건 | 다툰 이유 (첫 턴, 다툰 이유를 비웠을 때만)
```

결과 답 형식:

```text
감정 | 최종 감정 상태
계기 | 결정적 계기
변화 | 속마음 (여러 줄)
직전 | 문을 열기 직전의 생각
한마디 | PC에게 하고 싶은 말
화해 | 완전한 화해 · 조건부 화해 · 어색한 화해 | 이유
```

### 문 상태

| 상태 | 의미 |
| --- | --- |
| CLOSED (LOCKED) | 완전히 닫힘 |
| AJAR | 문에 기대어 듣고 있음, 문틈으로 빛이 샘 |
| UNLOCKED | 잠금 해제 |
| OPEN | 문이 열림, 게임 종료 |

마음이 상하면 문 상태는 뒤로 돌아갈 수 있다. 정해진 횟수가 되었다고 열리지는 않는다.

## 실행

서버 없이 `public/` 폴더만 정적 호스팅(GitHub Pages 등)해도 OOC 모드와 바로 플레이가 모두 동작한다. ES 모듈을 쓰므로 `file://`로는 열리지 않는다.

```bash
cd public && python3 -m http.server 8000
```

### (선택) AI 서버 모드

`.env`에 `ANTHROPIC_API_KEY`를 넣고 Node.js 22 이상으로 `server.js`를 실행하면, 설정에 **AI 서버** 모드가 나타나 복사·붙여넣기 없이 바로 반응한다. API 키는 서버에서만 쓰이고 프론트엔드에 노출되지 않는다.

```bash
npm install
```

```bash
npm start
```

| 변수 | 설명 |
| --- | --- |
| `ANTHROPIC_API_KEY` | Anthropic API 키 |
| `NPC_MODEL` | 사용할 모델 (기본 `claude-opus-5-5`) |
| `PORT` | 서버 포트 (기본 3000) |

## 구조

```
server.js          (선택) 정적 파일 서빙 + AI 서버 모드 /api/health, /api/turn, /api/result
public/index.html  화면 구조 (설정, 게임, 편지, 기록, 설정, 결과)
public/styles.css  디자인
public/js/app.js   UI, 턴 진행, 애니메이션
public/js/engine.js 내장 NPC 엔진 (감정 수치, 문 판정, 결과 생성)
public/js/ooc.js   OOC 만들기와 AI 답변 파서
public/js/data.js  성격별 대사, 문 너머 묘사, 속마음, 엔딩 문구
```

## 사용한 리소스

- 폰트: [Pretendard](https://github.com/orioncactus/pretendard) © Kil Hyung-jin, SIL Open Font License 1.1
- 폰트: [Jua](https://fonts.google.com/specimen/Jua) © Woowahan Brothers, SIL Open Font License 1.1 (제목, 버튼)
- 폰트: [Galmuri11](https://github.com/quiple/galmuri) © Lee Minseo, SIL Open Font License 1.1 (HUD 라벨, `public/assets/fonts`에 포함)
- 폰트: [Gowun Dodum](https://fonts.google.com/specimen/Gowun+Dodum) © Yanghee Ryu, SIL Open Font License 1.1 (NPC 대사)
- 아이콘: [Lucide](https://lucide.dev) 아이콘을 기반으로 한 인라인 SVG, ISC License
