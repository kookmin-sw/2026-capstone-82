# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
이 파일은 Claude Code가 이 저장소에서 작업할 때 참고하는 안내 문서입니다.

---

## Running the game / 게임 실행

No build step required. Open `index.html` directly in a browser (`open index.html`).
빌드 과정 없음. 브라우저에서 `index.html` 을 직접 열면 됩니다 (`open index.html`).

The `Hospital_Pharmacy_Garbage/` folder contains legacy standalone HTML prototypes — they are not part of the running game.
`Hospital_Pharmacy_Garbage/` 폴더는 레거시 프로토타입 모음으로, 실제 게임과 무관합니다.

Copy `js/config.example.js` → `js/config.js` and fill in both keys:
`js/config.example.js` 를 `js/config.js` 로 복사한 뒤 두 키를 입력하세요:
- `CLAUDE_API_KEY` — from https://console.anthropic.com (required for AI chatbot / AI 챗봇에 필요)
- `FIREBASE.*` — from Firebase Console (required for cross-device profile persistence / 기기 간 프로필 동기화에 필요)

`config.js` is gitignored and must never be committed.
`config.js` 는 gitignore 처리되어 있으며 절대 커밋하면 안 됩니다.

---

## Architecture / 아키텍처

Pure HTML/CSS/Vanilla-JS — no framework, no bundler, no npm.
순수 HTML/CSS/Vanilla-JS — 프레임워크, 번들러, npm 없음.

### Page flow / 페이지 흐름

- `index.html` — main menu. Shows mode toggle (단기/장기), progress bar, and mission cards. Navigates to `game.html?mission=<id>` on card click.
  메인 메뉴. 방문 모드 탭(단기/장기), 진행도 바, 미션 카드를 표시합니다. 카드 클릭 시 `game.html?mission=<id>` 로 이동.
- `game.html` — universal game screen for all missions. Reads the `?mission=` URL param and calls `startMission(id)`.
  모든 미션의 공통 게임 화면. URL 파라미터 `?mission=` 을 읽어 `startMission(id)` 를 호출합니다.

### Script loading order in `game.html` / `game.html` 스크립트 로딩 순서

All 12 mission files load first (each defines a global like `hospitalMission`), then `js/game.js` (which reads those globals into `allMissions`), then `js/config.js`, then `js/chatbot.js`. **Order matters — do not reorder these `<script>` tags.**
미션 파일 12개가 먼저 로드되고(`hospitalMission` 등 전역 변수 정의), 이후 `js/game.js`(`allMissions` 에 등록), `js/config.js`, `js/chatbot.js` 순서로 로드됩니다. **순서가 중요합니다 — `<script>` 태그 순서를 바꾸지 마세요.**

### Game engine (`js/game.js`) / 게임 엔진

- `allMissions` — registry mapping mission ID strings to mission objects. / 미션 ID → 미션 객체 매핑 레지스트리.
- `startMission(id)` — entry point; sets `currentMission`, populates `#hud-title`, calls `chatbotSetContext`, then shows vocab screen (if any) before calling `beginMission()`. / 진입점. `currentMission` 설정 → HUD 제목 채우기 → `chatbotSetContext` 호출 → 단어 화면(있을 경우) → `beginMission()` 호출.
- `beginMission()` — calls `currentMission.sceneFn()` for scene-based missions, or `renderStep()` for step-based missions. / 씬 방식이면 `sceneFn()`, 스텝 방식이면 `renderStep()` 호출.
- `renderStep()` / `handleChoice()` — drives step-based missions via `currentMission.steps`. / `currentMission.steps` 를 통해 스텝 방식 미션을 진행합니다.
- `showMissionComplete()` — saves `localStorage.setItem('cleared_<id>', 'true')` and shows the popup. / 완료 상태를 localStorage 에 저장하고 팝업을 표시합니다.

### Mission formats (`missions/*.js`) / 미션 형식

Every mission file exports one `const <name>Mission = { id, title, background, vocabulary?, helperContext, completeTitle, completeMessage, sceneFn() | steps }`.
모든 미션 파일은 위 구조의 객체 하나를 내보냅니다.

