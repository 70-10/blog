import React, { FC } from "react";
import { graphql, Link } from "gatsby";
import Layout from "../layouts/defaultLayout";
import countBy from "lodash.countby";
import CalendarHeatmap from "../components/calendar-heatmap";
import moment from "../moment";
import { display } from "../tag-helper";

const DashboardPage: FC = ({
  data: {
    allContentfulArticle: { edges },
  },
}) => {
  return (
    <Layout>
      <div className="columns is-centered">
        <div className="column is-8">
          <br />
          <p>
            <Link to="/">ブログ</Link>の統計情報をまとめたページです。
          </p>
          <hr />
          <h2 className="subtitle">記事数</h2>
          <Level articles={edges} />
          <hr />
          <h2 className="subtitle">過去1年間のポスト数</h2>
          <CalendarHeatmap values={buildHeatmapValues(edges)} />
          <hr />
          <h2 className="subtitle">タグ</h2>
          <Tags edges={edges} />
        </div>
      </div>
    </Layout>
  );
};

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
    <div className="field is-grouped is-grouped-multiline">
      {Object.keys(tags).map((tag) => (
        <div key={tag} className="control">
          <div className="tags has-addons">
            <Link to={`/tags/${tag}`}>
              <span className="tag">{display(tag)}</span>
              <span className="tag is-warning">{tags[tag]}</span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

const Level = ({ articles }) => (
  <nav className="level is-mobile">
    <div className="level-item has-text-centered">
      <div>
        <p className="heading">総記事数</p>
        <p className="title">{articles.length}</p>
      </div>
    </div>
    {Array.from({ length: 4 }, (_, i) => {
      const targetYear = moment().subtract(i, "year").format("YYYY");
      return (
        <div key={i} className="level-item has-text-centered">
          <div>
            <p className="heading">{targetYear}年</p>
            <p className="title">
              {
                articles.filter(({ node }) => {
                  const range = createRange(targetYear);
                  return range.contains(moment(node.publishDate));
                }).length
              }
            </p>
          </div>
        </div>
      );
    })}
  </nav>
);

const createRange = (year) => {
  return moment.range(
    moment(`${year}-01-01 00:00:00`, "YYYY-MM-DD HH:mm:ss"),
    moment(`${year}-12-31 23:59:59`, "YYYY-MM-DD HH:mm:ss")
  );
};

function buildHeatmapValues(edges) {
  const dateObj = countBy(
    edges.map(({ node }) => moment(node.publishDate).format("YYYY-MM-DD"))
  );
  return Object.keys(dateObj).map((date) => ({
    date,
    count: dateObj[date],
  }));
}

export const query = graphql`
  query {
    allContentfulArticle(sort: { fields: publishDate, order: DESC }) {
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
