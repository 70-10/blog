const path = require("path");
const moment = require("moment");

exports.createPages = async ({ graphql, actions: { createPage } }) => {
  const result = await graphql(`
    {
      allContentfulArticle(sort: { fields: publishDate, order: DESC }) {
        edges {
          node {
            title
            slug
            publishDate
            tags
          }
        }
      }
    }
  `);

  const articles = result.data.allContentfulArticle.edges;
  articles.forEach(({ node }) => {
    createPage({
      path: `/${moment(node.publishDate).format("YYYY/MM/DD")}/${node.slug}/`,
      component: path.resolve("./src/templates/article.tsx"),
      context: {
        slug: node.slug
      }
    });
  });

  const tags = [
    ...new Set(
      result.data.allContentfulArticle.edges
        .map(({ node }) => node.tags)
        .filter(tags => !!tags)
        .flat()
    )
  ].sort();
  tags.forEach(tag => {
    createPage({
      path: `/tags/${tag}/`,
      component: path.resolve("./src/templates/tag.tsx"),
      context: {
        tag
      }
    });
  });

  const perPage = 12;
  const numPages = Math.ceil(articles.length / perPage);
  Array.from({ length: numPages }).forEach((_, i) => {
    createPage({
      path: i === 0 ? "/" : `/articles/${i + 1}/`,
      component: path.resolve("./src/templates/article-list.tsx"),
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
