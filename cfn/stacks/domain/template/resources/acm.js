module.exports = {
  BlogDomainACM: {
    Type: "AWS::CertificateManager::Certificate",
    Properties: {
      DomainName: "*.70-10.net"
    }
  }
};
