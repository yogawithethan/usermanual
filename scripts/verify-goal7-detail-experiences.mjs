#!/usr/bin/env node

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const world = read("apps/web/src/components/worlds/WorldExperience.tsx");
const styles = read("apps/web/src/components/worlds/WorldExperience.module.css");
const home = read("apps/web/src/app/page.tsx");
const homeStyles = read("apps/web/src/app/page.module.css");
const globals = read("apps/web/src/app/globals.css");
const homeLibrary = read("apps/web/src/components/library/HomeLibraryViews.tsx");
const homeLibraryStyles = read("apps/web/src/components/library/HomeLibraryViews.module.css");
const librarySwitcher = read("apps/web/src/components/library/LibraryModeSwitcher.tsx");
const librarySwitcherStyles = read("apps/web/src/components/library/LibraryModeSwitcher.module.css");
const faqAccordion = read("apps/web/src/components/library/FaqWorldAccordion.tsx");
const settings = read("apps/web/src/components/settings/SettingsPanel.tsx");
const settingsStyles = read("apps/web/src/components/settings/SettingsPanel.module.css");
const settingsPrimitiveStyles = read("apps/web/src/components/settings/SettingsPrimitives.module.css");
const ambientMotion = read("apps/web/src/components/motion/AmbientMotionController.tsx");
const userManualSettings = read("apps/web/src/components/settings/UserManualSettings.tsx");
const worldRoute = read("apps/web/src/app/universes/[slug]/page.tsx");
const practiceRoute = read("apps/web/src/app/universes/[slug]/practices/[practiceId]/page.tsx");
const tutorialContent = read("packages/content/src/universe-tutorials.generated.ts");
const experienceContent = read("packages/content/src/universe-experience.ts");
const universes = read("packages/content/src/universes.ts");
const workerPath = "../worker/lib/user-manual.js";
const worker = existsSync(workerPath) ? read(workerPath) : null;

for (const mode of ["tutorial", "practice", "faqs", "downloads"]) {
  assert.match(world, new RegExp(`\\b${mode}\\b`), `shared world shell must include ${mode}`);
}

for (const state of [
  "account-required",
  "progression-locked",
  "payment-locked",
  "purchased-progression-locked",
  "available",
  "in-progress",
  "completed",
]) {
  assert.match(world, new RegExp(state), `shared world shell must model ${state}`);
}

for (const filter of ["kind", "goal", "body", "intensity", "duration"]) {
  assert.match(world, new RegExp(`params\\.set\\(key|filters\\.${filter}|${filter}:`), `practice filters must include ${filter}`);
}

