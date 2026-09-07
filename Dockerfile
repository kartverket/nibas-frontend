
FROM dhi.io/caddy:2.11.4-debian13@sha256:30e6971d630b5504dc6469a9b425a31a5334029dc725baa5aca535967e24da55

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080