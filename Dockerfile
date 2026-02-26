  FROM alpine:3.19 AS builder

  RUN apk add --no-cache curl ca-certificates
  
  WORKDIR /build
  
  ENV CADDY_VERSION=2.11
  
  RUN curl -L https://github.com/caddyserver/caddy/releases/download/v${CADDY_VERSION}/caddy_${CADDY_VERSION}_linux_amd64.tar.gz \
      -o caddy.tar.gz \
   && tar -xzf caddy.tar.gz \
   && chmod +x caddy

  FROM gcr.io/distroless/static:nonroot
  
  COPY --from=builder /build/caddy /caddy
  COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
  COPY /build-config/caddy/Caddyfile /etc/caddy/Caddyfile
  
  USER nonroot:nonroot
  
  EXPOSE 8080
  
  ENTRYPOINT ["/caddy"]
  CMD ["run", "--config", "/etc/caddy/Caddyfile"]