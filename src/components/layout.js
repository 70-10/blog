import React from "react";
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

const layout = ({
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
    <nav className="navbar is-primary">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item">
            <h1 className="title has-text-white blog-title">
              {siteMetadata.title}
            </h1>
          </Link>
        </div>
      </div>
    </nav>
    <section className="section">
      <div className="container">{children}</div>
    </section>
  </div>
);

export default ({ children }) => (
  <StaticQuery query={query} render={data => layout({ data, children })} />
);
