import React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/layout";
import dayjs from "dayjs";

export default ({ data: { allContentfulArticle }, location }) => (
  <Layout location={location}>
    <ul>
      {allContentfulArticle.edges.map(({ node }) => (
        <li key={node.id}>
          <Link
            to={`/${dayjs(node.publishDate).format("YYYY/MM/DD")}/${
              node.slug
            }/`}
          >
            {dayjs(node.publishDate).format("YYYY-MM-DD")} {node.title}
          </Link>
        </li>
      ))}
    </ul>
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
