# Intended to be used by CI
FROM caddy:2-alpine

COPY /build /srv

ENV PORT=8080
ENV BACKEND_HOST=nibas-backend:8080
ENV AUT_IDPORTEN=aut-idporten
RUN apk --no-cache add curl tzdata
RUN addgroup -g 1242 nibas; \
  adduser -u 1242 -D -G nibas nibas
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
ENV TZ=Europe/Oslo
USER 1242
EXPOSE 8080