**Step-based** (`steps` object, used by exchange, lostfound, convstore, immigration):
**스텝 방식** (`steps` 객체, exchange·lostfound·convstore·immigration 사용):
```js
steps: {
  start: { text: '...', choices: [{ label: '...', next: 'nextKey' }] },
  nextKey: { text: '...', choices: [{ label: '...', next: 'END' }] }
}
```
A choice with `next: 'END'` triggers `showMissionComplete()`.
`next: 'END'` 인 선택지를 고르면 `showMissionComplete()` 가 호출됩니다.

**Scene-based** (`sceneFn()`, used by subway, bank, telecom, clothing, realestate, garbage, hospital, pharmacy):
**씬 방식** (`sceneFn()`, subway·bank·telecom·clothing·realestate·garbage·hospital·pharmacy 사용):
```js
sceneFn() {
  const scenes = {};
  const go      = name => { clearChoices(); scenes[name](); };
  const enterGo = name => waitEnterThen(() => go(name));
  const bg      = img  => changeBackground('images/' + img);

  let stateVar = false;  // closure state persists across scenes / 씬 전환 후에도 상태 유지

  scenes.start = () => {
    bg('foo.png');
    typeText('Hello!', () => {
      addChoice('Option A', 'a');
      addChoice('Option B', 'b');
      waitForChoice(c => {
        if (c === 'a') go('sceneA');
        else go('sceneB');
      });
    });
  };

  go('start');
}
```

`game.js` globals available inside `sceneFn` / `sceneFn` 내부에서 쓸 수 있는 전역 헬퍼:

| Helper | Purpose (EN) | 설명 (KR) |
|---|---|---|
| `typeText(text, cb)` | Typewriter effect; click anywhere on text to skip | 타자기 효과; 텍스트 클릭 시 스킵 |
| `addChoice(text, val)` | Add a choice button; `val` is passed to `waitForChoice` callback | 선택지 버튼 추가; `val` 은 콜백에 전달됨 |
| `waitForChoice(cb)` | Sets callback fired when any choice button is clicked | 선택지 클릭 시 콜백 실행 |
| `waitEnterThen(cb)` | Show `[Enter] 계속` hint; Enter key calls `cb()` | `[Enter] 계속` 힌트 표시 후 Enter 시 콜백 |
| `clearChoices()` | Clear choice buttons and hint | 선택지 버튼 및 힌트 제거 |
| `changeBackground(img)` | Set `#background` CSS background-image URL | 배경 이미지 변경 |
| `showMissionComplete()` | Show completion popup + save cleared state | 완료 팝업 표시 및 완료 상태 저장 |

**Critical rules for `sceneFn` missions / `sceneFn` 미션 필수 규칙:**
- Always use `textContent` not `innerText` inside typewriter (game.js already does this). / 타자기 내부에서 `innerText` 대신 `textContent` 사용 (game.js 에서 이미 처리).
- Do NOT call `localStorage.setItem(...)` or `window.location.href` — `game.js` handles both. / `localStorage.setItem(...)` 나 `window.location.href` 를 직접 호출하지 마세요 — `game.js` 가 처리합니다.
- Image paths must be `'images/<filename>'` (not relative to the mission file). / 이미지 경로는 반드시 `'images/<filename>'` 형식 (미션 파일 상대경로 아님).

### Vocabulary system / 단어 시스템

The optional `vocabulary` array `[{ kr, en, rom? }, ...]` triggers a pre-mission flashcard screen. After the typewriter finishes each step, `applyVocabTooltips()` wraps matching Korean words in `<span class="word-tip" data-en="…">` — clicking shows a translation bubble. The scanner uses longest-match-first and a Hangul negative-lookbehind to avoid partial matches.
선택적 `vocabulary` 배열 `[{ kr, en, rom? }, ...]` 이 있으면 미션 전 플래시카드 화면이 표시됩니다. 타자기 완료 후 `applyVocabTooltips()` 가 본문의 한국어 단어를 `<span class="word-tip" data-en="…">` 으로 감싸고, 클릭 시 번역 말풍선이 나타납니다. 스캐너는 최장일치(longest-match-first)와 한글 음절 경계 확인(Hangul negative-lookbehind)을 사용합니다.

