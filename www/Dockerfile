# build environment
FROM node:10-alpine as builder
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package*.json /usr/src/app/
RUN npm ci
COPY . /usr/src/app
RUN npm run build

# production environment
FROM nginx:alpine
RUN rm -rf /etc/nginx/conf.d
COPY nginx /etc/nginx/conf.d
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
