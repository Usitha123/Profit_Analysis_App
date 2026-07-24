# Daycare Mobile Parity Design

**Goal**

Rebuild the Expo app into a mobile-first daycare planning tool with a welcome screen, bottom-tab navigation, improved responsiveness, and near-full functional parity with the provided HTML prototype across Staffing, Cost, Break-Even, Growth, and Profit models.

**Current State**

The existing app already contains five screens with core calculations and some shared UI primitives, but it is still structured like a desktop-style single sheet:

- top tab strip rather than native-feeling mobile bottom navigation
- dense horizontal control rows that compress badly on phones
- simplified model logic compared with the prototype
- missing onboarding
- missing explanatory reference content and several solved/detail sections from the prototype

The codebase is small and flat, with all screens mounted directly from `App.js` and shared components under `src/components`.

**Product Direction**

The app should feel like a normal mobile productivity app for first-time daycare founders:

- first open shows a welcome/get-started screen
- main experience uses bottom tabs
- every model screen remains independently accessible
- dense financial or staffing detail stays available, but layouts must collapse intelligently on small screens
- the app should preserve the prototype's educational/detail-heavy character instead of reducing it to a lightweight calculator

## Architecture

### App Shell

Replace the current single-screen top-tab shell with:

- a launch-state-controlled welcome screen
- a persistent bottom-tab shell for the five model screens
- shared page container behavior that handles phone widths, safe areas, vertical scrolling, and horizontal overflow for dense tables/charts

This should stay in plain React Native without adding a navigation library unless implementation friction clearly requires one. The current app is small enough to support a local tab-shell state pattern.

### Shared UI System Expansion

The current shared component set should be extended rather than replaced. New shared primitives should cover:

- welcome hero / intro blocks
- bottom tab bar
- responsive section cards
- “variables to determine” explainer box
- constraints/status rows
- horizontally scrollable data tables
- responsive chart wrapper
- collapsible detail sections only where required for mobile readability
- reference/example strip blocks for starter guidance

### Data Model Strategy

Prototype detail should be moved into structured constants where practical:

- staffing role metadata
- cost category ranges and defaults
- reference examples / material examples
- non-depreciable capital outlay items
- explanatory copy blocks tied to each model

Computation should remain local inside each screen unless two or more screens need the same derived values. Cross-model values that matter to parity, such as break-even context reused by Growth or Profit, should be extracted into shared helper functions.

## Screen Design

### Welcome Screen

Add a welcome screen before the tabs with:

- app title and short value proposition
- concise explanation of the five models
- a “Get Started” CTA
- a secondary note that the tool is designed for planning a daycare launch

The welcome screen should not look like a marketing landing page. It should feel like an app entry surface with immediate orientation.

### Staffing Screen

Add missing prototype parity features:

- variables-to-determine box
- clearer ratio explanation
- constraints satisfied section
- role-based optimal staff allocation table with editable salary inputs
- starter-facing legal floor explanation

The current age-group sliders and roadmap should remain, but the salary table and constraint block should become core content.

### Cost Screen

This is the most significant parity gap. Add:

- variables-to-determine box
- target enrolment numeric + slider sync
- budget cap numeric + slider sync
- auto-suggest ranges action
- dual-range controls for fixed categories
- dual-range controls for per-child categories
- solved allocation summary
- source/range table
- minimum required / budget cap / maximum plausible comparison gauge
- prototype-style explanatory notes and starter references

This screen must be carefully restructured for mobile because it contains the densest interaction surface.

### Break-Even Screen

Bring it closer to the prototype by:

- adding variables-to-determine guidance
- supporting more realistic fixed and variable cost composition derived from category breakdowns rather than only three abstract sliders, if this can be done without making the screen incoherent
- keeping the chart, but making the chart container responsive and readable on narrow devices

If full category inheritance from Cost is too large for the first implementation pass, preserve the current direct controls while surfacing the missing guidance and aligning labels/assumptions with the prototype.

### Growth Screen

Add:

- variables-to-determine box
- better contextual explanation of `N0`, `K`, and `r`
- milestone metrics
- cross-reference to break-even threshold if shared computations are available

The chart remains central, but legend and annotations must adapt cleanly to phones.

### Profit Screen

Add missing prototype features:

- variables-to-determine box
- one-off non-depreciable capital outlay section
- clearer profit result interpretation
- accounting break-even context where feasible
- preservation of the capital assets + depreciation table

The asset table needs safe mobile overflow handling rather than squeezing columns until unusable.

## Responsiveness

This is a first-order requirement, not a polish pass.

### Layout Rules

- Replace rigid left-label / right-control rows with adaptive layouts that stack on narrow screens.
- Metric cards should render as 1-up, 2-up, or 3-up based on available width instead of fixed wrap assumptions.
- Dense tables must live inside horizontal scroll containers.
- Chart width should be based on measured container width, not `Dimensions` alone.
- Long labels must wrap cleanly without colliding with inputs or values.
- Bottom tab targets must be thumb-friendly.

### Mobile Interaction Rules

- Numeric inputs should remain editable but not be the only interaction mechanism where sliders/ranges exist.
- Dual-range controls must remain usable on touch screens.
- Dense prototype notes should be chunked into readable blocks, not long wall text.

## Data and Logic Boundaries

### Shared Derived Values

Create shared helpers for:

- staffing ratio calculations
- cost allocation summaries
- break-even calculations
- growth projection
- depreciation / ROI summaries

Screens can still own local state, but calculation helpers should be extracted where they improve consistency or enable cross-screen reuse.

### Prototype Parity Scope

“Full parity” here means:

- porting the missing model details, sections, and interactions from the HTML prototype
- preserving the prototype’s explanatory content in app-appropriate form
- adapting desktop/table content into mobile-safe layouts

It does not require:

- embedding the HTML imagery/base64 assets directly
- adding Python-code prompt buttons from the prototype
- reproducing decorative desktop-only presentation choices literally

## Testing and Verification

Verification should focus on:

- state transitions between welcome and tab shell
- bottom-tab switching
- computation correctness for each model
- mobile layout integrity for narrow screens
- no broken overflow in tables/charts

Because this project currently has no visible test harness, initial verification may rely on:

- targeted component/unit tests if feasible with current setup
- manual Expo web/device checks
- responsive verification on narrow and medium widths

## Risks

- Cost screen complexity may sprawl if rebuilt inline without new shared components.
- Break-Even / Growth / Profit cross-linking can create hidden coupling if shared calculations are not clearly defined.
- Mobile responsiveness will fail if current fixed-width assumptions remain in shared components like `MetricCard`, `SliderRow`, and chart sizing.
- Keeping parity while avoiding visual overload requires selective collapsing and clear section hierarchy.

## Recommended Implementation Order

1. Rebuild the app shell: welcome screen, bottom tabs, responsive page scaffolding.
2. Upgrade shared components for mobile-safe layouts.
3. Port Staffing parity features.
4. Port Cost parity features.
5. Align Break-Even, then Growth, then Profit with prototype detail.
6. Verify responsiveness across all screens and clean up overflow issues.

## Spec Review

- No placeholders remain.
- Scope is still single-product and coherent: one mobile app shell, five model screens, shared responsive system.
- The largest complexity area is the Cost screen, but it remains within the same subsystem and does not justify splitting the spec.
