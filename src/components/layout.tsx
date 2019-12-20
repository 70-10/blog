import React, { SFC } from "react";
import Helmet from "react-helmet";
import { graphql, StaticQuery, Link } from "gatsby";
import "./layout.scss";

const query = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`;

type Data = {
  site: {
    siteMetadata: {
      title: string;
    };
  };
};

type Props = {
  data: Data;
};

const layout: SFC<Props> = ({
  data: {
    site: { siteMetadata }
  },
  children
}) => (
  <div>
    <Helmet>
      <meta http-equiv="content-type" content="text/html; charset=utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1"
      />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="description" content="Blog at 70-10.net" />
      <meta name="author" content="70_10" />

      <title>{siteMetadata.title}</title>
    </Helmet>
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item">
            <h1 className="title blog-title">{siteMetadata.title}</h1>
          </Link>
        </div>
      </div>
    </nav>
    <section className="section top">
      <div className="container">{children}</div>
    </section>
  </div>
);

const DefaultLayout: SFC = ({ children }) => (
  <StaticQuery query={query} render={data => layout({ data, children })} />
);

export default DefaultLayout;
