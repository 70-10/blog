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
          <span>
            <Link to={path}>{node.title}</Link>
          </span>
          <br />
          <small>
            <time dateTime={dateDash} title={dateDash}>
              {dateSlash}
            </time>
          </small>
        </div>
      </div>
    </article>
  );
};
