const path = require("path");
exports.createPages = async ({ graphql, actions: { createPage } }) => {
  const result = await graphql(`
    {
      allContentfulArticle {
        edges {
          node {
            title
            slug
          }
        }
      }
    }
  `);

  const articles = result.data.allContentfulArticle.edges;
  articles.forEach(({ node }, i) => {
    createPage({
      path: `/articles/${node.slug}/`,
      component: path.resolve("./src/templates/article.js"),
      context: {
        slug: node.slug
      }
    });
  });
};
