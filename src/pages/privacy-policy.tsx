import React, { FC } from "react";
import Layout from "../layouts/defaultLayout";

const PrivacyPolicyPage: FC = () => {
  return (
    <Layout>
      <div className="hero">
        <div className="hero-body">
          <div className="columns is-centered">
            <div className="column is-8">
              <h1 className="title">プライバシーポリシー</h1>
              <div className="content">
                <h2>アクセス解析について</h2>
                <p>
                  当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を使用しています。このGoogleアナリティクスはデータの収集のためにCookieを使用しています。このデータは匿名で収集されており、個人を特定するものではありません。
                  この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。この規約に関しての詳細は
                  <a
                    href="http://www.google.com/analytics/terms/jp.html"
                    target="_blank"
                  >
                    Googleアナリティクスサービス利用規約のページ
                  </a>
                  や
                  <a
                    href="http://www.google.co.jp/policies/technologies/ads/"
                    target="_blank"
                  >
                    Googleポリシーと規約ページ
                  </a>
                  をご覧ください。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicyPage;
