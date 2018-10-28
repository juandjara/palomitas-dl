FROM node:10-alpine

RUN apk --no-cache add ffmpeg git
WORKDIR /home/node/app
ENV PATH /home/node/app/node_modules/.bin:$PATH
COPY package.json /home/node/app/package.json
COPY package-lock.json /home/node/app/package-lock.json
RUN npm install --production
COPY . /home/node/app

USER node
CMD [ "npm", "start" ]