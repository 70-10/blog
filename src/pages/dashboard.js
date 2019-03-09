import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import countBy from "lodash.countby";
import CalendarHeatmap from "../components/calendar-heatmap";
import moment from "../moment";

export default ({ data: { allContentfulArticle } }) => {
  return (
    <Layout>
      <h1 className="title">Dashboard</h1>

      <nav className="level">
        <div className="level-item has-text-centered">
          <div>
            <p className="heading">総記事数</p>
            <p className="title">{allContentfulArticle.edges.length}</p>
          </div>
        </div>
        {Array.from({ length: 3 }, (_, i) => {
          const targetYear = moment()
            .subtract(i, "year")
            .format("YYYY");
          return (
            <div key={i} className="level-item has-text-centered">
              <div>
                <p className="heading">{targetYear}</p>
                <p className="title">
                  {
                    allContentfulArticle.edges.filter(({ node }) => {
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
      <CalendarHeatmap
        values={buildHeatmapValues(allContentfulArticle.edges)}
      />
    </Layout>
  );
};

const createRange = year => {
  return moment.range(
    moment(`${year}-01-01 00:00:00`, "YYYY-MM-DD HH:mm:ss"),
    moment(`${year}-12-31 23:59:59`, "YYYY-MM-DD HH:mm:ss")
  );
};

function buildHeatmapValues(edges) {
  const dateObj = countBy(
    edges.map(({ node }) => moment(node.publishDate).format("YYYY-MM-DD"))
  );
  return Object.keys(dateObj).map(date => ({
    date,
    count: dateObj[date]
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
        }
      }
    }
  }
`;
