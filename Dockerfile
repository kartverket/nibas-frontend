# Intended to be used by CI
FROM caddy:2-alpine@sha256:80589bc2e950ea6931c08a43265082aa8111ebf8dc4d880a97f510865d5fbde8

COPY /build /srv

ENV PORT=8080
ENV BACKEND_HOST=nibas-backend.nibas-main:8080
ENV AUT_IDPORTEN=aut-idporten.aut:8080
RUN apk --no-cache add curl tzdata
RUN addgroup -g 1242 nibas; \
  adduser -u 1242 -D -G nibas nibas
COPY build-config/caddy/Caddyfile /etc/caddy/Caddyfile
ENV TZ=Europe/Oslo
USER 1242
EXPOSE 8080