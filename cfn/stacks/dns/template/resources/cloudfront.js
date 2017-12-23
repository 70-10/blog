"use strict";
const config = require("config");

module.exports = {
  BlogCloudFront: {
    Type: "AWS::CloudFront::Distribution",
    Properties: {
      DistributionConfig: {
        DefaultCacheBehavior: {
          TargetOriginId: `${config.origin.domain_name}/blog`,
          AllowedMethods: ["GET", "HEAD"],
          ForwardedValues: { QueryString: false },

          Compress: true,
          ViewerProtocolPolicy: "redirect-to-https"
        },
        Aliases: [{ "Fn::Join": ["", ["blog", ".", { Ref: "HostedZone" }]] }],
        Enabled: true,
        Origins: [
          {
            Id: `${config.origin.domain_name}/blog`,
            DomainName: config.origin.domain_name,
            OriginPath: "/blog",
            CustomOriginConfig: {
              OriginProtocolPolicy: "https-only"
            }
          }
        ],
        ViewerCertificate: {
          AcmCertificateArn: { "Fn::ImportValue": "BlogDomainACM" },
          SslSupportMethod: "sni-only"
        }
      }
    }
  }
};
