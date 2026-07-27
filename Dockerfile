
FROM dhi.io/caddy:2.11.4-debian13@sha256:960465bb8b284ef2e6496b0e91e2c3ef3d57f584bb3a32ea1c2d0b4f6f608183

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080