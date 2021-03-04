import React, { FC } from "react";
import { Link } from "gatsby";
import styles from "./footer.module.css";

const Footer: FC = () => (
  <div className={styles.container}>
    <img className={styles.icon} src="/icon.jpg" alt="Icon" />
    <div className={styles.sns}>
      <p>
        written by{" "}
        <a
          href="https://twitter.com/70_10"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          70_10
        </a>
      </p>

      <a
        href="https://twitter.com/70_10"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        Twitter
      </a>
      <span>{" / "}</span>
      <a
        href="https://github.com/70-10"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        GitHub
      </a>
      <span>{" / "}</span>

      <a
        href="https://qiita.com/70_10"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        Qiita
      </a>
    </div>
    <div className={styles.privacy_policy}>
      <Link to="/privacy-policy" className={styles.link}>
        プライバシーポリシー
      </Link>
    </div>
  </div>
);

export default Footer;
