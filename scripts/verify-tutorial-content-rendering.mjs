#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const markdownContent = read("apps/web/src/components/tutorials/MarkdownContent.tsx");
const markdownInline = read("apps/web/src/components/tutorials/MarkdownInline.tsx");
const markdownStyles = read("apps/web/src/components/tutorials/MarkdownContent.module.css");
const tutorialChecklist = read("apps/web/src/components/tutorials/TutorialChecklist.tsx");
const interactiveChecklist = read("apps/web/src/components/detail/InteractiveChecklist.tsx");
const faqAccordion = read("apps/web/src/components/tutorials/FaqAccordion.tsx");
const faqWorldAccordion = read("apps/web/src/components/library/FaqWorldAccordion.tsx");
const worldExperience = read("apps/web/src/components/worlds/WorldExperience.tsx");
const homePage = read("apps/web/src/app/page.tsx");
const detailExperience = read("apps/web/src/components/detail/DetailExperience.tsx");
const pranaLightning = read("apps/web/src/components/motion/PranaLightning.tsx");
const levelRoute = read("apps/web/src/app/levels/[level]/page.tsx");
const universeDetail = read("apps/web/src/components/detail/UniverseDetail.tsx");
const levelOne = read("packages/content/src/notion-level-one.generated.ts");
const levels = read("packages/content/src/notion-levels.generated.ts");
const universes = read("packages/content/src/universe-tutorials.generated.ts");
const corpus = `${levelOne}\n${levels}\n${universes}`;

assert.equal((universes.match(/"sourceId":/g) ?? []).length, 5, "all five practice worlds must retain canonical Notion source IDs");
assert.ok((levels.match(/^\s+"[2-6]": \[$/gm) ?? []).length === 5, "Levels 2-6 must retain their canonical imported section sets");
assert.ok((corpus.match(/- \[ \]/g) ?? []).length > 100, "the canonical corpus must retain authored Notion to-do semantics");

assert.match(markdownContent, /function extractFootnotes/);
assert.match(markdownContent, /function checklistItems/);
assert.match(markdownContent, /TutorialChecklist/);
assert.ok(markdownContent.includes('replace(/^!\\[\\]\\(\\)$/, "")'), "empty Notion image blocks must be removed");
assert.match(markdownInline, /function findClosingDelimiter/);
assert.match(markdownInline, /insideWord/);
assert.match(markdownInline, /isTerminalAsteriskFootnoteReference/);
assert.ok(markdownInline.includes('replace(/!\\[\\]\\(\\)/g, "")'), "inline empty Notion image placeholders must be removed");
assert.match(markdownInline, /closing italic followed by a closing strong/);
assert.match(tutorialChecklist, /aria-label="Mastery checklist"/);
assert.match(tutorialChecklist, /localStorage/);
assert.match(tutorialChecklist, /renderMarkdownInline/);

assert.match(markdownStyles, /\.paragraph[\s\S]*line-height: 1\.58/);
assert.match(markdownStyles, /\.paragraph[\s\S]*margin: 0 0 1\.15em/);
assert.match(markdownStyles, /\.checklist[\s\S]*corner-shape: squircle/);
assert.match(markdownStyles, /\.checkItemDone \.checkText[\s\S]*background-size: 100% 1px/);

for (const surface of [interactiveChecklist, faqAccordion, faqWorldAccordion, worldExperience]) {
  assert.match(surface, /renderMarkdownInline/, "every checklist and FAQ surface must share the tolerant inline renderer");
}
assert.match(levelRoute, /<MarkdownContent/);
assert.match(universeDetail, /<MarkdownContent/);
assert.match(homePage, /<PranaLightningField/);
assert.match(detailExperience, /<PranaLightningField/);
assert.match(pranaLightning, /data-prana-lightning="lottie"/);
assert.doesNotMatch(detailExperience, /pf-lightning-icon\.svg/);

for (const sample of [
  "**Suggested Prerequisites**",
  "- [ ] Ability to engage each breathing muscle separately",
  "**if you aren't mindful, you *will*",
  "* This connection between body state and behavior",
]) {
  assert.ok(universes.includes(sample), `Prāna Fusion canonical fixture missing: ${sample}`);
}

console.log("Tutorial formatting verified: all eleven canonical classes share paragraph rhythm, tolerant nested emphasis, interactive Notion checklists, inline footnotes, and empty-media cleanup.");
