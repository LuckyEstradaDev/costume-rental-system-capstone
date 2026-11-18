import {Fragment} from "react";
import {cn} from "@/lib/utils";

type Block =
  | {type: "heading"; level: 1 | 2 | 3; text: string}
  | {type: "paragraph"; lines: string[]}
  | {type: "list"; items: string[]};

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({type: "paragraph", lines: paragraph});
      paragraph = [];
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";

    if (line.trim() === "") {
      flushParagraph();
      continue;
    }

    const headingMatch = /^(#{1,3})\s+(.*)$/.exec(line);
    if (headingMatch) {
      flushParagraph();
      blocks.push({
        type: "heading",
        level: (headingMatch[1]?.length ?? 1) as 1 | 2 | 3,
        text: headingMatch[2] ?? "",
      });
      continue;
    }

    const itemMatch = /^\s*[-*]\s+(.*)$/.exec(line);
    if (itemMatch) {
      flushParagraph();
      const items: string[] = [];

      while (index < lines.length) {
        const currentMatch = /^\s*[-*]\s+(.*)$/.exec(lines[index] ?? "");
        if (!currentMatch) break;
        items.push(currentMatch[1] ?? "");
        index += 1;
      }

      index -= 1;
      blocks.push({type: "list", items});
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return blocks;
}

function renderInline(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }

      return <Fragment key={index}>{part}</Fragment>;
    });
}

const HEADING_CLASSES: Record<1 | 2 | 3, string> = {
  1: "text-2xl font-bold tracking-tight text-primary",
  2: "pt-4 text-lg font-semibold text-primary",
  3: "pt-2 text-base font-semibold text-foreground",
};

export function LegalDocument({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) {
  const blocks = parseBlocks(markdown);

  return (
    <article className={cn("space-y-3", className)}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Heading = `h${block.level}` as "h1" | "h2" | "h3";

          return (
            <Heading key={index} className={HEADING_CLASSES[block.level]}>
              {renderInline(block.text)}
            </Heading>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={index}
              className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground"
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p
            key={index}
            className="text-sm leading-relaxed text-muted-foreground"
          >
            {block.lines.map((line, lineIndex) => {
              const isLastLine = lineIndex === block.lines.length - 1;
              const hardBreak = /\s{2,}$/.test(line);

              return (
                <Fragment key={lineIndex}>
                  {renderInline(line.trim())}
                  {!isLastLine && (hardBreak ? <br /> : " ")}
                </Fragment>
              );
            })}
          </p>
        );
      })}
    </article>
  );
}
