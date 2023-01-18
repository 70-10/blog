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
    {Array.from(
      {
        length: new Set(
          articles.map(({ node }) => {
            if (!node.publishDate) {
              return null;
            }

            return cdate(node.publishDate).format("YYYY");
          })
        ).size,
      },
      (_, i) => {
        const targetYear = cdate().add(-i, "year").format("YYYY");
        return (
          <div key={i} className={styles.item}>
            <p className={styles.year}>{targetYear}</p>
            <p className={styles.article_count}>
              {
                articles.filter(
                  ({ node }) =>
                    node.publishDate &&
                    cdate(node.publishDate).format("YYYY") === targetYear
                ).length
              }
            </p>
          </div>
        );
      }
    )}
  </nav>
);

export default Level;
