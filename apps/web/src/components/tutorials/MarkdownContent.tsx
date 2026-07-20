import type { ReactNode } from "react";

import { renderMarkdownInline, type MarkdownFootnote } from "./MarkdownInline";
import { TutorialChecklist, type TutorialChecklistItem } from "./TutorialChecklist";
import styles from "./MarkdownContent.module.css";

interface MarkdownContentProps {
  blockClassName?: string;
  blocks: string[];
  footnotes?: MarkdownFootnote[];
  imageClassName?: string;
}

function inlineWithBreaks(text: string, footnotes: MarkdownFootnote[] = [], keyPrefix = "line"): ReactNode[] {
  return text.replace(/<br\s*\/?\s*>/gi, "\n").split("\n").flatMap((line, index) => {
    const nodes = renderMarkdownInline(line, footnotes, `${keyPrefix}-${index}`);
    return index === 0 ? nodes : [<br key={`${keyPrefix}-br-${index}`} />, ...nodes];
  });
}

function imageBlock(block: string, imageClassName?: string) {
  const match = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (!match) return null;

  return (
    <figure className="my-8">
      <img
        alt={match[1]}
        className={imageClassName ?? "shape-frame w-full object-cover shadow-[0_16px_40px_rgba(12,19,45,0.14)]"}
        src={match[2]}
      />
      {match[1] ? <figcaption className="mt-3 text-center text-[13px] leading-5 text-[#64748B]">{match[1]}</figcaption> : null}
    </figure>
  );
}

function headingBlock(block: string, key: string, footnotes: MarkdownFootnote[]) {
  const match = block.match(/^(#{1,4})\s+(.+)$/);
  if (!match) return null;

  const level = match[1].length;
  const nodes = renderMarkdownInline(match[2].trim(), footnotes, `${key}-heading`);

  if (level === 1) return <h1 className="mt-10 text-[34px] font-black leading-tight text-[#111111] md:text-[42px]" key={key}>{nodes}</h1>;
  if (level === 2) return <h2 className="mt-8 text-[28px] font-black leading-tight text-[#111111] md:text-[34px]" key={key}>{nodes}</h2>;
  if (level === 3) return <h3 className="mt-7 text-[23px] font-black leading-tight text-[#111111] md:text-[28px]" key={key}>{nodes}</h3>;
  return <h4 className="mt-6 text-[19px] font-black leading-tight text-[#111111] md:text-[23px]" key={key}>{nodes}</h4>;
}

function inlineHeadingBlock(block: string, key: string, footnotes: MarkdownFootnote[]) {
  if (!block.startsWith("**") || !block.endsWith("**")) return null;
  const hasFootnote = block.endsWith("***") && footnotes.some((footnote) => footnote.marker === "*");
  const content = block.slice(2, hasFootnote ? -3 : -2).trim();
  if (!content || content.includes("**")) return null;
  return (
    <h3 className={styles.inlineHeading} key={key}>
      {renderMarkdownInline(content, footnotes, `${key}-inline-heading`)}
      {hasFootnote ? renderMarkdownInline("*", footnotes, `${key}-inline-heading-note`) : null}
    </h3>
  );
}

function listBlock(block: string, key: string, footnotes: MarkdownFootnote[]) {
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return null;

  const unordered = lines.every((line) => /^[-*]\s+/.test(line));
  if (unordered) {
    if (lines.length === 1 && /Ethan\s+ॐ/.test(lines[0])) {
      return <p className={styles.paragraph} key={key}>- {renderMarkdownInline(lines[0].replace(/^[-*]\s+/, ""), footnotes, `${key}-signoff`)}</p>;
    }
    return (
      <ul className={`${styles.list} list-disc`} key={key}>
        {lines.map((line, index) => <li key={`${key}-li-${index}`}>{renderMarkdownInline(line.replace(/^[-*]\s+/, ""), footnotes, `${key}-li-${index}`)}</li>)}
      </ul>
    );
  }

  const ordered = lines.every((line) => /^\d+[.)]\s+/.test(line));
  if (ordered) {
    return (
      <ol className={`${styles.list} list-decimal`} key={key}>
        {lines.map((line, index) => <li key={`${key}-li-${index}`}>{renderMarkdownInline(line.replace(/^\d+[.)]\s+/, ""), footnotes, `${key}-li-${index}`)}</li>)}
      </ol>
    );
  }

  return null;
}

