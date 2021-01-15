import React, { FC } from "react";
import { Link } from "gatsby";
import styles from "./navbar.module.css";

type Props = {
  title: string | null | undefined;
};

const Navbar: FC<Props> = ({ title }) => (
  <nav>
    <Link to="/" className={styles.title}>
      {title}
    </Link>
  </nav>
);

export default Navbar;
