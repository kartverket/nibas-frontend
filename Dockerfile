
FROM dhi.io/caddy:2.11.4-debian13@sha256:1fc25bab9c803768d5893dd42fc3fab7e045e6e7133a3626954841f5144cd234

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080