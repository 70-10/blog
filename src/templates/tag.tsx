import { graphql } from "gatsby";
import React, { FC } from "react";
import * as styles from "./tag.module.css";
import Article from "../components/article";
import Layout from "../layouts/defaultLayout";
import { display } from "../tag-helper";

type Props = {
  data: GatsbyTypes.TagQuery;
  pageContext: {
    tag: string;
  };
};

const Tag: FC<Props> = ({ data, pageContext }) => (
  <Layout>
    <section className={styles.container}>
      <div className={styles.section_title}>
        <span className={styles.tag}>{display(pageContext.tag)}</span>
      </div>
      <div className={styles.section_articles}>
        {data.allContentfulArticle.edges
          .filter(
            ({ node }) => !!node.tags && node.tags.includes(pageContext.tag)
          )
          .map(({ node }) => {
            return (
              <div className={styles.article} key={node.slug}>
                <Article node={node} />
              </div>
            );
          })}
      </div>
    </section>
  </Layout>
);

export default Tag;

export const query = graphql`
  query Tag {
    allContentfulArticle(sort: { publishDate: DESC }) {
      edges {
        node {
          title
          slug
          publishDate
          tags
        }
      }
    }
  }
`;
