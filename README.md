# Al's Cardboard Regatta

Alpha website for a retirement-themed cardboard regatta fake betting board.

This is entertainment-only. No real money, prizes, or gambling mechanics are involved. Visitors pick winners with imaginary "Al Bucks" and can see the public favorites.

## What is included

- Static race board with the six heats from the provided schedule.
- Fake bet slip with name, boat pick, wager amount, and prediction note.
- Optional prop bets for winning time, first to sink, best boat name, and race-day chaos.
- Local browser storage for alpha feedback and demos.
- Public action leaderboard based on local picks.
- Prop Pulse summary for the side-action favorites.
- Simple result console for posting heat winners and times.
- Optional Google Apps Script endpoint for writing fake bets to a Google Sheet.

## Try it locally

Open `index.html` in a browser, or run a tiny local server:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Google Sheet setup

1. Create a Google Sheet.
2. Open **Extensions > Apps Script**.
3. Paste the contents of `google-apps-script.js`.
4. Deploy as a web app. If you update the script later, deploy a new version.
5. Allow access for anyone with the link.
6. Copy the web app URL into `GOOGLE_APPS_SCRIPT_URL` in `app.js`.

The alpha still works without this step; it saves picks in the visitor's browser.

## Feedback questions

- Does the fake betting language feel clearly playful and non-monetary?
- Should people pick just winners, or also exact times and "first to sink"?
- Should the leaderboard be public during the event, or only after submissions close?
- Should result entry stay on the page, or move behind a private admin link?
