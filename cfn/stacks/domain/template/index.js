const config = require("config");

module.exports = {
  AWSTemplateFormatVersion: "2010-09-09",
  Description: `${config.tags.System} ${config.tags.Component} Stack`,
  Parameters: {
    HostedZone: {
      Default: config.hostedZone.domain,
      Description: "Domain Name",
      Type: "String"
    }
  },
  Resources: Object.assign(
    require("./resources/stg-record"),
    require("./resources/acm")
  )
};
