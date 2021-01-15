import React, { FC } from "react";
import { graphql, StaticQuery, Link } from "gatsby";
import { Helmet } from "react-helmet";
import { DefaultLayoutQuery } from "../../types/graphql-types";
import Footer from "../components/footer";
import styles from "./defaultLayout.module.css";

const Navbar: FC<{ title: string | null | undefined }> = ({ title }) => (
  <nav className="navbar is-link">
    <div className="container">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item">
          <h1 className="title has-text-white">{title}</h1>
        </Link>
      </div>
    </div>
  </nav>
);

type Props = {
  data: DefaultLayoutQuery;
};

const Component: FC<Props> = ({ data, children }) => (
  <>
    <Helmet htmlAttributes={{ lang: "ja" }}>
      <meta httpEquiv="content-type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="description" content="Blog at 70-10.net" />
      <meta name="author" content="70_10" />

      <title>{data.site?.siteMetadata?.title}</title>
    </Helmet>
    <div className={styles.grid_content}>
      <header className={styles.col_center}>
        <Navbar title={data.site?.siteMetadata?.title} />
      </header>
      <main className={styles.col_center}>{children}</main>
      <footer className={styles.col_center}>
        <Footer />
      </footer>
    </div>
  </>
);

const Container: FC = ({ children }) => (
  <StaticQuery
    query={graphql`
      query DefaultLayout {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={(data) => <Component data={data}>{children}</Component>}
  />
);

export default Container;
