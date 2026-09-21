
FROM dhi.io/caddy:2.11.4-debian13@sha256:1b40b4f43bbfada63b22431ec6fec48b50e212abfc1cc5e645948483a656ddcc

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080