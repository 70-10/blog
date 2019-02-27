import React from "react";
import "./layout.scss";

export default ({ children }) => (
  <div>
    <section className="section">
      <div className="container">{children}</div>
    </section>
  </div>
);
