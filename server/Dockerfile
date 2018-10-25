FROM node:10-alpine

RUN apk --no-cache add ffmpeg git
WORKDIR /home/node/app

COPY . .

USER node
CMD [ "npm", "start" ]