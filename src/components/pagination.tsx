import { Link } from "gatsby";
import React, { FC } from "react";
import * as styles from "./pagination.module.css";

const Prev: FC = () => (
  <svg
    className="h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const Next: FC = () => (
  <svg
    className="h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

type Props = {
  pageContext: {
    prev: number;
    next: number;
    pages: number;
    page: number;
  };
};

const Pagination: FC<Props> = ({
  pageContext: { prev, next, pages, page },
}) => (
  <>
    <nav className={styles.container}>
      {prev > 0 ? (
        <Link
          to={prev === 1 ? "/" : `/articles/${prev}`}
          className={styles.prev_link}
        >
          <Prev />
        </Link>
      ) : (
        <span className={styles.prev}>
          <Prev />
        </span>
      )}
      {Array.from({ length: pages }).map((_, i) => (
        <Link
          key={i}
          to={i === 0 ? "/" : `/articles/${i + 1}`}
          className={i + 1 === page ? styles.num_current : styles.num}
        >
          {i + 1}
        </Link>
      ))}
      {next <= pages ? (
        <Link to={`/articles/${next}`} className={styles.next_link}>
          <Next />
        </Link>
      ) : (
        <span className={styles.next}>
          <Next />
        </span>
      )}
    </nav>
  </>
);

export default Pagination;
