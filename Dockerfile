
FROM dhi.io/caddy:2.11.4-debian13@sha256:383ef131df36730b7689d2c6bf9c64c02ca6fa147a7fd59207f097dd8ff03107

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080