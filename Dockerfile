
FROM dhi.io/caddy:2.11.2-debian13@sha256:2f5185970db677f503f4e05c031849bce41715de1fe4c2520bea504a0292c32e

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080