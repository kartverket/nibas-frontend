
FROM dhi.io/caddy:2.11.4-debian13@sha256:05a96d1f9f3df6baa1b420a42277c007d8693ab01fabdccecb4a255bfc327487

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080