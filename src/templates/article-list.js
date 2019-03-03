import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import Article from "../components/article";
import Pagination from "../components/pagination";

export default ({ data, location, pageContext }) => (
  <Layout location={location}>
    {data.allContentfulArticle.edges.map(({ node }) => (
      <Article key={node.id} node={node} />
    ))}
    <section className="section">
      <Pagination pageContext={pageContext} />
    </section>
  </Layout>
);

export const query = graphql`
  query articleListQuery($skip: Int!, $limit: Int!) {
    all: allContentfulArticle(sort: { fields: publishDate, order: DESC }) {
      edges {
        node {
          slug
        }
      }
    }
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
