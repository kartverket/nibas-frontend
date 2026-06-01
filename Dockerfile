
FROM dhi.io/caddy:2.11.3-debian13@sha256:65d8cf8ce28f6ab88be8b5d698d9098952906ea78720ba6b14a4df658cc812ca

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080