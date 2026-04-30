# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the game

No build step required. Open `korea-rpg/index.html` directly in a browser (double-click or `open korea-rpg/index.html`).

For the AI chatbot to work, copy `js/config.example.js` → `js/config.js` and paste a Claude API key. `config.js` is gitignored and must never be committed.

## Architecture

This is a pure HTML/CSS/Vanilla-JS game — no framework, no bundler, no npm.

### Page flow
- `index.html` — main menu; reads mission completion from `localStorage`, applies cleared styles, and shows progress. Navigates to `game.html?mission=<id>` on card click. Body has `class="menu-page"` which triggers the gradient background in `style.css`.
- `game.html` — universal game screen used for all missions. Reads the `?mission=` URL param and calls `startMission(id)`.

### Script loading order in game.html
All four mission files load first (they define globals like `convstoreMission`), then `game.js` (which reads those globals into `allMissions`), then `config.js`, then `chatbot.js`. Order matters — do not reorder these `<script>` tags.

### Game engine (`js/game.js`)
- `allMissions` — registry mapping mission ID strings to mission objects (defined in each `missions/*.js` file).
- `startMission(id)` — entry point; sets `currentMission`, populates `#hud-title` with `currentMission.title`, calls `chatbotSetContext`, kicks off `renderStep()`.
- `renderStep()` — reads `currentMission.steps[currentStepKey]`, runs the typewriter animation, then renders choice buttons or waits for Enter.
- `handleChoice(choice)` — advances `currentStepKey` or triggers `showMissionComplete()` when `next === 'END'`.
- Mission completion is saved as `localStorage.setItem('cleared_<id>', 'true')`.

### Mission data format (`missions/*.js`)
Each file exports one `const <name>Mission = { id, title, background, vocabulary, helperContext, steps, completeTitle, completeMessage }`. Steps are a flat object keyed by step name; each step has `{ text, choices[], background? }`. A choice with `next: 'END'` ends the mission.

The `title` field is displayed in the in-game HUD (`#mission-hud` / `#hud-title`). Keep it short (under 30 chars) or it will be clipped on mobile.

The optional `vocabulary` array — `[{ kr, en, rom? }, ...]` — triggers a pre-mission vocab screen before dialog begins. If omitted or empty, the mission starts immediately. Populate it with the same words you mark as `[[...]]` tooltips in step text, plus any other critical terms a newcomer would need.

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

## Known issues and pitfalls

- **Nested `.git` in `korea-rpg/`** — `korea-rpg/` contains its own `.git` directory (it was originally a standalone repo). The outer repo treats it as a plain directory. Do not run git commands from inside `korea-rpg/` expecting them to affect the outer repo.
- **Global `button` selector** — `style.css` sets `width: 100%` on all `button` elements. Any new button added outside `#choices` needs an explicit `width: auto` override (e.g. `#back-btn`, `#popup-return-btn`, `#chatbot-send`).
- **`chatHistory` cap** — `chatbot.js` trims history to the last 20 messages (`MAX_HISTORY`). Adjust if needed, but keep it bounded to avoid token limit errors.
- **Cleared state requires both IDs** — `loadStatus()` in `index.html` sets `.cleared` on both `#status-<id>` (the badge) and `#card-<id>` (the card div). If `id="card-<id>"` is missing on a card, the green cleared style won't appear but the badge will still work.
- **Typewriter uses `textContent`, not `innerText`** — `innerText` normalizes whitespace on read, which collapses spaces between words when using `+=`. All typewriter code must use `textContent`.
