# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the game

No build step required. Open `index.html` directly in a browser (double-click or `open index.html`). The `korea-rpg/` subdirectory is a legacy copy of an earlier standalone version with its own `.git`.

For the AI chatbot to work, copy `js/config.example.js` → `js/config.js` and paste a Claude API key. `config.js` is gitignored and must never be committed.

## Architecture

This is a pure HTML/CSS/Vanilla-JS game — no framework, no bundler, no npm.

### Page flow
- `index.html` — main menu; reads mission completion from `localStorage`, applies cleared styles, and shows progress. Navigates to `game.html?mission=<id>` on card click. Body has `class="menu-page"` which triggers the gradient background in `style.css`.
- `game.html` — universal game screen used for all missions. Reads the `?mission=` URL param and calls `startMission(id)`.

### Script loading order in game.html
All nine mission files load first (they define globals like `convstoreMission`), then `game.js` (which reads those globals into `allMissions`), then `config.js`, then `chatbot.js`. Order matters — do not reorder these `<script>` tags.

### Game engine (`js/game.js`)
- `allMissions` — registry mapping mission ID strings to mission objects (defined in each `missions/*.js` file).
- `startMission(id)` — entry point; sets `currentMission`, populates `#hud-title` with `currentMission.title`, calls `chatbotSetContext`, kicks off `renderStep()`.
- `renderStep()` — reads `currentMission.steps[currentStepKey]`, runs the typewriter animation, then renders choice buttons or waits for Enter.
- `handleChoice(choice)` — advances `currentStepKey` or triggers `showMissionComplete()` when `next === 'END'`.
- Mission completion is saved as `localStorage.setItem('cleared_<id>', 'true')`.

### Mission data format (`missions/*.js`)
Each file exports one `const <name>Mission = { id, title, background, vocabulary, helperContext, steps, completeTitle, completeMessage }`. Steps are a flat object keyed by step name; each step has `{ text, choices[], background? }`. A choice with `next: 'END'` ends the mission.

- `title` — displayed in HUD (`#hud-title`). Keep under 30 chars or it clips on mobile.
- `helperContext` — plain-text string passed to `chatbotSetContext`; becomes part of the Claude system prompt. Describe the scenario so the chatbot can give relevant hints.
- `completeTitle` / `completeMessage` — shown in the mission-complete popup.

The optional `vocabulary` array — `[{ kr, en, rom? }, ...]` — triggers a pre-mission vocab screen before dialog begins. If omitted or empty, the mission starts immediately.

