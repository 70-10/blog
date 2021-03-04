module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: false,
  theme: {
    extend: {
      typography: (theme) => ({
        "3xl": {
          css: {
            fontSize: "1.875rem",
            h1: {
              fontSize: "4rem",
            },
          },
        },
        DEFAULT: {
          css: {
            color: theme("colors.gray.600"),
            fontSize: "1rem",
            h1: {
              fontSize: "1.5rem",
              marginTop: "1em",
              marginBottom: ".5em",
              textDecoration: "underline",
              color: theme("colors.gray.700"),
            },
            h2: {
              fontSize: "1.25rem",
              marginTop: "1em",
              marginBottom: ".5em",
              color: theme("colors.gray.600"),
            },
            p: {
              marginTop: 0,
              marginBottom: 0,
            },
            ul: {
              ul: {
                marginTop: 0,
                marginBottom: 0,
              },
              ol: {
                marginTop: 0,
                marginBottom: 0,
              },
            },
            ol: {
              ul: {
                marginTop: 0,
                marginBottom: 0,
              },
              ol: {
                marginTop: 0,
                marginBottom: 0,
              },
            },
            "> ul": {
              marginTop: "0",
              marginBottom: "0",
              "> li": {
                "> *:first-child": {
                  marginTop: 0,
                },
                "> *:last-child": {
                  marginBottom: 0,
                },
              },
            },
            "> ol": {
              "> li": {
                "> *:first-child": {
                  marginTop: 0,
                },
                "> *:last-child": {
                  marginBottom: 0,
                },
              },
            },
            li: {
              marginTop: 0,
            },
            ".gatsby-highlight": {
              fontSize: ".85em",
            },
            "code.language-text": {
              fontSize: ".825em",
              fontWeight: 100,
              padding: ".15em",
              paddingLeft: ".5em",
              paddingRight: ".5em",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
          },
        },
      }),
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
