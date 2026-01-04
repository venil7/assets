FROM golang:1.24 AS migrate
RUN go install -tags 'sqlite3' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

FROM oven/bun:1.3 AS builder
WORKDIR /app
COPY . .
RUN bun install
RUN bun run check
RUN bun run build

FROM debian:bookworm-slim AS runner
# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -u 1000 appuser

WORKDIR /app

COPY --from=migrate /go/bin/migrate /usr/sbin/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist/public /app/public
COPY --from=builder /app/dist/backend /app/backend
COPY --from=builder /app/.migrations /app/.migrations

# Clean install, reduce layer size
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /var/cache/apt/*

# Ensure correct permissions
RUN chown -R appuser:appuser /app

ENV ASSETS_APP="./public"
ENV ASSETS_PORT=4020

# Run as non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4020/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

CMD ["sh", "-c", "migrate -verbose -path .migrations -database=sqlite3://$ASSETS_DB up && node ./backend"]
