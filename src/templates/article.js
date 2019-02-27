import React from "react";
import { graphql } from "gatsby";
export default ({ data }) => (
  <div>
    <h1>{data.contentfulArticle.title}</h1>
    <div
      dangerouslySetInnerHTML={{
        __html: data.contentfulArticle.body.childMarkdownRemark.html
      }}
    />
  </div>
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
