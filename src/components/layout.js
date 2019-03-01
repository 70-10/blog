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
  location,
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

      {/* <!-- Google / Search Engine Tags --> */}
      <meta itemprop="name" content={siteMetadata.title} />
      <meta itemprop="description" content="Blog at 70-10.net" />
      <meta itemprop="image" content="" />

      {/* <!-- Facebook Meta Tags -- */}
      <meta property="og:url" content={location.href} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteMetadata.title} />
      <meta property="og:description" content="Blog at 70-10.net" />
      <meta property="og:image" content="" />

      {/* <!-- Twitter Meta Tags --> */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteMetadata.title} />
      <meta name="twitter:description" content="Blog at 70-10.net" />
      <meta name="twitter:image" content="" />
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

export default ({ location, children }) => (
  <StaticQuery
    query={query}
    render={data => layout({ data, location, children })}
  />
);