### CSS architecture (`style.css`) / CSS 구조

Two themes in one file: Apple-minimal menu (`/* MENU SCREEN */` section) and dark visual-novel game (`/* GAME SCREEN */` section).
파일 하나에 두 테마: Apple 미니멀 메뉴(`/* MENU SCREEN */` 섹션)와 다크 비주얼노벨 게임(`/* GAME SCREEN */` 섹션).

**Global `button` selector sets `width: 100%`.** Any button outside `#choices` (e.g. `#back-btn`, `#profile-btn`, `#chatbot-send`) must explicitly set `width: auto`.
**전역 `button` 선택자가 `width: 100%` 를 설정합니다.** `#choices` 외부의 버튼(`#back-btn`, `#profile-btn`, `#chatbot-send` 등)은 반드시 `width: auto` 를 명시해야 합니다.

Key z-index layers / 주요 z-index 레이어: `#mission-hud` (40) → `#back-btn` (50) → `#chatbot-panel` (100) → `#profile-overlay` (500) → `#missionComplete` (999).

### AI chatbot (`js/chatbot.js`) / AI 챗봇

Calls the Claude API directly from the browser (`anthropic-dangerous-direct-browser-access: true`). Uses `claude-haiku-4-5-20251001`. `chatbotSetContext(context, title)` rebuilds the system prompt per mission. `chatHistory[]` is capped at 20 messages (`MAX_HISTORY`).
브라우저에서 Claude API 를 직접 호출합니다 (`anthropic-dangerous-direct-browser-access: true`). 모델: `claude-haiku-4-5-20251001`. `chatbotSetContext(context, title)` 는 미션마다 시스템 프롬프트를 재구성합니다. `chatHistory[]` 는 최대 20개(`MAX_HISTORY`)로 제한됩니다.

### Firebase / Firestore database (`js/db.js`) / 데이터베이스

Firebase CDN (compat v9.22.1) is loaded **only in `index.html`** — not in `game.html`. `js/db.js` is loaded after the CDN scripts. `game.html` does not use Firebase.
Firebase CDN(compat v9.22.1)은 **`index.html` 에만** 로드됩니다 — `game.html` 에는 없습니다. `js/db.js` 는 CDN 이후에 로드됩니다.

`js/db.js` exposes a `DB` singleton with these async methods:
`js/db.js` 는 다음 비동기 메서드를 가진 `DB` 싱글턴을 제공합니다:
- `DB.getProfile(email)` → Firestore document or `null` / Firestore 문서 또는 `null`
- `DB.saveProfile(profile)` → upserts with `merge: true` (never overwrites fields not in profile) / `merge: true` 로 업서트 (없는 필드 덮어쓰지 않음)
- `DB.appendCityHistory(email, cityEntry)` → appends `{city, changedAt}` to `cityHistory[]` via `FieldValue.arrayUnion` — use when city changes on profile update / `FieldValue.arrayUnion` 으로 cityHistory 배열에 누적 추가 — 도시 변경 시 사용
- `DB.logEvent(event)` → writes to `events` collection / `events` 컬렉션에 이벤트 기록
- `DB.getEvents(limitCount)` → reads `events` descending by timestamp / 타임스탬프 내림차순으로 이벤트 조회 (dashboard 전용)

**Firestore schema / Firestore 스키마:**
- Collection: `user_profiles`
- Document ID: `btoa(email.toLowerCase().trim())` with `+` → `-`, `/` → `_`, `=` stripped (URL-safe base64)
- Document fields: all profile fields (`email`, `nationality`, `age`, `location`, `inKorea`, `plannedArrival`, `purpose`, `cityKorea`, `visitCount`, `topik`, `registeredAt`, `updatedAt`) plus `clearedMissions` (array) and `cityHistory` (array of `{city, changedAt}` objects) / 모든 프로필 필드 + `clearedMissions` (완료 미션 ID 배열) + `cityHistory` (도시 이력 배열)

