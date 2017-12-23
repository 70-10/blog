module.exports = {
  stackName: "Blog-domain",
  timeoutInMinutes: 30,
  tags: {
    System: "Blog",
    Stage: process.env.NODE_ENV || "DEV",
    Component: "domain"
  },
  awsOpt: {
    region: "us-east-1"
  },

  // custom config
  hostedZone: {
    domain: "70-10.net"
  }
};
