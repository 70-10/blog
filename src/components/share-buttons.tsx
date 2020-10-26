import React, { FC } from "react";
import { TwitterShareButton, TwitterIcon } from "react-share";

const ShareButton: FC<{ title?: string; url: string }> = ({ title, url }) => (
  <TwitterShareButton title={title} url={url}>
    <TwitterIcon size={32} round />
  </TwitterShareButton>
);

export default ShareButton;