**Login flow / 로그인 흐름** (`loginWithEmail()` in `index.html` inline script):
1. User enters email → `DB.getProfile(email)` is called. / 사용자가 이메일 입력 → `DB.getProfile(email)` 호출.
2. If found, `profile.clearedMissions` is replayed into `localStorage` (`cleared_<id> = 'true'`), then `saveUserProfile()` writes the profile locally. / 찾으면 `clearedMissions` 를 localStorage 에 복원하고 프로필을 로컬에 저장.
3. If not found, error div `#err-not-found` is shown. / 없으면 `#err-not-found` 오류 표시.

**`clearedMissions` sync / 동기화:** when a profile is saved (`DB.saveProfile`), the current `localStorage` cleared keys are collected and written into the `clearedMissions` array so the next device can restore them on login.
프로필 저장 시 localStorage 의 완료 키를 수집해 `clearedMissions` 배열에 기록합니다 — 다른 기기 로그인 시 복원됩니다.

---

## Analytics (`js/analytics.js`) / 분석

`var Analytics` (not `const` — must create `window.Analytics` property for cross-script access). Tracks 16 event types to the Firestore `events` collection.
`var Analytics` (`const` 금지 — 크로스 스크립트 접근을 위해 `window.Analytics` 속성이 반드시 생성되어야 함). Firestore `events` 컬렉션에 16가지 이벤트 유형을 기록합니다.

Event types: `session_start`, `mode_change`, `user_registered`, `user_logged_in`, `mission_start`, `mission_retry`, `mission_complete`, `mission_abandon`, `choice_made`, `scene_advance`, `typewriter_skip`, `vocab_tap`, `vocab_card_reveal`, `chatbot_open`, `chatbot_query`, `chatbot_error`.

`mission_retry` fires in `startMission()` when `localStorage.getItem('cleared_<id>')` is already set — i.e. the user replays a finished mission. It fires *before* `mission_start`.
`mission_retry` 는 `startMission()` 에서 `cleared_<id>` 가 이미 localStorage 에 존재할 때 발생합니다 — 즉 완료된 미션을 다시 시작할 때. `mission_start` 보다 먼저 발생합니다.

All hooks in `game.js` and `chatbot.js` check `if (window.Analytics)` before calling. This guard is required because `game.html` loads Firebase and Analytics asynchronously.
`game.js` 와 `chatbot.js` 의 모든 훅은 호출 전 `if (window.Analytics)` 를 확인합니다. `game.html` 이 Firebase와 Analytics를 비동기로 로드하기 때문입니다.

---

## GitHub Actions deployment / GitHub Actions 배포

`.github/workflows/deploy.yml` deploys to GitHub Pages on every push to `master`. The `CLAUDE_API_KEY` secret is injected at deploy time by writing `js/config.js` — it is never stored in the repository.
`.github/workflows/deploy.yml` 이 `master` 브랜치 푸시마다 GitHub Pages 에 배포합니다. `CLAUDE_API_KEY` 시크릿은 배포 시 `js/config.js` 에 주입되며, 저장소에는 저장되지 않습니다.

`js/config.public.js` is the committed public config (Firebase keys only; `CLAUDE_API_KEY: null`). `js/config.js` overrides it locally and is gitignored.
`js/config.public.js` 는 커밋된 공개 설정 파일입니다(Firebase 키만, `CLAUDE_API_KEY: null`). 로컬에서는 `js/config.js` 가 이를 덮어쓰며 gitignore 처리되어 있습니다.

---

## Current missions (12 total) / 현재 미션 목록 (12개)

