const path = require("path");
const dayjs = require("dayjs");

exports.createPages = async ({ graphql, actions: { createPage } }) => {
  const result = await graphql(`
    {
      allContentfulArticle {
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
};
