#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const system = read("apps/web/src/components/ui/System.tsx");
const styles = read("apps/web/src/components/ui/System.module.css");
const lab = read("apps/web/src/app/ui-lab/page.tsx");
const provider = read("apps/web/src/themes/ThemeProvider.tsx");
const portableTokens = read("packages/theme/src/system.ts");
const welcome = read("apps/web/src/app/welcome/page.tsx");
const paid = read("apps/web/src/app/paid/page.tsx");
const dse = read("apps/web/src/themes/dse.ts");
const universes = read("packages/content/src/universes.ts");
const icons = read("apps/web/src/components/ui/SystemIcon.tsx");
const motion = read("apps/web/src/components/ui/MotionPreview.tsx");
const completion = read("apps/web/src/components/progress/CompletionUnlockNotice.tsx");
const completionBadge = read("apps/web/src/components/ui/CompletionBadge.tsx");
const progressionStatus = read("apps/web/src/components/ui/ProgressionStatus.tsx");
const purchaseFrame = read("apps/web/src/components/purchase/PurchaseFrame.tsx");
const purchaseDisclosure = read("apps/web/src/components/purchase/PurchaseDisclosure.tsx");
const purchaseContract = read("apps/web/src/lib/purchaseContract.ts");
const purchaseCard = read("apps/web/src/components/purchase/PurchaseUnlockCard.tsx");
const home = read("apps/web/src/app/page.tsx");
const level = read("apps/web/src/app/levels/[level]/page.tsx");
const shapeStudy = lab.includes("Squircle shape study");

for (const component of [
  "Stack", "Cluster", "ChipRail", "Eyebrow", "Heading", "Text", "Button", "ButtonLink",
  "IconButton", "Chip", "ChipButton", "Divider", "Surface", "Notice", "TextField",
  "Checkbox", "EmptyState", "Skeleton",
]) {
  assert.match(system, new RegExp(`export function ${component}\\b`), `${component} must remain part of the public primitive contract`);
  if (!shapeStudy) assert.match(lab, new RegExp(`<${component}\\b`), `${component} must have a UI Lab specimen`);
}

if (shapeStudy) {
  for (const specimen of ["Gentle squircle", "Balanced squircle", "Expressive squircle", "Near-pill squircle"]) {
    assert.match(lab, new RegExp(specimen, "i"), `UI Lab shape study must show ${specimen}`);
  }
  assert.match(lab, /id="combinations"/);
  assert.match(lab, /data-selected/);
} else {
  for (const state of ["Free", "Paid", "Locked", "In progress", "Completed", "Coming soon"]) {
    assert.match(lab, new RegExp(state, "i"), `UI Lab must show ${state}`);
  }
}

for (const variable of [
  "--ui-type-display", "--ui-control-lg", "--ui-content-width",
  "--ui-motion-fast", "--ui-layer-tooltip", "--theme-color-focus",
]) {
  assert.ok(provider.includes(variable), `${variable} must be painted by ThemeProvider`);
}