| ID | 제목 (KR) | Mode / 모드 | Format / 형식 | Key images / 주요 이미지 |
|---|---|---|---|---|
| `exchange` | 공항 환전 | Both / 둘 다 | steps | `MoneyExchange.png`, `Airport_cv.png` |
| `lostfound` | 공항 분실물 센터 | Both / 둘 다 | steps | `LostAndFound.png`, `Information_desk.png` |
| `convstore` | 편의점 | Both / 둘 다 | steps | `ConvStoreInside.png` |
| `subway` | 지하철 타기 | Both / 둘 다 | sceneFn | `subway_*.png` |
| `telecom` | 통신사 유심 개통 | Long only / 장기만 | sceneFn | `telecom_*.png` |
| `immigration` | 출입국관리사무소 | Long only / 장기만 | steps | `Immigration_*.png` |
| `bank` | 은행 통장 개설 | Long only / 장기만 | sceneFn | `bank_*.png` |
| `realestate` | 부동산 — 집 구하기 | Long only / 장기만 | sceneFn | `real_estate*.png`, `room_visit_*.png` |
| `garbage` | 쓰레기 봉투 구매 | Long only / 장기만 | sceneFn | `ConvStoreInside.png` |
| `hospital` | 병원 진료 받기 | Both / 둘 다 | sceneFn | `hospital_*.png` |
| `pharmacy` | 약국에서 약 구매 | Both / 둘 다 | sceneFn | `pharmacy*.png` |
| `clothing` | 옷 가게 환불/교환 | Both / 둘 다 | sceneFn | `clothing_*.png` |

---

## Visit mode system (단기 / 장기) / 방문 모드 시스템

`index.html` shows two mode tabs. The active mode is persisted in `localStorage["visit_mode"]` (`"short"` or `"long"`). Default is `"long"`.
`index.html` 에 두 모드 탭이 있습니다. 현재 모드는 `localStorage["visit_mode"]`(`"short"` 또는 `"long"`)에 저장됩니다. 기본값은 `"long"`.

`MODE_CONFIG` (inline script in `index.html`) defines the ordered mission list per mode:
`MODE_CONFIG`(`index.html` 인라인 스크립트)가 각 모드의 미션 순서를 정의합니다:

| Mode / 모드 | Count / 개수 | Mission order / 미션 순서 |
|---|---|---|
| `short` 단기 방문 | 7 | exchange → lostfound → convstore → subway → hospital → pharmacy → clothing |
| `long` 장기 거주 | 12 | exchange → lostfound → convstore → subway → telecom → immigration → bank → realestate → garbage → hospital → pharmacy → clothing |

Missions are rendered as **STEP 1, STEP 2, …** badges. A mission is **locked** (`.locked` class, grayed-out, `cursor: not-allowed`) when the preceding step is not yet cleared. Clicking a locked card shows `#locked-toast` for 2.5 s.
미션은 **STEP 1, STEP 2, …** 뱃지로 표시됩니다. 이전 단계가 완료되지 않으면 **잠금** 상태(`.locked` 클래스, 회색, `cursor: not-allowed`)가 됩니다. 잠긴 카드 클릭 시 `#locked-toast` 가 2.5초 동안 표시됩니다.

Key functions / 주요 함수 (`index.html` inline script):
- `setMode(mode)` — persists and rerenders. / 모드 저장 후 재렌더링.
- `renderMissions()` — master render: resets all cards, applies mode filter, step badges, locked/cleared states, updates progress bar. / 전체 재렌더링: 카드 초기화 → 모드 필터 → STEP 뱃지 → 잠금/완료 상태 → 진행도 바 갱신.
- `showLockedMsg(id, prevId)` — fires the toast. / 잠금 토스트 메시지 표시.

Mission cards in the HTML have **no `onclick` attribute** — all handlers are assigned dynamically inside `renderMissions()`.
HTML 의 미션 카드에는 **`onclick` 속성이 없습니다** — 모든 핸들러는 `renderMissions()` 내부에서 동적으로 할당됩니다.

---

## User profile data collection / 사용자 프로필 수집

On first visit, `#profile-overlay` modal appears and collects:
첫 방문 시 `#profile-overlay` 모달이 나타나 다음 정보를 수집합니다:

