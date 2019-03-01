import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import Img from "gatsby-image";

export default ({ data, location }) => (
  <Layout location={location}>
    <div className="columns">
      <div className="column">
        <h1 className="title">{data.contentfulArticle.title}</h1>
      </div>
    </div>
    {data.contentfulArticle.heroImage ? (
      <div className="columns">
        <div className="column">
          <Img fluid={data.contentfulArticle.heroImage.fluid} />
        </div>
      </div>
    ) : null}
    <div className="columns">
      <div className="column">
        <div
          className="content"
          dangerouslySetInnerHTML={{
            __html: data.contentfulArticle.body.childMarkdownRemark.html
          }}
        />
      </div>
    </div>
  </Layout>
);
export const query = graphql`
  query($slug: String!) {
    contentfulArticle(slug: { eq: $slug }) {
      title
      publishDate
      heroImage {
        fluid(maxWidth: 960) {
          ...GatsbyContentfulFluid_withWebp
        }
      }
      body {
        childMarkdownRemark {
          html
        }
      }
    }
  }
`;