assert.match(portableTokens, /typography:/);
assert.match(portableTokens, /control:/);
assert.match(portableTokens, /motion:/);
assert.match(portableTokens, /layer:/);
assert.match(styles, /:focus-visible/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(styles, /min-width: 0/);
assert.match(styles, /text-wrap: balance/);
assert.match(styles, /color-mix\(in srgb, var\(--theme-color-accent\)/);
assert.match(styles, /\.headingSubsection[\s\S]*font-family: var\(--ui-font-body\)/);
assert.match(styles, /\.button \{[\s\S]*rgb\(27 26 25\)/, "system primary actions must use the neutral premium treatment");
assert.match(styles, /\.buttonTheme[\s\S]*var\(--theme-color-accent\)/, "practice worlds must opt into their own accent treatment");
assert.match(styles, /\.surface \{[\s\S]*rgba\(255, 255, 255, 0\.94\)/, "shared surfaces must retain the light pearl-glass coating");
assert.match(styles, /\.checkboxInput:checked \+ \.checkboxControl \{ background: rgb\(35 32 30\)/, "system checkboxes must not fall back to the old blue accent");
assert.match(styles, /\.chipInteractive:hover \{ transform: translateY\(-3px\)/);
assert.match(styles, /\.chipRail[\s\S]*overflow-x: auto/);
assert.match(system, /className=\{styles\.iconTooltip\} role="tooltip"/);
assert.match(lab, /robots: \{ index: false, follow: false \}/);
if (!shapeStudy) {
  assert.match(lab, /data-universe=/);
  assert.match(lab, /Open detail shell/);
  assert.match(lab, /mode=practice/);
  assert.match(lab, /<MotionPreview \/>/);
  assert.match(lab, /<CompletionUnlockNotice/);
}
assert.match(dse, /body: "var\(--font-dse-label\)"/);
assert.match(dse, /body: "var\(--font-dse-label\)"/);
assert.match(universes, /primaryFont: "var\(--font-prana-primary\)"[\s\S]*secondaryFont: .*Nexa/);
assert.match(universes, /primaryFont: "var\(--font-yoga-reset-primary\)"[\s\S]*headingFontWeight: 400/);
assert.match(universes, /primaryFont: "var\(--font-gravity-primary\)"[\s\S]*secondaryFont: "var\(--font-gravity-primary\)"/);
for (const name of ["play", "lock", "unlock", "check", "chevron-down", "spark", "trophy"]) {
  assert.match(icons, new RegExp(`case "${name}"`), `SystemIcon must include ${name}`);
}
assert.match(universes, /primaryFont: "var\(--font-wtfu-primary\)"/);
assert.match(universes, /primaryFont: .*Bubblebody Neue.*Nexa/);
assert.match(read("apps/web/src/themes/universeFonts.ts"), /Pacifico/);
assert.doesNotMatch(read("apps/web/src/themes/universeFonts.ts"), /Lobster/);
assert.match(read("apps/web/src/components/molecules/CloudButton.tsx"), /duration: "116s"/);
assert.match(motion, /prefers-reduced-motion: reduce/);
assert.match(completion, /role=\{preview \? "status" : "dialog"\}/);
assert.match(completionBadge, /aria-pressed=\{complete\}/);
assert.match(completionBadge, /role="tooltip"/);
assert.match(completionBadge, /M3\.85 8\.62/);
assert.match(read("apps/web/src/components/ui/CompletionBadge.module.css"), /height: var\(--ui-control-icon\)/);
assert.match(read("apps/web/src/components/ui/CompletionBadge.module.css"), /\.incomplete \.check \{ opacity: 1/);
assert.match(read("apps/web/src/components/ui/CompletionBadge.module.css"), /\.complete \.badgeShape \{ fill: currentColor/);
assert.match(level, /<LevelCompletion/);
assert.match(read("apps/web/src/components/detail/LevelCompletion.tsx"), /<CompletionBadge/);
assert.match(universes, /headingLetterSpacing: "0\.065em"/);
for (const state of ["free", "paid", "locked", "in-progress", "completed", "coming-soon"]) {
  assert.match(progressionStatus, new RegExp(`${state}:|"${state}":|state === "${state}"`), `ProgressionStatus must include ${state}`);
}
assert.match(progressionStatus, /data-progression-state=\{state\}/);
assert.match(progressionStatus, /role="tooltip"/);
if (!shapeStudy) assert.match(lab, /<ProgressionStatus state="free"/);
assert.match(purchaseContract, /USER_MANUAL_PRICE_CENTS = 14_400/);
assert.match(purchaseContract, /USER_MANUAL_PRICE_LABEL = "\$144"/);
for (const benefit of ["Five paid tutorials", "Practice audios", "Comments and questions", "Downloads and future additions"]) {
  assert.match(purchaseContract, new RegExp(benefit), `purchase contract must include ${benefit}`);
}
assert.match(purchaseFrame, /data-purchase-frame/);
assert.match(purchaseFrame, /data-purchase-state=\{state\}/);
assert.match(purchaseFrame, /Purchase and progression are separate/);
assert.match(purchaseDisclosure, /aria-expanded=\{expanded\}/);
assert.match(purchaseDisclosure, /data-state=\{expanded \? "expanded" : "collapsed"\}/);
assert.match(purchaseDisclosure, /data-purchase-disclosure/);
assert.match(purchaseDisclosure, /USER_MANUAL_PURCHASE_BENEFITS\.map/);
assert.match(purchaseCard, /<PurchaseDisclosure/);
assert.match(purchaseCard, /if \(purchased \|\| excluded\)/);
assert.match(paid, /<PurchaseShell/);
assert.match(paid, /<YwePasswordlessAccess/);
assert.match(paid, /<CheckoutHandoff/);
if (!shapeStudy) {
  assert.match(lab, /data-testid="purchase-frame-specimen"/);
  assert.match(lab, /data-testid="purchase-disclosure-specimen"/);
}
assert.doesNotMatch(purchaseFrame, /#[0-9A-Fa-f]{6}\b/);
assert.doesNotMatch(purchaseDisclosure, /#[0-9A-Fa-f]{6}\b/);
assert.match(styles, /0 3px 8px rgba\(25, 22, 20, 0\.15\)/);

for (const [route, source] of [["welcome", welcome], ["paid", paid]]) {
  assert.match(source, /@\/components\/ui\/System/, `${route} must consume the UI system`);
}

console.log("User Manual UI system verified: portable tokens, 19 primitives, purchase/progression contracts, font/theme/icon behavior, accessibility, and representative route adoption.");
