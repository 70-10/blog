"use strict";

const config = require("config");

module.exports = {
  BlogDNSRecord: {
    Type: "AWS::Route53::RecordSet",
    Properties: {
      HostedZoneName: { "Fn::Join": ["", [{ Ref: "HostedZone" }, "."]] },
      Name: { "Fn::Join": ["", ["blog", ".", { Ref: "HostedZone" }, "."]] },
      Type: "A",
      AliasTarget: {
        DNSName: { "Fn::GetAtt": ["BlogCloudFront", "DomainName"] },
        HostedZoneId: "Z2FDTNDATAQYW2"
      }
    }
  }
};