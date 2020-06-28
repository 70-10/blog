import React, { FC } from "react";
import Layout from "../layouts/defaultLayout";
import { graphql } from "gatsby";
import Article from "../components/article";
import { display } from "../tag-helper";

type Data = {
  allContentfulArticle: {
    edges: {
      node: {
        title: string;
        slug: string;
        publishDate: string;
        tags: string[];
      };
    }[];
  };
};

type Context = {
  tag: string;
};

type Props = {
  data: Data;
  pageContext: Context;
};

const Tag: FC<Props> = ({ data, pageContext }) => (
  <Layout>
    <section className="hero">
      <div className="hero-body">
        <div className="columns">
          <div className="column is-8 is-offset-2">
            <span className="title tag is-warning is-medium">
              {display(pageContext.tag)}
            </span>

            {data.allContentfulArticle.edges
              .filter(
                ({ node }) => !!node.tags && node.tags.includes(pageContext.tag)
              )
              .map(({ node }) => (
                <Article key={node.slug} node={node} />
              ))}
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

export default Tag;

export const query = graphql`
  query {
    allContentfulArticle(sort: { fields: publishDate, order: DESC }) {
      edges {
        node {
          title
          slug
          publishDate
          tags
        }
      }
    }
  }
`;
