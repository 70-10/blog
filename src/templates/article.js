import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";

export default ({ data, location }) => (
  <Layout location={location}>
    <h1 className="title">{data.contentfulArticle.title}</h1>
    <div
      className="content"
      dangerouslySetInnerHTML={{
        __html: data.contentfulArticle.body.childMarkdownRemark.html
      }}
    />
  </Layout>
);
export const query = graphql`
  query($slug: String!) {
    contentfulArticle(slug: { eq: $slug }) {
      title
      publishDate
      body {
        childMarkdownRemark {
          html
        }
      }
    }
  }
`;
