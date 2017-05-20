module.exports = {
  stackName: "Blog-domain",
  timeoutInMinutes: 10,
  tags: {
    System: "Blog",
    Stage: process.env.NODE_ENV || "DEV",
    Component: "domain"
  },

  // custom config
  hostedZone: {
    domain: "70-10.net"
  }
};
