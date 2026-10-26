
FROM dhi.io/caddy:2.11.7-debian13@sha256:5d86af54328d18435d20da2b5e373dd9ae89917d5fdeaf657fde3a4a82ddea62

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080