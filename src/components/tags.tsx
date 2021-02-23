import assert from "assert";
import { Link } from "gatsby";
import React, { FC } from "react";
import { Maybe } from "../../types/graphql-types";
import { display } from "../tag-helper";
import styles from "./tags.module.css";

type Props = {
  tags: Maybe<string>[];
};

const Tags: FC<Props> = ({ tags }) => (
  <>
    {tags.map((tag) => {
      assert(tag);
      return (
        <Link key={tag} to={`/tags/${tag}`} className={styles.tag}>
          {`#${display(tag)}`}
        </Link>
      );
    })}
  </>
);

export default Tags;
