import assert from "assert";
import { graphql } from "gatsby";
import Img from "gatsby-image";
import React, { FC } from "react";
import Helmet from "react-helmet";
import { ArticleQuery } from "../../types/graphql-types";
import ShareButtons from "../components/share-buttons";
import Tags from "../components/tags";
import Layout from "../layouts/defaultLayout";
import moment from "../moment";
import styles from "./article.module.css";

type Props = {
  data: ArticleQuery;
  location: {
    href: string;
    origin: string;
  };
  pageContext: {
    ogImage: {
      path: string;
      size: {
        width: number;
        height: number;
      };
    };
  };
};

const Article: FC<Props> = ({ data, location, pageContext }) => {
  assert(data.contentfulArticle);

  const {
    title,
    tags,
    heroImage,
    body,
    publishDate,
    updatedAt,
  } = data.contentfulArticle;

  return (
    <>
      <Layout>
        <Helmet>
          <meta itemProp="name" content={title || ""} />
          <meta property="og:description" content="Blog at 70-10.net" />
          {/* {eyecatch?.file?.url ? (
            <meta itemProp="image" content={`https:${eyecatch.file.url}`} />
          ) : null} */}
          <meta property="og:url" content={location.href} />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={title || ""} />
          <meta
            property="og:image"
            content={location.origin + pageContext.ogImage.path}
          />
          {/* <meta property="og:description" content={title} /> */}
          <meta name="twitter:card" content="summary_large_image" />
          {/* <meta name="twitter:title" content={title || ""} /> */}
          {/* {eyecatch?.file?.url && (
            <meta name="twitter:image" content={`https:${eyecatch.file.url}`} />
          )} */}
          {/* <meta name="twitter:description" content={title} /> */}

          <title>{title}</title>
        </Helmet>

        <section>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.head}>
            <p className={styles.head_text}>
              記事作成日時： {moment(publishDate).format("YYYY/MM/DD HH:mm")}
            </p>
            <p className={styles.head_text}>
              最終更新日時： {moment(updatedAt).format("YYYY/MM/DD HH:mm")}
            </p>
            <div> {tags ? <Tags tags={tags} /> : null}</div>
          </div>
          <hr className={styles.head_line} />
          {heroImage && (
            <div className={styles.head_hero}>
              <Img fluid={heroImage.fluid} />
            </div>
          )}
        </section>

        <div
          className={styles.article}
          dangerouslySetInnerHTML={{
            __html: body?.childMarkdownRemark?.html || "",
          }}
        />
        <div className={styles.buttons}>
          <ShareButtons title={title || ""} url={location.href} />
        </div>
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
        siteUrl
      }
    }
    contentfulArticle(slug: { eq: $slug }) {
      title
      tags
      updatedAt
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
