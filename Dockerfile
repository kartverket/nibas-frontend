FROM caddy:2.10.2-alpine AS caddy-binary

FROM gcr.io/distroless/static-debian12

COPY --from=caddy-binary /usr/bin/caddy /usr/bin/caddy
COPY /build /srv
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile

ENV PORT=8080
ENV TZ=Europe/Oslo

USER 1242
EXPOSE 8080

ENTRYPOINT ["/usr/bin/caddy"]
CMD ["run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
