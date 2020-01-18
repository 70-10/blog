import React, { FC } from "react";
import { graphql } from "gatsby";
import Layout from "../layouts/defaultLayout";
import Article from "../components/article";
import Pagination from "../components/pagination";
import Footer from "../components/footer";

type Data = {
  allContentfulArticle: {
    edges: {
      node: {
        title: string;
        slug: string;
        publishDate: string;
      };
    }[];
  };
};

type Context = {
  limit: number;
  skip: number;
  page: number;
  next: number;
  prev: number;
  pages: number;
};

type Props = {
  data: Data;
  pageContext: Context;
};

const ArticleList: FC<Props> = ({ data, pageContext }) => (
  <>
    <Layout>
      {data.allContentfulArticle.edges.map(({ node }) => (
        <Article key={node.slug} node={node} />
      ))}
      <section className="section">
        <Pagination pageContext={pageContext} />
      </section>
    </Layout>
    <Footer />
  </>
);

export default ArticleList;

export const query = graphql`
  query articleListQuery($skip: Int!, $limit: Int!) {
    allContentfulArticle(
      sort: { fields: publishDate, order: DESC }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          title
          slug
          publishDate
        }
      }
    }
  }
`;
