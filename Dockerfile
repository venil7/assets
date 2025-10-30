FROM golang:1.24 AS migrate
RUN go install -tags 'sqlite3' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

FROM oven/bun:1.3 AS builder
WORKDIR /app
COPY . .
RUN bun install
RUN bun run check
RUN bun run build

FROM debian:bookworm-slim AS runner
WORKDIR /app
COPY --from=migrate /go/bin/migrate /usr/sbin/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist/public /app/public
COPY --from=builder /app/dist/backend /app/backend
COPY --from=builder /app/.migrations /app/.migrations
RUN apt update
RUN apt install -y ca-certificates

ENV ASSETS_APP="./public"
ENV ASSETS_PORT=4020

CMD ["sh", "-c", "migrate -verbose -path .migrations -database=sqlite3://$ASSETS_DB up && ./backend"]
