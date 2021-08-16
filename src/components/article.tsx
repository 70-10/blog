import { Link } from "gatsby";
import React, { FC } from "react";
import { ContentfulArticle } from "../../types/graphql-types";
import moment from "../moment";
import styles from "./article.module.css";

type Props = {
  node: Pick<ContentfulArticle, "title" | "slug" | "publishDate">;
};

const Container: FC<Props> = ({ node }) => {
  const publishDate = moment(node.publishDate);
  const dateSlash = publishDate.format("YYYY/MM/DD");
  const dateDash = publishDate.format("YYYY-MM-DD");
  const path = `/${dateSlash}/${node.slug}/`;

  return (
    <Link to={path}>
      <time dateTime={dateDash} title={dateDash} className={styles.date}>
        {dateSlash}
      </time>
      <p className={styles.title}>{node.title}</p>
    </Link>
  );
};

export default Container;
