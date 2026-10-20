# AQUA-VISION frontend design and review

## Understanding lock
Confirmed by the user: "proceed ... we just need the frontend" (no API keys).
Build a responsive frontend for authorities and field workers based on the supplied SIH PDF.
Monitoring locations, trends, alerts, sample registration, traceability and lab results
are in scope. Hardware, authentication, backend services and actual AI inference are not.
Use fictional bundled records only. Routine sensor anomalies are not PFAS detection or
microplastic confirmation. All lab results are clearly illustrative.

## Assumptions and constraints
- Local browser app for a hackathon workspacenstration; small bundled dataset.
- No keys, external services or network calls at runtime.
- Local persistence is best effort; storage failure must not crash the app.
- No real personal data or certification of water safety.
- Responsive from 360px; accessible keyboard controls and readable status labels.
- Team-maintainable React components with static data separated from UI.
- No server-side security, multi-user synchronization or production availability claims.

## Approaches considered
1. Operations dashboard (selected): broad coverage of the confirmed monitoring and
   sample workflow; modular views, browser-local state.
2. Presentation site: simpler, but does not exercise operational workflows.
3. Sampling-only mobile app: focused, but omits authority monitoring needs.

## Initial design
Navigation: Overview, Monitoring sites, Samples & tests, Alerts, Reports, Field guide.
Overview: summary metrics, a stylized interactive location map, parameter trend,
priority alerts and recent samples. Map explicitly says illustrative, not geographic.
Global location filter and search apply to displayed records; empty states explain
missing results. Sample registration validates location, type, volume and collector;
creates a unique ID and a collection event. A detail dialog shows sample stage and
traceability. Alert acknowledgement changes acknowledgement only, never water status.
Reports expose illustrative laboratory results and export labeled workspace CSV records.
Field guide describes the sampling workflow without personalized treatment advice.
New local entries and alert acknowledgement persist when storage is available.
Reset bundled data requires confirmation. No fake login, AI generation or upload flows.

## Visual direction
"Freshwater observatory": calm, precise, light operational surfaces with a deep navy
sidebar and teal accent. Differentiating anchor is a large schematic water-network
map with flowing water geometry and selectable monitoring nodes.
Typography: bundled Manrope headings and DM Sans body. 4px spacing rhythm.
Sparse entrance and hover motion with prefers-reduced-motion support.
DFII: impact 4 + fit 5 + feasibility 4 + performance 4 - consistency risk 2 = 15.
Use semantic controls, dialog focus containment, text labels alongside status color.

## Decision log
| Decision | Alternatives | Objection | Resolution |
| --- | --- | --- | --- |
| Frontend only, local bundled data | Real services | User has no API keys | No API integration; bundle runtime assets |
| Operations dashboard | Landing page, mobile-only app | None yet | Fits confirmed scope |
| Routine readings separate from confirmation | Generic safe/unsafe score | Could misrepresent detection ability | No safety score; stage and method labels |
| Browser persistence | Session-only state | Storage unavailable or corrupted | Guard reads/writes; continue in memory with notice |
| Schematic local map | Remote map tiles | Runtime network dependency | Bundle SVG and label illustrative |

## Skeptic review and resolutions
1. Accepted: volume must be an integer 50–5000 mL, with unit displayed; sample IDs
   use a crypto.randomUUID-derived suffix plus a year and check for collisions
   against fixture and saved records before registration.
2. Accepted: global location filter scopes metrics, map, samples, alerts, reports
   and export. Search is explicitly labeled "Search samples" and scopes sample
   tables only. Trends use selected site or an explicitly labeled network average.
3. Accepted: newly registered samples have only a Collected event, no implied lab
   activity. Fixture records explicitly identify their workspacenstration events.
4. Accepted: collector is chosen from fictional field-worker aliases, no real-name field.
5. Accepted: Samples is the collection/traceability workspace; Reports includes only
   fixture samples with a illustrative laboratory report, with read-only detail/export.

## Constraint guardian review and resolutions
Accepted with safeguards: validate persisted record shapes and enums before use;
fallback to fixtures/in-memory state on invalid or inaccessible storage. Export
quotes CSV cells and neutralizes formula prefixes. Every export says illustrative and
is scoped to selected location. No blocking constraints remain.

## User advocate review and resolutions
All accepted: persistent Workspace / data-source label and repeat in report details
and exports; Acknowledged is never Resolved. Inline field errors retain form state
and focus the first invalid field. Active location remains visible in every view;
search empty states differ from unavailable lab reports. Map controls have site
names, status text and selection outline. Native dialogs provide close/Escape/focus
containment and opener focus restoration. Storage failures say "Changes will last
until this page is closed."

## Review status
All three reviewers complete; all objections accepted and resolved in the design.
Arbiter: APPROVED. All objections accepted; none rejected or unresolved. Design
meets confirmed frontend-only scope with no runtime services or API keys.
Implementation verification remains required.

## Implementation and validation
React and Vite frontend, with bundled Manrope, DM Sans and Lucide icons.
No runtime API calls, keys or hosted deployment. CSS color tokens centralize the
visual system. Primary text/status colors were darkened for readability.

33 JSDOM component/data tests passed, covering:
- validated registration and field focus, persisted collection records;
- corrupt/unavailable storage, enum validation and duplicate identifiers;
- location/search/status behavior and offline reading states;
- alert acknowledgement without anomaly resolution;
- report scoping, confirmation before reset, CSV quoting and formula safety.
- mobile navigation inert state/Escape focus restoration and scoped export selection.

Production compilation succeeds. Browser tooling blocked access to the local
preview; visual desktop/mobile QA and native dialog keyboard behavior could not
be verified. This is a documented verification limitation, not a passed check.
