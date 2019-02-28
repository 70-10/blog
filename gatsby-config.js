module.exports = {
  plugins: [
    "gatsby-plugin-sass",
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-prismjs",
            options: {
              classPrefix: "language-"
            }
          }
        ]
      }
    },
    {
      resolve: "gatsby-source-contentful",
      options: {
        spaceId: process.env.GATSBY_SPACE_ID,
        accessToken: process.env.GATSBY_ACCESS_TOKEN
      }
    }
  ]
};
