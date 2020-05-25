import React, { FC } from "react";
import { graphql } from "gatsby";
import Layout from "../layouts/defaultLayout";
import ShareButtons from "../components/share-buttons";
import Img from "gatsby-image";
import Helmet from "react-helmet";
import moment from "../moment";
import Tags from "../components/tags";
import { ArticleQuery } from "../../types/graphql-types";

const Column: FC = ({ children }) => (
  <div className="columns is-centered">
    <div className="column is-8">{children}</div>
  </div>
);

type Props = {
  data: ArticleQuery;
  location: {
    href: string;
  };
};

const Article: FC<Props> = ({ data, location }) => {
  const {
    title,
    tags,
    heroImage,
    eyecatch,
    body,
    publishDate,
  } = data.contentfulArticle!;

  return (
    <>
      <Layout>
        <Helmet>
          <meta itemProp="name" content={title} />
          <meta itemProp="description" content="Blog at 70-10.net" />
          {eyecatch?.file?.url ? (
            <meta itemProp="image" content={`https:${eyecatch.file.url}`} />
          ) : null}
          <meta property="og:url" content={location.href} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={title} />
          {eyecatch?.file?.url && (
            <meta property="og:image" content={`https:${eyecatch.file.url}`} />
          )}
          {/* <meta property="og:description" content={title} /> */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          {eyecatch?.file?.url && (
            <meta name="twitter:image" content={`https:${eyecatch.file.url}`} />
          )}
          {/* <meta name="twitter:description" content={title} /> */}

          <title>{title}</title>
        </Helmet>

        <section className="hero">
          <div className="hero-body">
            <Column>
              <h1 className="title">{title}</h1>
            </Column>
            <Column>
              <div className="subtitle">
                <p className="is-size-6">
                  最終更新日時：{" "}
                  {moment(publishDate).format("YYYY/MM/DD HH:mm")}
                </p>
              </div>
              {tags ? <Tags tags={tags} /> : null}
              <hr />
            </Column>

            {heroImage && (
              <Column>
                <Img fluid={heroImage.fluid} />
              </Column>
            )}

            <Column>
              <div
                className="content"
                dangerouslySetInnerHTML={{
                  __html: body?.childMarkdownRemark?.html!,
                }}
              />
            </Column>
          </div>
        </section>
        <section className="section">
          <ShareButtons title={title} url={location.href} />
        </section>
      </Layout>
    </>
  );
};
export default Article;

export const query = graphql`
  query Article($slug: String!) {
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