| Field / 필드 | Input / 입력 | Stored as / 저장 형식 |
|---|---|---|
| email / 이메일 | `#f-email` | string |
| nationality / 국적 | `#f-nationality` (select) | string |
| age / 나이 | `#f-age` (number) | integer |
| location / 거주지 | `#f-location` | string |
| inKorea / 한국 거주 여부 | `input[name="in-korea"]` radio | boolean |
| plannedArrival / 입국 예정일 | `#f-arrival` (date, hidden if inKorea) | ISO date string or null |
| purpose / 방문 목적 | `input[name="purpose"]` radio | `"work"` \| `"study"` \| `"travel"` |
| cityKorea / 한국 내 도시 | `#f-city-single` select (work/study) or checkboxes (travel, max 3) | string (work/study) \| string[] (travel) |
| visitCount / 방문 횟수 | `input[name="visit-count"]` radio | `"first"` \| `"2to3"` \| `"4plus"` |
| topik / 한국어 수준 | `#f-topik` (select) | `"topik0"` … `"topik6"` |

`cityKorea` is **mandatory** and its type depends on `purpose`: a single string for `work`/`study`, an array for `travel`. The `updateCityField()` function in the inline script shows/hides the correct input based on the current `inKorea` + `purpose` combination.
`cityKorea` 는 **필수** 필드이며, `purpose` 에 따라 타입이 다릅니다: `work`/`study` 는 string, `travel` 은 string[]. `updateCityField()` 함수가 현재 inKorea + purpose 조합에 따라 올바른 입력 필드를 표시/숨깁니다.

After saving, `DB.appendCityHistory(email, {city: cityKorea, changedAt: updatedAt})` is called to accumulate city change history without overwriting previous entries.
저장 후 `DB.appendCityHistory` 를 호출해 도시 이력을 누적합니다 — 이전 항목은 덮어쓰지 않습니다.

Stored in `localStorage["user_profile"]` as JSON. Also synced to Firestore via `DB.saveProfile()` (uses `merge: true`).
`localStorage["user_profile"]` 에 JSON 으로 저장됩니다. `DB.saveProfile()` (`merge: true`) 을 통해 Firestore 에도 동기화됩니다.

The modal has two views — **login** (`#login-view`: email-only, restores profile from Firestore) and **register** (`#register-view`: full form). First-time visitors see the register view directly.
모달은 두 화면으로 구성됩니다 — **로그인**(`#login-view`: 이메일만, Firestore 에서 프로필 복원)과 **등록**(`#register-view`: 전체 양식). 첫 방문자는 바로 등록 화면을 봅니다.

---

## Adding a new mission / 새 미션 추가하기

1. Create `missions/<id>.js` — use an existing sceneFn mission (e.g. `missions/hospital.js`) as template. / `missions/<id>.js` 생성 — 기존 sceneFn 미션을 템플릿으로 사용 (예: `missions/hospital.js`).
2. Copy background images to `images/`. / 배경 이미지를 `images/` 에 복사.
3. Register in `js/game.js` → `allMissions` object. / `js/game.js` 의 `allMissions` 객체에 등록.
4. Add `<script src="missions/<id>.js">` in `game.html` **before** the `game.js` script tag. / `game.html` 에서 `game.js` 태그 **앞에** `<script src="missions/<id>.js">` 추가.
5. Add a `.mission-card` div in `index.html` (after `card-clothing`) with `id="card-<id>"` and `id="status-<id>"` on the inner status span. No `onclick` attribute. / `index.html` 에 `.mission-card` div 추가(`card-clothing` 다음), `id="card-<id>"` 및 내부 status span 에 `id="status-<id>"`. `onclick` 속성 없음.
6. Add `'<id>'` to `ALL_MISSIONS` array in the inline script of `index.html`. / `index.html` 인라인 스크립트의 `ALL_MISSIONS` 배열에 `'<id>'` 추가.
7. Add `'<id>'` to the appropriate mission list(s) in `MODE_CONFIG.short.missions` and/or `MODE_CONFIG.long.missions`. / `MODE_CONFIG.short.missions` 및/또는 `MODE_CONFIG.long.missions` 에 `'<id>'` 추가.
8. Add `'<id>': '미션 이름'` to the `MISSION_NAMES` object. / `MISSION_NAMES` 객체에 `'<id>': '미션 이름'` 추가.

