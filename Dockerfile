FROM ghcr.io/kartverket/caddy:2.11.7@sha256:15940de8d97b8dd1aed594f2c86444624ee95c18c48ade41b066628f4ef87245

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080