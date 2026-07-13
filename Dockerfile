
FROM dhi.io/caddy:2.11.4-debian13@sha256:e29be2c69ea4552edea5fbeb5e81568b6e70fbaa56dec2e49863c872f18aaebc

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080