import { graphql, Link } from "gatsby";
import countBy from "lodash.countby";
import React, { FC } from "react";
import * as styles from "./dashboard.module.css";
import Level from "../components/level";
import Layout from "../layouts/defaultLayout";
import { display } from "../tag-helper";

type Props = {
  data: GatsbyTypes.DashboardQuery;
};

const DashboardPage: FC<Props> = ({
  data: {
    allContentfulArticle: { edges },
  },
}) => {
  return (
    <Layout>
      <p className={styles.title}>
        <Link to="/">ブログ</Link>の統計情報をまとめたページです
      </p>
      <Line />
      <Contents title="記事数">
        <Level articles={edges} />
      </Contents>
      <Line />
      <Contents title="タグ一覧">
        <Tags edges={edges} />
      </Contents>
    </Layout>
  );
};

const Line: FC = () => <hr className={styles.line} />;

const Contents: FC<{ title: string }> = ({ title, children }) => (
  <section className={styles.content}>
    <h2 className={styles.subtitle}>{title}</h2>
    <div className={styles.column}>{children}</div>
  </section>
);

export default DashboardPage;

const Tags = ({ edges }) => {
  const tags = Object.assign(
    {},
    ...Object.entries(
      countBy(
        edges
          .map(({ node }) => node.tags)
          .flat()
          .sort()
          .filter((tag) => !!tag)
      )
    )
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .map(([x, y]) => ({ [x]: y }))
  );

  return (
    <div>
      {Object.keys(tags).map((tag) => (
        <div key={tag} className={styles.tag}>
          <Link to={`/tags/${tag}`} className={styles.tag_content}>
            <span className={styles.tag_name}>{display(tag)}</span>
            <span className={styles.tag_count}>{tags[tag]}</span>
          </Link>
        </div>
      ))}
    </div>
  );
};

export const query = graphql`
  query Dashboard {
    allContentfulArticle(sort: { publishDate: DESC }) {
      edges {
        node {
          id
          title
          slug
          publishDate
          tags
        }
      }
    }
  }
`;
