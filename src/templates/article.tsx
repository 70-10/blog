import React, { SFC } from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import ShareButtons from "../components/share-buttons";
import Img, { FluidObject } from "gatsby-image";
import Helmet from "react-helmet";
import moment from "../moment";
import Tags from "../components/tags";
import Footer from "../components/footer";

type Data = {
  site: {
    siteMetadata: {
      title: string;
    };
  };
  contentfulArticle: {
    title: string;
    tags: string[];
    publishDate: string;
    heroImage: {
      fluid: FluidObject;
    };
    eyecatch: {
      file: {
        url: string;
      };
    };
    body: {
      childMarkdownRemark: {
        html: string;
      };
    };
  };
};

type Props = {
  data: Data;
  location: {
    href: string;
  };
};

const Article: SFC<Props> = ({
  data: {
    site: { siteMetadata },
    contentfulArticle: { title, tags, heroImage, eyecatch, body, publishDate }
  },
  location
}) => (
  <>
    <Layout>
      <Head
        location={location}
        title={`${title} | ${siteMetadata.title}`}
        eyecatch={eyecatch}
      />
      <div className="columns">
        <div className="column">
          <h2 className="subtitle is-size-6">
            {moment(publishDate).format("YYYY/MM/DD")}
          </h2>
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

      <ShareButtons title={title} url={location.href} />
    </Layout>
    <Footer />
  </>
);
export default Article;

const Head = ({ location, title, eyecatch }) => (
  <Helmet>
    <meta itemProp="name" content={title} />
    <meta itemProp="description" content="Blog at 70-10.net" />
    {eyecatch ? (
      <meta itemProp="image" content={`https:${eyecatch.file.url}`} />
    ) : null}
    <meta property="og:url" content={location.href} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    {/* <meta property="og:description" content={title} /> */}
    {eyecatch ? (
      <meta property="og:image" content={`https:${eyecatch.file.url}`} />
    ) : null}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    {/* <meta name="twitter:description" content={title} /> */}
    {eyecatch ? (
      <meta name="twitter:image" content={`https:${eyecatch.file.url}`} />
    ) : null}
    <title>{title}</title>
  </Helmet>
);

export const query = graphql`
  query($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    contentfulArticle(slug: { eq: $slug }) {
      title
      tags
      publishDate
      heroImage {
        fluid(maxWidth: 960) {
          ...GatsbyContentfulFluid_withWebp
        }
      }
      eyecatch: heroImage {
        file {
          url
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
