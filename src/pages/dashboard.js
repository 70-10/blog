import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import dayjs from "dayjs";
import countBy from "lodash.countby";
import CalendarHeatmap from "../components/calendar-heatmap";

export default ({ data }) => {
  return (
    <Layout>
      <h1 className="title">Dashboard</h1>
      <h2 className="subtitle">
        記事数: {data.allContentfulArticle.edges.length}
      </h2>
      <CalendarHeatmap
        values={buildHeatmapValues(data.allContentfulArticle.edges)}
      />
    </Layout>
  );
};

function buildHeatmapValues(edges) {
  const dateObj = countBy(
    edges.map(({ node }) => dayjs(node.publishDate).format("YYYY-MM-DD"))
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
