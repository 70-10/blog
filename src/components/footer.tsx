import React, { FC } from "react";
import { Link } from "gatsby";

const Footer: FC = () => (
  <footer className="footer">
    <div className="columns is-centered">
      <div className="column is-8">
        <article className="media">
          <figure className="media-left">
            <p className="image is-64x64">
              <img src="/icon.jpg" alt="Icon" />
            </p>
          </figure>
          <div className="media-content">
            <div className="content">
              <p>
                written by{" "}
                <strong>
                  <a
                    href="https://twitter.com/70_10"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    70_10
                  </a>
                </strong>
              </p>
            </div>
            <nav className="breadcrumb" aria-label="breadcrumbs">
              <ul>
                <li>
                  <a
                    href="https://twitter.com/70_10"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/70-10"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://qiita.com/70_10"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Qiita
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </article>
      </div>
    </div>
    <div className="columns is-centered">
      <div className="column is-8 has-text-right">
        <Link to="/privacy-policy" className="button is-text">
          プライバシーポリシー
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