function checklistItems(block: string): TutorialChecklistItem[] | null {
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
  if (!lines.length || !lines.every((line) => /^-\s+\[[ xX]\]\s+/.test(line))) return null;
  return lines.map((line) => ({
    checked: /^-\s+\[[xX]\]/.test(line),
    text: line.replace(/^-\s+\[[ xX]\]\s+/, ""),
  }));
}

function quoteBlock(block: string, key: string, footnotes: MarkdownFootnote[]) {
  const lines = block.split("\n").map((line) => line.trim());
  if (!lines.every((line) => line.startsWith(">"))) return null;
  return <blockquote className={styles.quote} key={key}>{inlineWithBreaks(lines.map((line) => line.replace(/^>\s?/, "")).join("\n"), footnotes, `${key}-quote`)}</blockquote>;
}

function ruleBlock(block: string, key: string) {
  return /^-{3,}$/.test(block.trim()) ? <hr className="my-9 border-current/15" key={key} /> : null;
}

function parseFootnoteLine(line: string): MarkdownFootnote | null {
  const asterisk = line.match(/^\\?\*\s+(.+)$/);
  if (asterisk) return { marker: "*", text: asterisk[1].trim() };
  const symbol = line.match(/^([†‡§¹²³⁴⁵⁶⁷⁸⁹])\s*(.+)$/);
  return symbol ? { marker: symbol[1], text: symbol[2].trim() } : null;
}

function extractFootnotes(blocks: string[], supplied: MarkdownFootnote[]) {
  const footnotes = new Map(supplied.map((footnote) => [footnote.marker, footnote]));
  const content: string[] = [];

  for (const block of blocks) {
    const lines = String(block || "").split("\n").map((line) => line.trim()).filter(Boolean);
    const parsed = lines.map(parseFootnoteLine);
    if (lines.length && parsed.every(Boolean)) {
      for (const footnote of parsed) {
        if (footnote) footnotes.set(footnote.marker, footnote);
      }
    } else {
      content.push(block);
    }
  }

  return { blocks: content, footnotes: [...footnotes.values()] };
}

function checklistStorageKey(items: TutorialChecklistItem[]) {
  const value = items.map((item) => item.text).join("|");
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `um-inline-checklist:${(hash >>> 0).toString(36)}`;
}

function sanitizeNotionBlock(block: string) {
  return block.replace(/,\*\n\*{3}(-\s*Ethan\s+ॐ)\*\*$/u, ",\n**$1**");
}

export function MarkdownContent({ blockClassName, blocks, footnotes: suppliedFootnotes = [], imageClassName }: MarkdownContentProps) {
  const normalized = extractFootnotes(blocks, suppliedFootnotes);
  return (
    <>
      {normalized.blocks.map((block, index) => {
        const trimmed = sanitizeNotionBlock(String(block || "").trim()).replace(/^!\[\]\(\)$/, "");
        if (!trimmed) return null;
        const key = `${index}-${trimmed.slice(0, 20)}`;
        const image = imageBlock(trimmed, imageClassName);
        const checklist = checklistItems(trimmed);
        if (image) return <div key={key}>{image}</div>;
        if (checklist) return <TutorialChecklist footnotes={normalized.footnotes} items={checklist} key={key} storageKey={checklistStorageKey(checklist)} />;
        return (
          headingBlock(trimmed, key, normalized.footnotes) ||
          inlineHeadingBlock(trimmed, key, normalized.footnotes) ||
          listBlock(trimmed, key, normalized.footnotes) ||
          quoteBlock(trimmed, key, normalized.footnotes) ||
          ruleBlock(trimmed, key) ||
          <p className={[styles.paragraph, blockClassName].filter(Boolean).join(" ")} key={key}>{inlineWithBreaks(trimmed, normalized.footnotes, key)}</p>
        );
      })}
    </>
  );
}
