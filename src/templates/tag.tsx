import React from "react";
import Layout from "../components/layout";
import { graphql } from "gatsby";
import Article from "../components/article";

export default ({ data, pageContext }) => (
  <Layout>
    <span className="title tag is-warning is-medium">{pageContext.tag}</span>

    {data.allContentfulArticle.edges
      .filter(({ node }) => !!node.tags && node.tags.includes(pageContext.tag))
      .map(({ node }) => (
        <Article key={node.slug} node={node} />
      ))}
  </Layout>
);

export const query = graphql`
  query {
    allContentfulArticle(sort: { fields: publishDate, order: DESC }) {
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
