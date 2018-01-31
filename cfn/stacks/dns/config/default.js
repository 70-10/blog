module.exports = {
  stackName: "Blog-DNS",
  timeoutInMinutes: 50,
  tags: {
    System: "Blog",
    Stage: process.env.NODE_ENV || "DEV",
    Component: "DNS"
  },
  awsOpt: {
    region: "us-east-1"
  },

  // custom config
  origin: {
    domain_name: "70-10.github.io"
  },
  hostedZone: {
    domain: "70-10.net"
  }
};
