import React from "react";
import { graphql, Link } from "gatsby";

export default ({ data: { allContentfulArticle } }) => (
  <div>
    <h1>Home</h1>
    <ul>
      {allContentfulArticle.edges.map(({ node }) => (
        <li>
          <Link to={`/articles/${node.slug}/`}>{node.title}</Link>
        </li>
      ))}
    </ul>
  </div>
);

export const query = graphql`
  query {
    allContentfulArticle {
      edges {
        node {
          title
          slug
        }
      }
    }
  }
`;
