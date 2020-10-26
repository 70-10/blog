import React, { FC } from "react";
import Layout from "../layouts/defaultLayout";

const NotFoundPage: FC = () => (
  <Layout>
    <div className="has-text-centered">
      <h1 className="title">404</h1>
      <h1 className="subtitle">ご指定のページは存在しません</h1>
    </div>
  </Layout>
);

export default NotFoundPage;
