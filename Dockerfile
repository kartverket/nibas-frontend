
FROM dhi.io/caddy:2.11.4-debian13@sha256:840c0df5f0e30e0845ab63fff6dd5da8ebbcb8416054848dfa18924f490a358b

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080