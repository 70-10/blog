import { graphql } from "gatsby";
import React, { FC } from "react";
import Helmet from "react-helmet";
import ArticleMarkdown from "../components/article-markdown";
import ShareButtons from "../components/share-buttons";
import Tags from "../components/tags";
import Layout from "../layouts/defaultLayout";
import moment from "../moment";
import * as styles from "./article.module.css";

type Props = {
  data: GatsbyTypes.ArticleQuery;
  location: {
    href: string;
  };
};

const Article: FC<Props> = ({ data, location }) => {
  const { title, tags, body, publishDate, updatedAt } = data.contentfulArticle;

  return (
    <>
      <Layout>
        <Helmet>
          <meta itemProp="name" content={title || ""} />
          <meta itemProp="description" content="Blog at 70-10.net" />
          <meta property="og:url" content={location.href} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={title || ""} />
          {/* <meta property="og:description" content={title} /> */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title || ""} />
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
        </section>

        <section className={styles.article_section}>
          <ArticleMarkdown __html={body?.childMarkdownRemark?.html || ""} />
          <div className={styles.buttons}>
            <ShareButtons title={title || ""} url={location.href} />
          </div>
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
      updatedAt
      publishDate
      body {
        childMarkdownRemark {
          html
          tableOfContents
        }
      }
    }
  }
`;
