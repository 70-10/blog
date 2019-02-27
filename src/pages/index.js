import React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/layout";

export default ({ data: { allContentfulArticle } }) => (
  <Layout>
    <h1 className="title blog-title">MNML</h1>
    <ul>
      {allContentfulArticle.edges.map(({ node }) => (
        <li>
          <Link to={`/articles/${node.slug}/`}>
            {node.publishDate}: {node.title}
          </Link>
        </li>
      ))}
    </ul>
  </Layout>
);

export const query = graphql`
  query {
    allContentfulArticle {
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
