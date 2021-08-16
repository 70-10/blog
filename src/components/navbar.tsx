import { Link } from "gatsby";
import React, { FC } from "react";
import styles from "./navbar.module.css";

type Props = {
  title: string | null | undefined;
};

const Navbar: FC<Props> = ({ title }) => (
  <nav className={styles.navbar}>
    <Link to="/" className={styles.title}>
      {title}
    </Link>
  </nav>
);

export default Navbar;
