import React from "react";
import { TwitterShareButton, TwitterIcon } from "react-share";

export default ({ title, url }) => (
  <div className="columns">
    <div className="column">
      <TwitterShareButton title={title} url={url}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
    </div>
  </div>
);