assert.match(world, /role="tablist"/);
assert.match(world, /ArrowLeft.*ArrowRight.*Home.*End/);
assert.match(world, /<CompletionBadge/);
assert.match(world, /status: "completed"/);
assert.match(world, /Prepared answers are free to read/);
assert.match(world, /asking Ethan a new question are part of lifetime access/);
assert.match(world, /Media coming soon/);
assert.match(world, /Notify me/);
assert.match(world, /PurchaseDisclosure/);
assert.match(styles, /\.filterRail[\s\S]*overflow-x: auto/);
assert.match(styles, /\.filterChip:hover \{ transform: translateY\(-2px\)/);
assert.match(styles, /animation: world-drift 80s/);
assert.match(styles, /animation-duration: 96s/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
assert.ok(home.indexOf("<LibraryModeSwitcher") < home.indexOf("<WelcomeButton"), "home library navigation must render above Welcome");
assert.match(home, /<HomeLibraryView/);
assert.match(home, /entitled=\{isEntitled\}/);
assert.match(home, /const canExpand = !isLocked/);
assert.match(home, /getDevAccessPreview/);
assert.match(home, /devProgressMode === "all"/);
assert.match(home, /requiresPurchase[\s\S]*\/paid\?feature=/);
assert.match(home, /Purchase lifetime access to unlock/);
assert.match(librarySwitcher, /href=\{item === "tutorial" \? "\/" : `\/\?mode=\$\{item\}`\}/);
assert.match(librarySwitcher, /if \(!isControlled\) setMode\(nextMode\)/);
assert.match(librarySwitcher, /PRACTICE_FILTERS/);
assert.match(librarySwitcher, /practiceHref\(\{ kind: item, query: practiceQuery, world: practiceWorld \}\)/);
assert.match(librarySwitcher, /Search practices/);
assert.match(librarySwitcher, /\.\.\.practiceWorlds/);
assert.match(librarySwitcher, /dse-cloud-icon\.svg/);
assert.match(librarySwitcherStyles, /mask-image: linear-gradient/);
assert.match(librarySwitcherStyles, /width: 100vw/);
assert.match(home, /Start Here — welcome introduction/);
assert.match(home, /name="arrow-right"/);
assert.match(settingsStyles, /top: max\(24px, env\(safe-area-inset-top\)\)/);
assert.match(userManualSettings, /Revisit Start Here/);
assert.doesNotMatch(homeLibrary, /<LibraryHeading/);
assert.match(homeLibrary, /FaqWorldAccordion/);
assert.match(faqAccordion, /grid-template-rows|turningPlus/);
assert.match(homeLibraryStyles, /font: 650 \.63rem/);
assert.match(homeLibraryStyles, /\.faq \+ \.faq \{ border-top: 0/);
assert.match(homeStyles, /overflow-clip-margin: 28px/);
assert.match(homeStyles, /animation: modeArrive/);
assert.match(globals, /html\[data-um-theme="dark"\] \[data-theme\]/);
assert.doesNotMatch(globals, /contain: layout paint style/);
assert.match(settingsStyles, /lifetime-offer-pearl\.png/);
assert.match(settingsStyles, /\.tabSlider/);
assert.match(settingsStyles, /translate3d\(calc\(var\(--active-tab\)/);
assert.match(settings, /function SettingsGearIcon/);
assert.match(settings, /M10\.343 3\.94/);
assert.match(settings, /GraduationCap.*User/);
assert.doesNotMatch(settings, /\bMoon\b|\bSun\b/);
assert.doesNotMatch(settings, /GearSix/);
assert.match(settings, /data-settings-open/);
assert.match(ambientMotion, /IntersectionObserver/);
assert.match(ambientMotion, /data-ambient-paused/);
assert.doesNotMatch(settings, /label: "Look"/);
assert.match(settingsPrimitiveStyles, /lifetime-offer-pearl\.png/);
assert.match(settingsPrimitiveStyles, /\.segmentedSlider/);

assert.match(worldRoute, /getUniverseTutorial/);
assert.match(worldRoute, /getUniversePractices/);
assert.ok(worldRoute.indexOf("if (!signedIn)") < worldRoute.indexOf("sections={tutorial.sections}"), "paid tutorial copy must not be rendered for a signed-out member");
assert.ok(worldRoute.indexOf("if (!entitled)") < worldRoute.indexOf("sections={tutorial.sections}"), "paid tutorial copy must not be rendered without entitlement");
assert.ok(worldRoute.indexOf("if (!progressionReady)") < worldRoute.indexOf("sections={tutorial.sections}"), "paid tutorial copy must not be rendered before progression unlock");
assert.match(practiceRoute, /generateStaticParams/);
assert.match(practiceRoute, /PracticeDetailView/);

for (const slug of ["wake-the-fck-up", "prana-fusion", "yoga-reset", "gravity-yoga", "here-to-there"]) {
  assert.match(tutorialContent, new RegExp(`"${slug}"`), `${slug} must have canonical tutorial content`);
  assert.match(experienceContent, new RegExp(`universeSlug: "${slug}"`), `${slug} must have practice metadata`);
}

assert.equal((tutorialContent.match(/"sourceId":/g) ?? []).length, 5, "all five tutorials must retain their canonical Notion source IDs");
assert.ok((tutorialContent.match(/\n\s+"id": "/g) ?? []).length >= 45, "canonical import must contain the full chapter set");
assert.equal((experienceContent.match(/\n\s+practice\("/g) ?? []).length, 15, "all fifteen planned practices must be present");
assert.equal((experienceContent.match(/releaseStatus: "coming_soon"/g) ?? []).length, 6, "the shared practice factory and five downloads must be explicitly coming soon");
assert.doesNotMatch(tutorialContent, /Password:|vimeo\.com|youtube\.com|ethanhill\.org|class pack|Patreon|\$35 donation/i);

assert.match(home, /releaseStatus="available"/, "all written tutorial cards must use the available release contract");
if (worker) {
  assert.ok((worker.match(/release_status: ['"]available['"]/g) ?? []).length >= 5, "worker progression contract must release all five written tutorials");
}

console.log("Goal 7 verified: five canonical tutorials, shared responsive world shell, free FAQs, gated paid content, URL filters, coming-soon practice/download metadata, and focused practice routes.");
