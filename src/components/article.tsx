import React, { FC } from "react";
import { Link } from "gatsby";
import moment from "../moment";
import { ContentfulArticle } from "../../types/graphql-types";

type Props = {
  node: Pick<ContentfulArticle, "title" | "slug" | "publishDate">;
};

const Container: FC<Props> = ({ node }) => {
  const publishDate = moment(node.publishDate);
  const dateSlash = publishDate.format("YYYY/MM/DD");
  const dateDash = publishDate.format("YYYY-MM-DD");
  const path = `/${dateSlash}/${node.slug}/`;

  return (
    <article className="media">
      <Link to={path}>
        <div className="media-content">
          <p className="is-size-5 has-text-weight-semibold">{node.title}</p>
          <time
            dateTime={dateDash}
            title={dateDash}
            className="is-size-6 has-text-grey"
          >
            {dateSlash}
          </time>
        </div>
      </Link>
    </article>
  );
};

export default Container;
