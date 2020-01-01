import React, { SFC } from "react";

const Footer: SFC = () => (
  <footer className="footer">
    <div className="container">
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
  </footer>
);

export default Footer;