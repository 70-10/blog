import React, { FC } from "react";
import Layout from "../layouts/defaultLayout";
import * as styles from "./privacy-policy.module.css";

const PrivacyPolicyPage: FC = () => {
  return (
    <Layout>
      <h1 className={styles.title}>プライバシーポリシー</h1>
      <hr className={styles.line} />
      <article className="prose prose-green">
        <h3>アクセス解析について</h3>
        <p>
          当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を使用しています。
          <br />
          このGoogleアナリティクスはデータの収集のためにCookieを使用しています。このデータは匿名で収集されており、個人を特定するものではありません。
          <br />
          この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。
        </p>
        <p>
          この規約に関しての詳細は
          <a
            href="http://www.google.com/analytics/terms/jp.html"
            target="_blank"
            rel="noreferrer"
          >
            Googleアナリティクスサービス利用規約のページ
          </a>
          や
          <a
            href="https://policies.google.com/technologies/ads?gl=jp"
            target="_blank"
            rel="noreferrer"
          >
            Googleポリシーと規約ページ
          </a>
          をご覧ください。
        </p>
      </article>
    </Layout>
  );
};

export default PrivacyPolicyPage;
