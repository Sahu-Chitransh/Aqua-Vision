# AQUA-VISION

> Clarity in every drop.

AQUA-VISION is a responsive React dashboard for exploring water-monitoring sites, field samples, alerts, and laboratory traceability in one workspace. It was created as a frontend prototype for Smart India Hackathon 2026 by Team Imaginary Coders.

The app ships with a fictional Bhopal water-network dataset so the complete workflow can be demonstrated without an API, credentials, or a backend service.

## What it includes

- Network overview with monitoring metrics, a selectable schematic map, trends, recent samples, and alerts
- Monitoring-site cards with status, location, and routine readings
- Sample registration with validation, collection metadata, and traceable sample details
- Browser-local persistence for newly registered samples and acknowledged alerts
- Alert review that distinguishes acknowledgement from resolution or water-safety status
- Reports with clearly labeled illustrative laboratory values
- Filtered CSV export with quoted cells and formula-prefix protection
- Responsive navigation, keyboard-friendly dialogs, focus management, and reduced-motion support
- Field guide for the collection-to-confirmation workflow

## Important data boundary

This is a frontend demonstration using bundled, fictional records. Values shown in the dashboard and reports are illustrative only. Routine pH and turbidity readings do not detect PFAS or confirm microplastics, and the app must not be used to make water-safety or regulatory decisions.

New samples and alert acknowledgements are stored in the current browser when local storage is available. No data is sent to a server. Clearing browser storage or using the reset action removes locally added records and acknowledgements; the bundled records remain.

## Getting started

### Requirements

- Node.js 18 or newer
- npm 9 or newer

### Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The development server binds to `127.0.0.1`.

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Vitest test suite once |

## Project structure

```text
src/
  App.jsx          Main workspace and view state
  components.jsx   Reusable dashboard, table, map, form, and dialog components
  data.js          Bundled records, validation, persistence, and CSV export
  main.jsx         React entry point and local font imports
  styles.css       Responsive visual system and component styles
tests/
  App.test.jsx     End-to-end-style component workflow tests
  data.test.js     Persistence, validation, and CSV tests
docs/
  design-review.md Product decisions, constraints, and verification notes
```

## Testing and build verification

Run both checks before sharing changes:

```bash
npm test
npm run build
```

The tests cover sample registration, filtering, persistence failures, alert acknowledgement, report scoping, CSV safety, offline-site states, and mobile navigation behavior.

## Design principles

- Treat monitoring signals as signals, not diagnoses.
- Keep collection, laboratory processing, and confirmation as separate stages.
- Make the active location and data source visible.
- Keep local storage best-effort so the workspace remains usable when storage is unavailable.
- Prefer explicit status text and accessible controls over color-only communication.

## License

No license has been specified for this prototype yet.