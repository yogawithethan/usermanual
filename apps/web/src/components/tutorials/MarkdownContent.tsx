import type { ReactNode } from "react";

interface MarkdownContentProps {
  blockClassName?: string;
  blocks: string[];
  imageClassName?: string;
}

function splitInline(text: string): ReactNode[] {
  const pattern = /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[\^[^\]]+\])/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    const token = match[0];
    const key = `${match.index}-${token}`;
    const imageMatch = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    const footnoteMatch = token.match(/^\[\^([^\]]+)\]$/);

    if (imageMatch) {
      nodes.push(
        <img
          alt={imageMatch[1]}
          className="shape-frame my-5 w-full object-cover shadow-[0_14px_34px_rgba(12,19,45,0.10)]"
          key={key}
          src={imageMatch[2]}
        />,
      );
    } else if (linkMatch) {
      nodes.push(
        <a
          className="font-bold underline decoration-current/35 underline-offset-4"
          href={linkMatch[2]}
          key={key}
          rel="noreferrer"
          target={linkMatch[2].startsWith("/") || linkMatch[2].startsWith("#") ? undefined : "_blank"}
        >
          {splitInline(linkMatch[1])}
        </a>,
      );
    } else if (token.startsWith("**") || token.startsWith("__")) {
      nodes.push(<strong key={key}>{splitInline(token.slice(2, -2))}</strong>);
    } else if (token.startsWith("*") || token.startsWith("_")) {
      nodes.push(<em key={key}>{splitInline(token.slice(1, -1))}</em>);
    } else if (footnoteMatch) {
      nodes.push(
        <sup className="font-bold" key={key}>
          {footnoteMatch[1]}
        </sup>,
      );
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

function inlineWithBreaks(text: string): ReactNode[] {
  return text.split("\n").flatMap((line, index) => {
    const nodes = splitInline(line);
    return index === 0 ? nodes : [<br key={`br-${index}`} />, ...nodes];
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
      {match[1] ? (
        <figcaption className="mt-3 text-center text-[13px] leading-5 text-[#64748B]">
          {match[1]}
        </figcaption>
      ) : null}
    </figure>
  );
}

function headingBlock(block: string, key: string) {
  const match = block.match(/^(#{1,4})\s+(.+)$/);
  if (!match) return null;

  const level = match[1].length;
  const text = match[2].trim();
  const nodes = splitInline(text);

  if (level === 1) {
    return <h1 className="mt-10 text-[34px] font-black leading-tight text-[#111111] md:text-[42px]" key={key}>{nodes}</h1>;
  }
  if (level === 2) {
    return <h2 className="mt-8 text-[28px] font-black leading-tight text-[#111111] md:text-[34px]" key={key}>{nodes}</h2>;
  }
  if (level === 3) {
    return <h3 className="mt-7 text-[23px] font-black leading-tight text-[#111111] md:text-[28px]" key={key}>{nodes}</h3>;
  }
  return <h4 className="mt-6 text-[19px] font-black leading-tight text-[#111111] md:text-[23px]" key={key}>{nodes}</h4>;
}

function listBlock(block: string, key: string) {
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return null;

  const unordered = lines.every((line) => /^[-*]\s+/.test(line));
  if (unordered) {
    return (
      <ul className="my-5 list-disc space-y-2 pl-6" key={key}>
        {lines.map((line, index) => (
          <li key={`${key}-li-${index}`}>{splitInline(line.replace(/^[-*]\s+/, ""))}</li>
        ))}
      </ul>
    );
  }

  const ordered = lines.every((line) => /^\d+[.)]\s+/.test(line));
  if (ordered) {
    return (
      <ol className="my-5 list-decimal space-y-2 pl-6" key={key}>
        {lines.map((line, index) => (
          <li key={`${key}-li-${index}`}>{splitInline(line.replace(/^\d+[.)]\s+/, ""))}</li>
        ))}
      </ol>
    );
  }

  return null;
}

function quoteBlock(block: string, key: string) {
  const lines = block.split("\n").map((line) => line.trim());
  if (!lines.every((line) => line.startsWith(">"))) return null;

  return (
    <blockquote
      className="my-6 border-l-4 border-current/25 pl-5 italic text-current/85"
      key={key}
    >
      {inlineWithBreaks(lines.map((line) => line.replace(/^>\s?/, "")).join("\n"))}
    </blockquote>
  );
}

function ruleBlock(block: string, key: string) {
  return /^-{3,}$/.test(block.trim()) ? <hr className="my-9 border-current/15" key={key} /> : null;
}

export function MarkdownContent({
  blockClassName,
  blocks,
  imageClassName,
}: MarkdownContentProps) {
  return (
    <>
      {blocks.map((block, index) => {
        const trimmed = String(block || "").trim();
        if (!trimmed) return null;

        const image = imageBlock(trimmed, imageClassName);
        if (image) {
          return <div key={`${index}-${trimmed.slice(0, 20)}`}>{image}</div>;
        }

        const key = `${index}-${trimmed.slice(0, 20)}`;
        return (
          image ||
          headingBlock(trimmed, key) ||
          listBlock(trimmed, key) ||
          quoteBlock(trimmed, key) ||
          ruleBlock(trimmed, key) ||
          <p className={blockClassName} key={key}>
            {inlineWithBreaks(trimmed)}
          </p>
        );
      })}
    </>
  );
}
