# Daycare Mobile Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the daycare Expo app into a mobile-first bottom-tab experience with a welcome screen, responsive layouts, and full-detail parity with the HTML prototype.

**Architecture:** Keep the app in plain Expo/React Native with a local bottom-tab shell instead of adding a navigation dependency. Extract shared calculators and responsive UI primitives so each model screen can stay focused while reusing logic, tables, explainers, and mobile layout behavior.

**Tech Stack:** Expo SDK 54, React Native 0.81, React 19, JavaScript, built-in `node:test` for lightweight calculation tests.

## Global Constraints

- Read and follow Expo SDK 54 docs before writing code.
- Keep the app as bottom tabs after a welcome screen.
- Preserve all important prototype detail, not a simplified subset.
- Make the UI mobile-first and responsive across narrow widths.
- Avoid new dependencies unless the implementation is blocked without them.

---

## File Structure

- Modify: `App.js` - replace top-tab shell with welcome gate + bottom-tab shell.
- Create: `src/components/AppShell.js` - bottom navigation shell and page switching.
- Create: `src/components/WelcomeScreen.js` - first-run intro and CTA.
- Create: `src/components/ResponsivePage.js` - shared scroll/page wrapper and width handling.
- Create: `src/components/InfoBox.js` - “variables to determine” explainer blocks.
- Create: `src/components/ConstraintList.js` - pass/fail status rows.
- Create: `src/components/DataTable.js` - horizontally scrollable dense table wrapper.
- Create: `src/components/ReferenceStrip.js` - starter guidance/reference blocks.
- Modify: `src/components/MetricCard.js` - responsive widths and text fit.
- Modify: `src/components/SliderRow.js` - stacked mobile layout, optional dual ranges.
- Modify: `src/components/GaugeBar.js` - responsive labels/legend.
- Modify: `src/components/PhaseRoadmap.js` - tighter mobile rendering.
- Modify: `src/constants/modelData.js` - add structured parity data.
- Create: `src/utils/calculations.js` - extracted staffing/cost/breakeven/growth/profit helpers.
- Create: `tests/calculations.test.js` - node-based coverage for extracted logic.
- Modify: `src/screens/LPScreen.js`
- Modify: `src/screens/COScreen.js`
- Modify: `src/screens/BEScreen.js`
- Modify: `src/screens/GRScreen.js`
- Modify: `src/screens/PFScreen.js`
- Modify: `package.json` - add a test script using built-in Node test runner.

### Task 1: Responsive App Shell

**Files:**
- Create: `src/components/AppShell.js`
- Create: `src/components/WelcomeScreen.js`
- Create: `src/components/ResponsivePage.js`
- Modify: `App.js`

**Interfaces:**
- Consumes: existing screen exports from `src/screens/*`
- Produces: `AppShell({ screens })`, `WelcomeScreen({ onStart })`, `ResponsivePage({ children, contentContainerStyle })`

- [ ] Build welcome gating and bottom-tab shell in `App.js` and `src/components/AppShell.js`.
- [ ] Add a welcome/get-started screen with title, overview, and start CTA.
- [ ] Replace the current top-tab masthead navigation with bottom tabs sized for mobile touch targets.
- [ ] Add shared page wrapper behavior for safe areas, scrolling, and responsive content width.
- [ ] Run the app and verify the welcome screen transitions into bottom tabs without regressions.

### Task 2: Shared Responsive UI Primitives

**Files:**
- Create: `src/components/InfoBox.js`
- Create: `src/components/ConstraintList.js`
- Create: `src/components/DataTable.js`
- Create: `src/components/ReferenceStrip.js`
- Modify: `src/components/MetricCard.js`
- Modify: `src/components/SliderRow.js`
- Modify: `src/components/GaugeBar.js`
- Modify: `src/components/PhaseRoadmap.js`

**Interfaces:**
- Consumes: theme/colors and screen-level data
- Produces: reusable responsive sections for all five screens

- [ ] Refactor metric cards to adapt between 1-up, 2-up, and denser layouts without overflow.
- [ ] Refactor slider rows to stack label/control/value on narrow screens and keep dual-range inputs usable.
- [ ] Add reusable info box, constraint list, data table, and reference strip components.
- [ ] Update shared bars/roadmap components to behave on mobile widths.
- [ ] Verify shared components render correctly in at least one screen before moving to model parity.

### Task 3: Extract Tested Calculation Helpers

**Files:**
- Create: `src/utils/calculations.js`
- Create: `tests/calculations.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `calculateStaffing(...)`, `calculateCostModel(...)`, `calculateBreakEven(...)`, `calculateGrowth(...)`, `calculateProfit(...)`

- [ ] Write failing Node tests for extracted calculation behavior using `node:test` and `assert`.
- [ ] Run the tests to verify the expected failures.
- [ ] Implement minimal extracted helper functions for current and prototype-expanded calculations.
- [ ] Re-run tests until they pass cleanly.
- [ ] Wire `package.json` with a `test` script for the built-in test runner.

### Task 4: Staffing and Cost Parity

**Files:**
- Modify: `src/constants/modelData.js`
- Modify: `src/screens/LPScreen.js`
- Modify: `src/screens/COScreen.js`

**Interfaces:**
- Consumes: `InfoBox`, `ConstraintList`, `DataTable`, `ReferenceStrip`, calculation helpers
- Produces: full-detail Staffing and Cost screens

- [ ] Add prototype parity data to `modelData.js` for staffing roles, cost ranges, and reference content.
- [ ] Rebuild Staffing with variables-to-determine content, constraints block, editable salary allocation table, and legal-floor guidance.
- [ ] Rebuild Cost with enrolment/budget sync, auto-suggest behavior, dual ranges, solved summaries, comparison gauge, and source table.
- [ ] Ensure all dense structures are mobile-safe through stacking or horizontal scroll.
- [ ] Run calculation tests and manual app verification for both screens.

### Task 5: Break-Even, Growth, and Profit Parity

**Files:**
- Modify: `src/screens/BEScreen.js`
- Modify: `src/screens/GRScreen.js`
- Modify: `src/screens/PFScreen.js`

**Interfaces:**
- Consumes: shared helpers and responsive components
- Produces: parity-aligned remaining model screens

- [ ] Add prototype guidance/info sections to each screen.
- [ ] Align Break-Even assumptions and summary output with the richer prototype behavior.
- [ ] Add Growth guidance and cross-context metrics where shared calculations support it.
- [ ] Add Profit one-off non-depreciable outlay plus clearer result interpretation.
- [ ] Verify table/chart overflow is handled safely on narrow widths.

### Task 6: Final Verification

**Files:**
- Modify: any touched files from earlier tasks as needed

**Interfaces:**
- Consumes: full app
- Produces: verified implementation status

- [ ] Run `npm test` and confirm all calculation tests pass.
- [ ] Run the Expo app and verify welcome flow, bottom tabs, and all five screens load.
- [ ] Manually inspect narrow-width behavior on the densest screens: Cost, Staffing, Profit.
- [ ] Fix any final overflow or state regressions found during verification.
- [ ] Summarize actual completed scope and any remaining gaps.

## Self-Review

- Spec coverage: app shell, welcome screen, bottom tabs, responsiveness, and all five parity screens are covered.
- Placeholder scan: no TODO/TBD placeholders remain.
- Interface consistency: all screen tasks consume the shared components and calculation helpers defined earlier in the plan.
