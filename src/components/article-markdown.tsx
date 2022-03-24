import "github-markdown-css";
import "prismjs/themes/prism.css";
import React, { FC } from "react";
import "./article-markdown.css";

interface Props {
  __html: string;
}

const ArticleMarkdown: FC<Props> = ({ __html }) => {
  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{
        __html,
      }}
    />
  );
};

export default ArticleMarkdown;
