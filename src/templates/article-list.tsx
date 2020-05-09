import React, { FC } from "react";
import { graphql } from "gatsby";
import Layout from "../layouts/defaultLayout";
import Article from "../components/article";
import Pagination from "../components/pagination";
import { ArticleListQuery } from "../../types/graphql-types";

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
    <section className="hero">
      <div className="hero-body">
        <div className="columns">
          <div className="column is-8 is-offset-2">
            {data.allContentfulArticle.edges.map(({ node }) => (
              <Article key={node.slug!} node={node} />
            ))}
          </div>
        </div>
      </div>
    </section>
    <section className="section">
      <div className="columns">
        <div className="column is-8 is-offset-2">
          <Pagination pageContext={pageContext} />
        </div>
      </div>
    </section>
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
