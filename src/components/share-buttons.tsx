import React from "react";
import { TwitterShareButton, TwitterIcon } from "react-share";

export default ({ title, url }) => (
  <TwitterShareButton title={title} url={url}>
    <TwitterIcon size={32} round />
  </TwitterShareButton>
);
