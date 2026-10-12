
FROM dhi.io/caddy:2.11.7-debian13@sha256:839a9da71f1a1b3e0c604f6240ad32cf00eadd70628734b1c60ad073545ca514

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080