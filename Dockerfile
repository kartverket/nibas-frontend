FROM ghcr.io/kartverket/caddy:2.11.7@sha256:9472b72d85b0e37b60dc7b314e25c37b627c7ad3ba9aa92c38c50e6a81a20a7b

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080