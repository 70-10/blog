import assert from "assert";
import { graphql } from "gatsby";
import React, { FC } from "react";
import { ArticleOgImageQuery } from "../../types/graphql-types";
import moment from "../moment";

interface Props {
  data: ArticleOgImageQuery;
}

const OGImage: FC<Props> = ({ data }) => {
  assert(data.contentfulArticle);

  const { title, publishDate } = data.contentfulArticle;

  return (
    <div className="text-white bg-gradient-to-r from-blue-300 to-green-500">
      <div className="flex flex-col gap-y-10 items-center justify-center h-screen">
        <h1 className="font-bold text-7xl">{title}</h1>
        <p className="font-semibold text-5xl">
          {moment(publishDate).format("YYYY/MM/DD")}
        </p>
      </div>
    </div>
  );
};

export default OGImage;

export const query = graphql`
  query ArticleOgImage($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    contentfulArticle(slug: { eq: $slug }) {
      title
      publishDate
    }
  }
`;