**Vocab tooltips** — after the typewriter finishes, `applyVocabTooltips()` scans the rendered text and wraps every Korean word from `vocabulary` in `<span class="word-tip" data-en="…">`. Clicking the span shows a translation bubble. The scanner uses longest-match-first and a Hangul negative-lookbehind to avoid partial matches (e.g. `원` won't match inside `안내원`). No special markup needed in the step text — just ensure the Korean word appears verbatim in both the step text and the `vocabulary` array.

### CSS architecture (`style.css`)
Two distinct visual themes live in one file: Apple-minimal (menu) and dark visual-novel (game). The `/* MENU SCREEN */` and `/* GAME SCREEN */` comment blocks mark the boundary.

Key layout elements in game.html:
- `#mission-hud` — fixed top bar (44px); shows mission title; `z-index: 40`.
- `#back-btn` — fixed at `top: 52px` so it sits below the HUD; `z-index: 50`.
- `#dialogue` — fixed bottom panel; holds speaker, narration, text, choices.
- `#chatbot-toggle` / `#chatbot-panel` — fixed bottom-right; `z-index: 100`.

### AI chatbot (`js/chatbot.js`)
Calls the Claude API directly from the browser using `anthropic-dangerous-direct-browser-access: true`. Uses `claude-haiku-4-5-20251001`. The system prompt is rebuilt per-message from `missionContext` (set by `chatbotSetContext`). Chat history is maintained per mission session in `chatHistory[]`.

## Adding a new mission

1. Create `missions/<id>.js` following the pattern in `missions/convstore.js`.
2. Add the background image to `images/`.
3. Register the mission in `js/game.js` → `allMissions` object.
4. Add a `<script src="missions/<id>.js">` tag in `game.html` **before** the `game.js` script tag.
5. Add a mission card in `index.html` with:
   - `id="card-<id>"` on the `.mission-card` div (required for the cleared green style)
   - `onclick="goMission('<id>')"`
   - `id="status-<id>"` on the status `<span>` inside the card
6. Add `'<id>'` to the `missions` array inside `loadStatus()` in `index.html`.

## Scene-based missions (`sceneFn`)

Five missions (subway, bank, telecom, clothing, realestate) use a **scene-based** pattern instead of the `steps` object. Their mission objects have a `sceneFn()` method instead of `steps`.

### How scene-based missions work

`game.js` exposes these globals for use inside `sceneFn`:

| Helper | Purpose |
|---|---|
| `typeText(text, cb)` | Typewriter effect; click to skip |
| `addChoice(text, val)` | Add a choice button; fires `waitForChoice` callback with `val` |
| `waitForChoice(cb)` | Next button click calls `cb(val)` |
| `waitEnterThen(cb)` | Show `[Enter] 계속` hint; Enter calls `cb()` |
| `clearChoices()` | Clear buttons + hint |
| `changeBackground(img)` | Set `#background` image URL |
| `showMissionComplete()` | Show completion popup + save progress |

Inside `sceneFn`, define a local `scenes` object and a `go(name)` helper:
```js
sceneFn() {
  const scenes = {};
  const go = name => { clearChoices(); scenes[name](); };
  const enterGo = name => waitEnterThen(() => go(name));

  scenes.start = () => {
    changeBackground('images/foo.png');
    typeText('Hello!', () => enterGo('next'));
  };
  scenes.next = () => { ... };

  go('start');
}
```

State variables (e.g. `let hasARC = true`) live in the closure and persist across scenes.

### Adding a new scene-based mission

Same checklist as a step-based mission (see "Adding a new mission" above), but:
- The mission object needs `sceneFn()` instead of `steps`.
- Reference images as `'images/<filename>'`.
- Do **not** call `localStorage.setItem(...)` or `window.location.href` inside the mission — `game.js` handles both.

## Known issues and pitfalls

- **Nested `.git` in `korea-rpg/`** — `korea-rpg/` contains its own `.git` directory (it was originally a standalone repo). The outer repo treats it as a plain directory. Do not run git commands from inside `korea-rpg/` expecting them to affect the outer repo.
- **Global `button` selector** — `style.css` sets `width: 100%` on all `button` elements. Any new button added outside `#choices` needs an explicit `width: auto` override (e.g. `#back-btn`, `#popup-return-btn`, `#chatbot-send`).
- **`chatHistory` cap** — `chatbot.js` trims history to the last 20 messages (`MAX_HISTORY`). Adjust if needed, but keep it bounded to avoid token limit errors.
- **Cleared state requires both IDs** — `loadStatus()` in `index.html` sets `.cleared` on both `#status-<id>` (the badge) and `#card-<id>` (the card div). If `id="card-<id>"` is missing on a card, the green cleared style won't appear but the badge will still work.
- **Typewriter uses `textContent`, not `innerText`** — `innerText` normalizes whitespace on read, which collapses spaces between words when using `+=`. All typewriter code must use `textContent`.
- **Background images are landscape-only** — all `images/*.png` are landscape (~2400×1700). The `#background` CSS uses `background-position: top center` so characters at the top of the scene are not cropped on widescreen fullscreen. Portrait phones still show a horizontal center-slice; the only proper fix is to provide portrait-oriented images or restrict the game to landscape orientation.
