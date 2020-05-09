import React from "react";
import { TwitterShareButton, TwitterIcon } from "react-share";

export default ({ title, url }) => (
  <div className="columns">
    <div className="column is-6 is-offset-3">
      <TwitterShareButton title={title} url={url}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
    </div>
  </div>
);
