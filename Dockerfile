
FROM dhi.io/caddy:2.11.3-debian13@sha256:f2472171f4df97b2320ff44deab1c25dbaac3e3a37a6d0d5e4bf3f952250ba89

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080