FROM node:6-alpine

RUN yarn add aws-sdk cloudformation-z config
ENV NODE_PATH=/node_modules

WORKDIR /tmp/src
ENTRYPOINT ["yarn","start"]
