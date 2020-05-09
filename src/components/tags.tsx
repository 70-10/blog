import React, { FC } from "react";
import { Link } from "gatsby";
import { Maybe } from "../../types/graphql-types";

type Props = {
  tags: Maybe<string>[];
};

const Tags: FC<Props> = ({ tags }) => (
  <div className="tags">
    {tags.map((tag) => (
      <Link
        key={tag!}
        to={`/tags/${tag}`}
        className="tag is-warning has-text-weight-bold"
      >
        {`#${tag}`}
      </Link>
    ))}
  </div>
);

export default Tags;
