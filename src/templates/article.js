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
    <Footer />
  </Layout>
);

const Tags = ({ tags }) => (
  <div className="tags">
    {tags.map(tag => (
      <Link to={`/tags/${tag}`} className="tag is-warning">
        {tag}
      </Link>
    ))}
  </div>
);

const Footer = () => (
  <footer className="footer">
    <article className="media">
      <figure className="media-left">
        <p className="image is-64x64">
          <img src="/icon.jpg" alt="Icon" />
        </p>
      </figure>
      <div className="media-content">
        <div className="content">
          <p>
            written by{" "}
            <strong>
              <a
                href="https://twitter.com/70_10"
                target="_blank"
                rel="noopener noreferrer"
              >
                70_10
              </a>
            </strong>
          </p>
        </div>
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li>
              <a
                href="https://twitter.com/70_10"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
            </li>
            <li>
              <a
                href="https://github.com/70-10"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://qiita.com/70_10"
                target="_blank"
                rel="noopener noreferrer"
              >
                Qiita
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </article>
  </footer>
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
