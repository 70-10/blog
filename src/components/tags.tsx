import { Link } from "gatsby";
import React, { FC } from "react";
import * as styles from "./tags.module.css";
import { display } from "../tag-helper";

type Props = {
  tags: string[];
};

const Tags: FC<Props> = ({ tags }) => (
  <>
    {tags.map((tag) => {
      return (
        <Link key={tag} to={`/tags/${tag}`} className={styles.tag}>
          {`#${display(tag)}`}
        </Link>
      );
    })}
  </>
);

export default Tags;
