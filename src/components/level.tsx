import { cdate } from "cdate";
import React from "react";
import * as styles from "./level.module.css";

type Props = {
  articles: {
    node: Pick<
      GatsbyTypes.ContentfulArticle,
      "title" | "id" | "slug" | "publishDate" | "tags"
    >;
  }[];
};

const Level: React.FC<Props> = ({ articles }) => (
  <nav className={styles.section}>
    <div className={styles.item}>
      <p className={styles.year}>All</p>
      <p className={styles.article_count}>{articles.length}</p>
    </div>
    {Array.from({ length: 5 }, (_, i) => {
      const targetYear = cdate()
        .add(i * -1, "year")
        .format("YYYY");
      return (
        <div key={i} className={styles.item}>
          <p className={styles.year}>{targetYear}</p>
          <p className={styles.article_count}>
            {
              articles.filter(({ node }) => {
                const first = cdate(`${targetYear}-01-01 00:00:00`);
                const last = cdate(`${targetYear}-12-31 23:59:59`);

                const target = cdate(node.publishDate!);
                return first <= target && target <= last;
              }).length
            }
          </p>
        </div>
      );
    })}
  </nav>
);

export default Level;
