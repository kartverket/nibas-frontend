FROM harbor-staging.statkart.no/proxy_cache/library/node:latest as nodeContainer
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm install
RUN rm -f .npmrc
COPY . .
RUN npm run build

FROM harbor-staging.statkart.no/proxy_cache/library/nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY /build-config/nginx/localhost/nginx.conf /etc/nginx/nginx.conf
COPY --from=nodeContainer /app/build/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
