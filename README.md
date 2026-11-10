# CLOSED DOOR

닫힌 문 너머의 NPC와 문 앞에서 사과하는 PC. AI 채팅에서 OOC로 받은 사과 과정을 문 앞 장면으로 재생하고, 문이 열리면 NPC의 속마음과 화해 결과를 보여 주는 사과 시뮬레이터. 서버·API·빌드 없이 HTML/CSS/JavaScript만으로 동작한다.

## 사용법

1. **두 사람**: NPC 이름(문을 닫은 사람), PC 이름(사과하는 사람), 다툰 이유를 적는다. 다툰 이유를 비우면 AI가 서사 속 가장 그럴듯한 갈등을 정한다. 원하면 NPC 사진을 문 뒤에 숨겨 둔다.
2. **사과 과정 OOC**: **OOC 복사** → 롤플 중인 AI 채팅에 붙여넣어 보낸다. 받은 답을 통째로 붙여넣으면 바로 읽고 몇 번의 시도를 읽었는지 보여 준다. **시뮬레이션 시작**.
3. **재생**: PC의 시도(노크·편지·말·선물·기다림·행동)와 NPC의 반응이 한 시도씩 재생된다. 노크하면 문이 흔들리고, 편지는 문틈으로 들어가고, 선물은 문 앞에 놓인다. 마음이 열릴수록 문틈 빛과 벽 색이 따뜻해지고, 손잡이 팻말과 문 상태가 바뀐다.
4. **속마음 OOC**: 문이 열리면 아래 바가 속마음 OOC로 바뀐다. 한 번 더 보내 받은 답을 붙여넣으면 결과 화면에 시도별 속마음, 결정적 계기, 문을 열기 직전의 생각, 하고 싶은 말, 화해 결과(완전한 화해 / 조건부 화해 / 어색한 화해)가 나온다.
5. AI가 문을 열지 않고 끝냈다면 재생 끝에 **이어서 OOC**로 다음 시도를 받아 이어 붙인다.

처음 화면의 **예시로 보기**는 예시 답으로 바로 재생한다(속마음 단계에서 **예시 답 넣기**).

조작: 재생/일시정지(`Space`), 이전/다음(`←` `→`), 처음/끝(`Home` `End`), 진행 막대와 기록 줄을 누르면 그 시도로 이동, 1x/2x 속도.
진행 상황(이미지 제외)은 브라우저에 저장되어 처음 화면의 **이어서 보기**로 돌아온다.

## OOC

- 조각마다 혼자서 완결되고 1,500자 이하다. ① 사과 과정 ② 속마음, 필요하면 + 이어서.
- 마음 수치(상처·신뢰)는 숫자 대신 문자(`0=Z 1=K 2=F 3=R 4=M 5=T 6=H 7=B 8=X 9=V`)로 받아 채팅에 결과가 드러나지 않게 한다. 속마음은 문이 열린 뒤에만 받는다.
- 문은 한 번에 한 단계까지만 바뀌고(잠김→기댐→해제→열림) 마음이 상하면 되돌아간다. 답에서 두 단계 넘게 뛰면 두 단계로 줄여 읽는다.
- 파서는 코드블록, 앞뒤 잡문, `**굵게**`, `T1:` 같은 표기, 빠진 소리 칸을 허용한다.

사과 과정 답 형식:

```text
사건 | 다툰 이유 한 문장
말투 | 반말 또는 존댓말
시작 | 문을 닫으며 NPC가 한 말
T01 | 행동 | PC의 말이나 행동 | NPC 대사(침묵이면 …) | 문 너머 소리나 기척 | 문 상태 | 상처문자 신뢰문자
T02 | …
```

속마음 답 형식:

```text
T01 | 그 시도 때 NPC의 속마음
…
감정 | 최종 감정 상태
계기 | 문을 열기로 결심한 결정적 계기
직전 | 문을 열기 직전의 생각
한마디 | PC에게 하고 싶은 말
화해 | 완전한 화해 · 조건부 화해 · 어색한 화해 | 이유
```

## 실행

`public/` 폴더를 그대로 정적 호스팅(GitHub Pages 등)한다. ES 모듈을 쓰므로 `file://`로는 열리지 않는다.

```bash
cd public && python3 -m http.server 8000
```

## 구조

```
public/index.html    화면 구조 (처음 화면, 문 장면, 재생 바, 기록, 설정, 결과)
public/styles.css    디자인
public/js/app.js     재생, 연출, OOC 바, 저장
public/js/ooc.js     OOC 만들기와 AI 답 파서
public/js/data.js    행동·문 상태 정의, 예시 답
```

## 사용한 리소스

- 폰트: [Pretendard](https://github.com/orioncactus/pretendard) © Kil Hyung-jin, SIL Open Font License 1.1
- 폰트: [Jua](https://fonts.google.com/specimen/Jua) © Woowahan Brothers, SIL Open Font License 1.1 (제목, 버튼)
- 폰트: [Galmuri11](https://github.com/quiple/galmuri) © Lee Minseo, SIL Open Font License 1.1 (HUD 라벨, `public/assets/fonts`에 포함)
- 폰트: [Gowun Dodum](https://fonts.google.com/specimen/Gowun+Dodum) © Yanghee Ryu, SIL Open Font License 1.1 (NPC 대사)
- 아이콘: [Lucide](https://lucide.dev) 아이콘을 기반으로 한 인라인 SVG, ISC License
