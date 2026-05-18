
FROM dhi.io/caddy:2.11.3-debian13@sha256:9e968e40a0786d8722f1e3e9a9d4e74ff6f2b04217f5fe0bb9ed3952b40203b2

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080