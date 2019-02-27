import React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/layout";
import dayjs from "dayjs";

export default ({ data: { allContentfulArticle } }) => (
  <Layout>
    <h1 className="title blog-title">MNML</h1>
    <ul>
      {allContentfulArticle.edges.map(({ node }) => (
        <li>
          <Link to={`/articles/${node.slug}/`}>
            {dayjs(node.publishDate).format("YYYY-MM-DD")} {node.title}
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
