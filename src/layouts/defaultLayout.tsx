import React, { FC } from "react";
import { Helmet } from "react-helmet";
import { graphql, StaticQuery, Link } from "gatsby";
import "./layout.scss";

const query = graphql`
  query DefaultLayout {
    site {
      siteMetadata {
        title
      }
    }
  }
`;

type Query = {
  site: {
    siteMetadata: {
      title: string;
    };
  };
};

type Props = {
  data: Query;
};

const Head: FC<{ title: string }> = ({ title }) => {
  return (
    <Helmet htmlAttributes={{ lang: "ja" }}>
      <meta http-equiv="content-type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="description" content="Blog at 70-10.net" />
      <meta name="author" content="70_10" />

      <title>{title}</title>
    </Helmet>
  );
};

const Navbar: FC<{ title: string }> = ({ title }) => {
  return (
    <nav className="navbar is-link">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item">
            <h1 className="title blog-title has-text-white">{title}</h1>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Layout: FC<Props> = ({
  data: {
    site: { siteMetadata },
  },
  children,
}) => {
  return (
    <>
      <Head title={siteMetadata.title} />
      <Navbar title={siteMetadata.title} />
      <section className="section top">
        <div className="container">{children}</div>
      </section>
    </>
  );
};

const DefaultLayout: FC = ({ children }) => (
  <StaticQuery query={query} render={(data) => Layout({ data, children })} />
);

export default DefaultLayout;
