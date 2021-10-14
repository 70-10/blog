import React, { FC } from "react";
import moment from "../moment";
import * as styles from "./level.module.css";

type Props = {
  articles: {
    node: Pick<
      GatsbyTypes.ContentfulArticle,
      "title" | "id" | "slug" | "publishDate" | "tags"
    >;
  }[];
};

const Level: FC<Props> = ({ articles }) => (
  <nav className={styles.section}>
    <div className={styles.item}>
      <p className={styles.year}>All</p>
      <p className={styles.article_count}>{articles.length}</p>
    </div>
    {Array.from({ length: 5 }, (_, i) => {
      const targetYear = moment().subtract(i, "year").format("YYYY");
      return (
        <div key={i} className={styles.item}>
          <p className={styles.year}>{targetYear}</p>
          <p className={styles.article_count}>
            {
              articles.filter(({ node }) => {
                const range = createRange(targetYear);
                return range.contains(moment(node.publishDate));
              }).length
            }
          </p>
        </div>
      );
    })}
  </nav>
);

export default Level;

function createRange(year) {
  return moment.range(
    moment(`${year}-01-01 00:00:00`, "YYYY-MM-DD HH:mm:ss"),
    moment(`${year}-12-31 23:59:59`, "YYYY-MM-DD HH:mm:ss")
  );
}
