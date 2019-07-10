import React from "react";
import { Link } from "gatsby";

export default ({ pageContext: { prev, next, pages, page } }) => (
  <nav className="pagination is-centered">
    {prev > 0 ? (
      <Link
        to={prev === 1 ? "/" : `/articles/${prev}`}
        className="pagination-previous is-link"
      >
        {"<"}
      </Link>
    ) : null}

    <ul className="pagination-list">
      {Array.from({ length: pages }).map((_, i) => (
        <li key={i}>
          <Link
            to={i === 0 ? "/" : `/articles/${i + 1}`}
            className={
              i + 1 === page ? "pagination-link is-current" : "pagination-link"
            }
          >
            {i + 1}
          </Link>
        </li>
      ))}
    </ul>
    {next <= pages ? (
      <Link to={`/articles/${next}`} className="pagination-next">
        {">"}
      </Link>
    ) : null}
  </nav>
);
