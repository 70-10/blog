const path = require("path");
const dayjs = require("dayjs");

exports.createPages = async ({ graphql, actions: { createPage } }) => {
  const result = await graphql(`
    {
      allContentfulArticle(sort: { fields: publishDate, order: DESC }) {
        edges {
          node {
            title
            slug
            publishDate
          }
        }
      }
    }
  `);

  const articles = result.data.allContentfulArticle.edges;
  articles.forEach(({ node }, i) => {
    createPage({
      path: `/${dayjs(node.publishDate).format("YYYY/MM/DD")}/${node.slug}/`,
      component: path.resolve("./src/templates/article.js"),
      context: {
        slug: node.slug
      }
    });
  });

  const perPage = 12;
  const numPages = Math.ceil(articles.length / perPage);
  Array.from({ length: numPages }).forEach((_, i) => {
    createPage({
      path: i === 0 ? "/" : `/articles/${i + 1}/`,
      component: path.resolve("./src/templates/article-list.js"),
      context: {
        limit: perPage,
        skip: i * perPage,
        page: i + 1,
        next: i + 2,
        prev: i,
        pages: numPages
      }
    });
  });
};
