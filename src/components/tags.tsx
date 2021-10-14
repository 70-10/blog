import { Link } from "gatsby";
import React, { FC } from "react";
import { display } from "../tag-helper";
import * as styles from "./tags.module.css";

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
