import React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/layout";
import Img from "gatsby-image";

export default ({
  data: {
    contentfulArticle: { title, tags, heroImage, body }
  },
  location
}) => (
  <Layout location={location}>
    <div className="columns">
      <div className="column">
        <h1 className="title">{title}</h1>
        {tags ? <Tags tags={tags} /> : null}
      </div>
    </div>
    {heroImage ? (
      <div className="columns">
        <div className="column">
          <Img fluid={heroImage.fluid} />
        </div>
      </div>
    ) : null}
    <div
      className="content"
      dangerouslySetInnerHTML={{
        __html: body.childMarkdownRemark.html
      }}
    />
  </Layout>
);

const Tags = ({ tags }) => (
  <div class="tags">
    {tags.map(tag => (
      <Link to={`/tags/${tag}`} className="tag is-warning">
        {tag}
      </Link>
    ))}
  </div>
);

export const query = graphql`
  query($slug: String!) {
    contentfulArticle(slug: { eq: $slug }) {
      title
      tags
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
