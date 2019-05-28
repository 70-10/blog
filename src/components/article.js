import React from "react";
import { Link } from "gatsby";
import moment from "../moment";

export default ({ node }) => {
  const publishDate = moment(node.publishDate);
  const dateSlash = publishDate.format("YYYY/MM/DD");
  const dateDash = publishDate.format("YYYY-MM-DD");
  const path = `/${dateSlash}/${node.slug}/`;

  return (
    <article className="media">
      <div className="media-content">
        <div className="content">
          <small>
            <time dateTime={dateDash} title={dateDash}>
              {dateSlash}
            </time>
          </small>
          <p>
            <Link to={path}>{node.title}</Link>
          </p>
        </div>
      </div>
    </article>
  );
};
