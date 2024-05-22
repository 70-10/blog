interface TableOfContent {
  level: number;
  text: string;
  id: string;
}

// 目次を生成するためのヘルパー関数
const generateToc = (markdownContent: string): TableOfContent[] => {
  const headers = markdownContent.match(/(#+ .+)/g) || [];
  return headers.map((header) => {
    const level = header.split(" ")[0].length;
    const text = header.replace(/(#+ )/, "");
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return { level, text, id };
  });
};

interface TocItem {
  level: number;
  text: string;
  id: string;
  children: TocItem[];
}

const buildTocHierarchy = (toc: TableOfContent[]) => {
  const hierarchy: TocItem[] = [];
  const stack = [{ children: hierarchy }];

  toc.forEach((item) => {
    const level = item.level;
    while (stack.length > level) {
      stack.pop();
    }

    const newItem = { ...item, children: [] };
    stack[stack.length - 1].children.push(newItem);
    stack.push(newItem);
  });

  return hierarchy;
};

const renderToc = (items: TocItem[]) => {
  if (!items.length) return null;

  return (
    <ul className="list-outside list-disc space-y-2 ps-6">
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`}>{item.text}</a>
          {renderToc(item.children)}
        </li>
      ))}
    </ul>
  );
};

const TableOfContents = ({ markdownContent }: { markdownContent: string }) => {
  const generatedToc = generateToc(markdownContent);

  return (
    <nav className="toc">{renderToc(buildTocHierarchy(generatedToc))}</nav>
  );
};

export default TableOfContents;
