module.exports = {
  siteMetadata: {
    title: "MNML",
    description: "70-10's Tech Blog",
    siteUrl: "https://blog.70-10.net"
  },
  plugins: [
    "gatsby-plugin-typescript",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    "gatsby-plugin-sass",
    "gatsby-plugin-twitter",
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-prismjs",
            options: {
              classPrefix: "language-"
            }
          },
          {
            resolve: "gatsby-remark-images-contentful",
            options: {
              showCaptions: true
            }
          },
          {
            resolve: "gatsby-remark-autolink-headers",
            options: {
              offsetY: "100",
              icon:
                '<svg aria-hidden="true" height="20" version="1.1" viewBox="0 0 16 16" width="20"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>',
              className: "custom-class"
            }
          },
          {
            resolve: "gatsby-remark-embed-spotify"
          }
        ]
      }
    },
    {
      resolve: "gatsby-source-contentful",
      options: {
        host: process.env.GATSBY_CONTENTFUL_HOST,
        spaceId: process.env.GATSBY_SPACE_ID,
        accessToken: process.env.GATSBY_ACCESS_TOKEN
      }
    },
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "UA-99979822-1"
      }
    },
    {
      resolve: "gatsby-plugin-feed",
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url:siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, articles } }) => {
              return articles.edges.map(({ node }) => ({
                title: node.title,
                description:
                  node.childContentfulArticleBodyTextNode.childMarkdownRemark
                    .excerpt,
                url: `${site.siteMetadata.siteUrl}/${node.slug}`,
                guid: `${site.siteMetadata.siteUrl}/${node.slug}`,
                custom_elements: [
                  {
                    "content:encoded":
                      node.childContentfulArticleBodyTextNode
                        .childMarkdownRemark.html
                  }
                ]
              }));
            },
            query: `
              {
                articles: allContentfulArticle(limit: 1000, sort: {fields: publishDate, order: DESC}) {
                  edges {
                    node {
                      title
                      slug
                      childContentfulArticleBodyTextNode{
                        childMarkdownRemark {
                          html
                          excerpt
                        }
                      }
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: "MNML RSS Feed"
          }
        ]
      }
    }
  ]
};
