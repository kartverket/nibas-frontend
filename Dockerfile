
FROM dhi.io/caddy:2.11.2-debian13@sha256:bc7c358df1b4fc857d722fc2f5b0b2c429bba2ee5f6167097225a7d67849c20c

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080