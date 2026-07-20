import type { ReactNode } from "react";

import { InlineFootnote } from "./InlineFootnote";

export interface MarkdownFootnote {
  marker: string;
  text: string;
}

function isAlphaNumeric(value: string | undefined) {
  return Boolean(value && /[\p{L}\p{N}]/u.test(value));
}

function findClosingDelimiter(text: string, delimiter: "*" | "**" | "_" | "__", start: number) {
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === "\\") {
      index += 1;
      continue;
    }

    if (delimiter.length === 2) {
      if (!text.startsWith(delimiter, index)) continue;

      // A closing italic followed by a closing strong is written as ***.
      // In that run the strong delimiter is the final two characters, not
      // the first two. Choosing the first pair leaves the nested italic open.
      if (text[index + 2] === delimiter[0] && text[index - 1] !== delimiter[0]) continue;
      return index;
    }

    if (text[index] !== delimiter) continue;
    if (text[index - 1] === delimiter || text[index + 1] === delimiter) continue;
    if (isAlphaNumeric(text[index - 1]) && isAlphaNumeric(text[index + 1])) continue;
    return index;
  }

  return -1;
}

function pushText(nodes: ReactNode[], value: string) {
  if (!value) return;
  const previous = nodes.at(-1);
  if (typeof previous === "string") nodes[nodes.length - 1] = `${previous}${value}`;
  else nodes.push(value);
}

function isTerminalAsteriskFootnoteReference(text: string, markerIndex: number) {
  return text[markerIndex] === "*" && text.slice(markerIndex + 1).trim().length === 0;
}

export function renderMarkdownInline(
  input: string,
  footnotes: MarkdownFootnote[] = [],
  keyPrefix = "inline",
): ReactNode[] {
  const text = input
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/!\[\]\(\)/g, "");
  const footnoteMap = new Map(footnotes.map((footnote) => [footnote.marker, footnote]));
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < text.length) {
    const rest = text.slice(index);
    const imageMatch = rest.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    const linkMatch = rest.match(/^\[([^\]]+)\]\(([^)]+)\)/);

    if (imageMatch) {
      nodes.push(
        <img
          alt={imageMatch[1]}
          className="shape-frame my-5 w-full object-cover shadow-[0_14px_34px_rgba(12,19,45,0.10)]"
          key={`${keyPrefix}-image-${index}`}
          src={imageMatch[2]}
        />,
      );
      index += imageMatch[0].length;
      continue;
    }

    if (linkMatch) {
      const href = linkMatch[2];
      nodes.push(
        <a
          className="font-bold underline decoration-current/35 underline-offset-4"
          href={href}
          key={`${keyPrefix}-link-${index}`}
          rel="noreferrer"
          target={href.startsWith("/") || href.startsWith("#") ? undefined : "_blank"}
        >
          {renderMarkdownInline(linkMatch[1], footnotes, `${keyPrefix}-link-${index}`)}
        </a>,
      );
      index += linkMatch[0].length;
      continue;
    }

    if (text[index] === "\\" && text[index + 1]) {
      const escaped = text[index + 1];
      const footnote = footnoteMap.get(escaped);
      const insideWord = isAlphaNumeric(text[index - 1]) && isAlphaNumeric(text[index + 2]);
      const isValidAsteriskReference = escaped !== "*" || text.slice(index + 2).trim().length === 0;
      if (footnote && !insideWord && isValidAsteriskReference) {
        nodes.push(<InlineFootnote key={`${keyPrefix}-footnote-${index}`} marker={escaped} text={footnote.text} />);
      } else {
        pushText(nodes, escaped);
      }
      index += 2;
      continue;
    }

    const character = text[index];
    const symbolicFootnote = footnoteMap.get(character);
    if (symbolicFootnote && character !== "*") {
      nodes.push(<InlineFootnote key={`${keyPrefix}-footnote-${index}`} marker={character} text={symbolicFootnote.text} />);
      index += 1;
      continue;
    }

    const doubleDelimiter = text.startsWith("**", index)
      ? "**" as const
      : text.startsWith("__", index)
        ? "__" as const
        : null;
    if (doubleDelimiter) {
      const close = findClosingDelimiter(text, doubleDelimiter, index + 2);
      if (close >= 0) {
        nodes.push(
          <strong key={`${keyPrefix}-strong-${index}`}>
            {renderMarkdownInline(text.slice(index + 2, close), footnotes, `${keyPrefix}-strong-${index}`)}
          </strong>,
        );
        index = close + 2;
        continue;
      }
    }

    if (character === "*" || character === "_") {
      const insideWord = isAlphaNumeric(text[index - 1]) && isAlphaNumeric(text[index + 1]);
      if (insideWord) {
        pushText(nodes, character);
        index += 1;
        continue;
      }

      const close = !/\s/.test(text[index + 1] ?? "")
        ? findClosingDelimiter(text, character, index + 1)
        : -1;
      if (close >= 0) {
        nodes.push(
          <em key={`${keyPrefix}-em-${index}`}>
            {renderMarkdownInline(text.slice(index + 1, close).trimEnd(), footnotes, `${keyPrefix}-em-${index}`)}
          </em>,
        );
        if (/\s/.test(text[close - 1] ?? "")) pushText(nodes, " ");
        index = close + 1;
        continue;
      }

      if (character === "*" && symbolicFootnote && isTerminalAsteriskFootnoteReference(text, index)) {
        nodes.push(<InlineFootnote key={`${keyPrefix}-footnote-${index}`} marker="*" text={symbolicFootnote.text} />);
        index += 1;
        continue;
      }

      const surroundedBySpace = /\s/.test(text[index - 1] ?? " ") && /\s/.test(text[index + 1] ?? " ");
      pushText(nodes, surroundedBySpace ? "×" : "");
      index += 1;
      continue;
    }

    pushText(nodes, character);
    index += 1;
  }

  return nodes;
}
