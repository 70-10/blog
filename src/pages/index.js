import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import Article from "../components/article";

export default ({ data: { allContentfulArticle }, location }) => (
  <Layout location={location}>
    <div className="columns">
      <div className="column">
        {allContentfulArticle.edges.map(({ node }) => (
          <Article node={node} />
        ))}
      </div>
    </div>
  </Layout>
);

export const query = graphql`
  query {
    allContentfulArticle(sort: { fields: publishDate, order: DESC }) {
      edges {
        node {
          id
          title
          slug
          publishDate
        }
      }
    }
  }
`;
