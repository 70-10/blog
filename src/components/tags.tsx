import React, { SFC } from "react";
import { Link } from "gatsby";

type Props = {
  tags: string[];
};

const Tags: SFC<Props> = ({ tags }) => (
  <div className="tags">
    {tags.map(tag => (
      <Link to={`/tags/${tag}`} className="tag is-warning">
        {tag}
      </Link>
    ))}
  </div>
);

export default Tags;
