
FROM dhi.io/caddy:2.11.7-debian13@sha256:6cff7cb12f5fce38d05d92677f45af923661ff185aa6e1e72505a09cb6882201

COPY /build /srv

ENV PORT=8080
ENV TZ=Europe/Oslo
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
USER 65532
EXPOSE 8080