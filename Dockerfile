FROM golang:1.23 AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download
RUN go install -tags 'sqlite3' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
COPY . .
RUN make build

FROM debian:bookworm-slim AS runner
WORKDIR /app
COPY --from=builder /go/bin/migrate ./migrate
COPY --from=builder /app/.migrations ./.migrations
COPY --from=builder /app/dist/assets ./assets

CMD ["sh", "-c", "./migrate -verbose -path ./.migrations -database=sqlite3://$ASSETS_DB up && ./assets"]
