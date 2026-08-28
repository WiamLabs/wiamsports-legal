# Scores page — polish and upgrade plan

This file is the build spec for **`/scores/` only**. Do not use it to redesign News, Table, Odds, Follow, Engines, login, or legal pages. Those stay as they are unless a Scores screen needs a shared crest or score from the same warehouse.

Palette stays the current site tokens (`--bg`, `--green`, `--gold`, `--panel`, `--line`, `--text`, `--muted`, `--label`). Scores should feel like a newsroom scoreboard, not a betting slip.

---

## Why this page matters

People will open Scores more than any other board. It is the sitelink we want Google to keep, next to the homepage. If LIVE is red but the score is missing, or a crest is a letter in a circle while the next row has the real badge, they will not come back.

The bugs in this same ship (1-minute live poll, one `/matches` live request, do not wipe scores/crests with empty API rows, show `0` when a live match has not scored, crest fallback, name-dupe merge) are the floor. This plan is the product above that floor.

---

## What “done” looks like

A reader can:

1. Open `/scores/` and immediately see **who is playing now**, with **red LIVE**, **the current score**, and **club crests**.
2. Tap a league and see **today + upcoming**, grouped by Ghana date, with LIVE / FT / kick-off time.
3. Watch a live match **move when a goal goes in**, without waiting 20 minutes and without a full-page flash that loses their place.
4. Never see two rows for the same fixture (Palace vs Palace FC).
5. Never see a blank score on a live or finished match. Upcoming matches show kick-off only — no fake 0–0.

---

## Information architecture

### `/scores/` — hub (today this is only a league list)

Build a hub, not a menu.

| Block | Purpose |
|---|---|
| **Live now** | Horizontal or stacked cards for every in-play match across stored leagues. Red LIVE, minute if we have it, score, both crests. Empty state: one quiet line, not a fake match. |
| **Today** | Kick-offs still to play today (Africa/Accra), grouped by league. Time on the right. |
| **Leagues** | Current league list, but as a board: crest or competition mark + name + a one-line status (“2 live”, “Tonight 19:00”, or nothing). |

Do not invent a “featured match” if the warehouse has none.

### `/scores/{league}/` — competition board

Keep the current URL. Upgrade the row, not the route.

- Date groups stay (Ghana calendar).
- Each row: home crest + name + score, away crest + name + score, state on the right.
- LIVE: red, scores always visible (0–0 until a goal).
- FT: scores stay, label FT.
- Upcoming: kick-off time, **no scores**.
- Optional later: minute, HT score. Not in the first polish pass unless the API already stores `minute`.

---

## Visual system (first polish pass)

Treat the match row as the unit. Same width as the news shell.

**Live row**

- Keep the dark panel, but give LIVE its own weight: red label, scores in a heavier weight than the names.
- Crests 24px, contained, never stretched. Letter fallback only when the image 404s or the URL is missing.
- Do not put odds, confidence, or engine names on this page.

**Upcoming row**

- Same skeleton so the list does not jump when a match goes live.
- Time in Ghana (`Africa/Accra`), 24-hour, no timezone lecture.

**Hub league list**

- Stop looking like eight identical green bars. Use the same panel as match rows: name left, live count or next kick-off right.
- Competition mark if we already have one; do not scrape random Wikipedia badges.

**Motion**

- When a score changes, update the number in place. Do not rebuild the whole hub in a way that scrolls the reader to the top.
- 12–20 second refresh while any LIVE row is on screen. Stop the timer when they leave the page.

---

## Data rules (do not break these)

Scores are warehouse truth. The page never calls football-data.org itself.

| Field | Rule |
|---|---|
| `home_score` / `away_score` | Show for Live and FT. If null on a live/FT row, paint `0`. Never hide the cell. |
| Upcoming | No score cells. |
| Crests | Prefer stored URL. Share a crest across duplicate name spellings (`Manchester City` / `Manchester City FC`). Image `onerror` → letter fallback. Never wipe a stored crest with `null` on upsert. |
| Duplicates | One row per home+away+kick-off (normalized names). Keep the row that has crests **and** scores. |
| Status | `Live` only when the match is in play (or kick-off has passed and it is not finished/postponed). Do not leave a finished match stuck on LIVE. |
| Freshness | Scheduler live poll every 1 minute, **one** global live request. Client refresh while LIVE is visible. |

`/v1/public/scores/live` already exists — the hub must use it. League pages keep `/v1/public/scores/{slug}`.

---

## Build order

Do this in three ships. Do not start ship 3 until ship 1 is true on a real Saturday.

### Ship 1 — trust (bugs + hub live strip)

Already in motion from the floor fixes. Remaining on the page:

1. Hub `/scores/` grows a **Live now** block above the league list (`/v1/public/scores/live`).
2. League list shows a live count when that league has an in-play match.
3. Confirm a goal appears on `/scores/{league}/` within about a minute, with crests, no duplicate row.

### Ship 2 — board craft

1. Match row spacing, type, LIVE/FT/time alignment on phone and desktop.
2. Crest size and fallback that does not look like a bug.
3. Date headers as a real match-day label, not raw CSS leftovers.
4. Empty states in plain language: “No live matches.” / “No matches in this window.”
5. Keep cache-bust on `board.js` when the row markup changes.

### Ship 3 — destination

Only after 1 and 2:

- Optional match minute.
- Optional “jump to live” on a long league page.
- Optional follow-club highlight on a row if they already follow that club (reuse Follow, do not redesign Follow).
- Do **not** add predictions, VIP, or engine copy here.

---

## Out of scope

- Changing Google sitelinks (homepage + Scores stay indexed; this plan does not touch About/Legal).
- Table, Odds, or Follow layout.
- A live blog. That belongs under News `/news/football/live/`.
- Invented scores, invented crests, or a third-party widget.

---

## QA checklist (every Scores ship)

- [ ] Open `/scores/` on a match day: Live now shows real scores, not only the word LIVE.
- [ ] Open a league with a live match: both crests, both numbers, red LIVE.
- [ ] Upcoming match in that league: time, no 0–0.
- [ ] Finished match: FT and the result.
- [ ] No doubled fixture from `Crystal Palace` vs `Crystal Palace FC`.
- [ ] Phone width: names do not crush the score; LIVE stays readable.
- [ ] Desktop: same content, not a different product.
- [ ] Leave the page: the refresh timer stops.
- [ ] No Pulse, Tide, warehouse, or confidence on the page.
