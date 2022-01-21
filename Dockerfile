FROM harbor-staging.statkart.no/proxy_cache/library/node:lts as nodeContainer
WORKDIR /app
COPY . .
RUN npm install
RUN rm -f .npmrc
RUN npm run build

FROM harbor-staging.statkart.no/proxy_cache/library/caddy:2.4.6
ENV PORT=8080
ENV BACKEND_HOST=nibas-backend-service
RUN addgroup -g 1242 nibas; \
  adduser -u 1242 -D -G nibas nibas
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
COPY --from=nodeContainer /app/build/ /srv
USER 1242
