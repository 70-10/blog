import { graphql } from "gatsby";
import React, { FC } from "react";
import { ArticleListQuery } from "../../types/graphql-types";
import Article from "../components/article";
import Pagination from "../components/pagination";
import Layout from "../layouts/defaultLayout";
import * as styles from "./article-list.module.css";

type Context = {
  limit: number;
  skip: number;
  page: number;
  next: number;
  prev: number;
  pages: number;
};

type Props = {
  data: ArticleListQuery;
  pageContext: Context;
};

const ArticleList: FC<Props> = ({ data, pageContext }) => (
  <Layout>
    <div className={styles.container}>
      <div className={styles.articles}>
        {data.allContentfulArticle.edges.map(({ node }) => (
          <div className={styles.article} key={node.slug}>
            <Article node={node} />
          </div>
        ))}
      </div>
      <div className={styles.pagination}>
        <Pagination pageContext={pageContext} />
      </div>
    </div>
  </Layout>
);

export default ArticleList;

export const query = graphql`
  query ArticleList($skip: Int!, $limit: Int!) {
    allContentfulArticle(
      sort: { fields: publishDate, order: DESC }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          title
          slug
          publishDate
        }
      }
    }
  }
`;
