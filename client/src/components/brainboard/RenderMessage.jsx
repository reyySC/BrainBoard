// Renders LLM markdown (bold, bullets, numbered lists, headers) + clickable URLs
export default function RenderMessage({ text, isUser }) {
  const linkColor = isUser ? "#93C5FD" : "#2563EB";

  function renderInline(str, keyPrefix) {
    const tokens = [];
    const inlineRegex = /(https?:\/\/[^\s),]+)|\*\*(.+?)\*\*/g;
    let last = 0;
    let match;
    while ((match = inlineRegex.exec(str)) !== null) {
      if (match.index > last) tokens.push(<span key={`${keyPrefix}-${last}`}>{str.slice(last, match.index)}</span>);
      if (match[1]) {
        tokens.push(
          <a key={`${keyPrefix}-${match.index}`} href={match[1]} target="_blank" rel="noopener noreferrer"
            style={{ color: linkColor, textDecoration: "underline", wordBreak: "break-all" }}
            onClick={(e) => e.stopPropagation()}>{match[1]}</a>
        );
      } else if (match[2]) {
        tokens.push(<strong key={`${keyPrefix}-${match.index}`}>{match[2]}</strong>);
      }
      last = match.index + match[0].length;
    }
    if (last < str.length) tokens.push(<span key={`${keyPrefix}-${last}`}>{str.slice(last)}</span>);
    return tokens;
  }

  const lines = text.split("\n");
  const elements = [];
  let listItems = [];
  let listType = null;

  function flushList() {
    if (listItems.length === 0) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    elements.push(
      <Tag key={`list-${elements.length}`} style={{ margin: "4px 0", paddingLeft: 20, fontSize: 13, lineHeight: 1.6 }}>
        {listItems.map((li, j) => <li key={j} style={{ marginBottom: 2 }}>{renderInline(li, `li-${elements.length}-${j}`)}</li>)}
      </Tag>
    );
    listItems = [];
    listType = null;
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/);
    if (bulletMatch) {
      if (listType === "ol") flushList();
      listType = "ul";
      listItems.push(bulletMatch[1]);
      return;
    }

    const numMatch = trimmed.match(/^\d+[.)]\s+(.+)/);
    if (numMatch) {
      if (listType === "ul") flushList();
      listType = "ol";
      listItems.push(numMatch[1]);
      return;
    }

    flushList();

    if (!trimmed) {
      elements.push(<div key={`br-${i}`} style={{ height: 6 }} />);
      return;
    }

    const headerMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const sizes = { 1: 15, 2: 14, 3: 13 };
      elements.push(
        <div key={`h-${i}`} style={{ fontSize: sizes[level] || 13, fontWeight: 700, color: isUser ? "white" : "var(--navy)", marginTop: 6, marginBottom: 2 }}>
          {renderInline(headerMatch[2], `h-${i}`)}
        </div>
      );
      return;
    }

    elements.push(
      <div key={`p-${i}`} style={{ marginBottom: 2 }}>
        {renderInline(trimmed, `p-${i}`)}
      </div>
    );
  });

  flushList();

  return <div>{elements}</div>;
}
