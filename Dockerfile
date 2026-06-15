
FROM dhi.io/caddy:2.11.4-debian13@sha256:97d8a02e95c3d9a255b15bd3ef3dc5370ee86a53827794e6ccd7ddae7f4f34ca

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080