---

## Known issues and pitfalls / 알려진 문제 및 주의사항

- **Nested `.git` in `korea-rpg/`** — legacy directory; do not run git commands inside it expecting them to affect the outer repo. / `korea-rpg/` 안에 중첩 `.git` 있음 — 이 안에서 git 명령을 실행해도 외부 저장소에 반영되지 않습니다.
- **Global `button` width** — `style.css` sets `width: 100%` on all buttons. New buttons outside `#choices` need `width: auto`. / `style.css` 가 모든 버튼에 `width: 100%` 설정. `#choices` 외부의 새 버튼은 `width: auto` 필요.
- **`chatHistory` cap** — `MAX_HISTORY = 20` in `chatbot.js`. Keep bounded. / `chatbot.js` 의 `MAX_HISTORY = 20`. 이 한도를 유지하세요.
- **Typewriter must use `textContent`** — `innerText` normalizes whitespace on read, breaking the `+=` typewriter loop. / 타자기는 반드시 `textContent` 사용 — `innerText` 는 읽을 때 공백을 정규화해 `+=` 루프를 망가뜨립니다.
- **Cleared state requires both IDs** — `renderMissions()` toggles `.cleared` on both `#card-<id>` and `#status-<id>`. Missing either ID breaks the visual. / 완료 상태는 두 ID 모두 필요 — `#card-<id>` 와 `#status-<id>` 둘 다 `.cleared` 토글. 하나라도 없으면 시각적 표시가 깨집니다.
- **Background images are landscape-only** — `~2400×1700 px`. `Airport_pv.jpeg` is portrait-format but is unused. / 배경 이미지는 가로형(`~2400×1700px`)만 사용. `Airport_pv.jpeg` 는 세로형이지만 어느 미션에서도 사용하지 않습니다.
- **`const Analytics` vs `var Analytics`** — Must use `var` so `window.Analytics` property is created. `const` at global scope does NOT create a `window.X` property, breaking all cross-script hooks. / `var` 를 사용해야 `window.Analytics` 속성이 생성됩니다. 전역 스코프의 `const` 는 `window.X` 속성을 만들지 않아 모든 크로스 스크립트 훅이 작동하지 않습니다.
- **`Hospital_Pharmacy_Garbage/` is prototype-only** — Do not link to them from `index.html` or `game.html`. / 프로토타입 전용 폴더 — `index.html` 이나 `game.html` 에서 링크하지 마세요.
- **`dashboard.html` inline script scope** — all chart-rendering code must be inside a named function (`renderProfiles`, `renderCrossProfileCharts`, `renderDashboard`). Code placed at the top level of the `<script>` block runs immediately at parse time *before* `loadData()` — any reference to `profiles` or `events` there will throw a `ReferenceError` and silently freeze the page at "데이터 불러오는 중…". / 모든 차트 렌더링 코드는 반드시 함수 안에 있어야 합니다. `<script>` 블록 최상단에 놓인 코드는 `loadData()` 보다 먼저 실행되므로 `profiles`/`events` 참조 시 ReferenceError 가 발생해 페이지가 로딩 화면에서 멈춥니다.
- **`renderDashboard(events, profiles)`** — the second argument `profiles` is required for the TOPIK × retry cross-analysis chart. Pass both from `loadData()`. / 두 번째 인수 `profiles` 는 TOPIK × 재플레이 차트에 필요합니다. `loadData()` 에서 반드시 두 인수를 모두 전달하세요.
- **`cityKorea` type is polymorphic** — `string` for work/study users, `string[]` for travel users. Always handle both when reading in dashboard or any other consumer. / `cityKorea` 는 work/study 사용자는 string, travel 은 string[] 입니다. 읽는 쪽에서 반드시 두 타입을 모두 처리해야 합니다.
