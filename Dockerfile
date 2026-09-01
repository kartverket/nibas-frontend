
FROM dhi.io/caddy:2.11.4-debian13@sha256:f5c2b026d9befb297e43f12c9e2fdde521e9eb3464aee21f245d1dcca786c26c

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080