import { Fragment } from "react";

type MarkdownProps = {
  content: string;
};

const renderBlock = (block: string, index: number) => {
  const lines = block.split("\n").filter(Boolean);
  if (lines.length === 0) {
    return null;
  }

  const headingMatch = lines[0].match(/^(#{1,3})\s+(.*)/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    const text = headingMatch[2];
    const Tag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
    return <Tag key={`h-${index}`}>{text}</Tag>;
  }

  const isList = lines.every((line) => line.trim().startsWith("- "));
  if (isList) {
    return (
      <ul key={`ul-${index}`}>
        {lines.map((line, lineIndex) => (
          <li key={`${index}-li-${lineIndex}`}>
            {line.replace(/^-\s+/, "")}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p key={`p-${index}`}>
      {lines.map((line, lineIndex) => (
        <Fragment key={`${index}-p-${lineIndex}`}>
          {line}
          {lineIndex < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </p>
  );
};

export default function Markdown({ content }: MarkdownProps) {
  const blocks = content.split("\n\n");
  return (
    <div className="markdown">
      {blocks.map((block, index) => renderBlock(block.trim(), index))}
    </div>
  );
}
