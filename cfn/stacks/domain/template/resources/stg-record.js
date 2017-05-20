"use strict";

const config = require("config");

module.exports = {
  BlogDNSRecord: {
    Type: "AWS::Route53::RecordSet",
    Properties: {
      HostedZoneName: { "Fn::Join": ["", [{ Ref: "HostedZone" }, "."]] },
      Name: { "Fn::Join": ["", ["blog", ".", { Ref: "HostedZone" }, "."]] },
      Type: "CNAME",
      TTL: 300,
      ResourceRecords: ["70-10.github.io"]
    }
  }
};
