FROM golang:1.23 AS migrate
RUN go install -tags 'sqlite3' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

FROM debian:bookworm-slim AS runner
WORKDIR /app

COPY . .

COPY --from=migrate /go/bin/migrate /usr/sbin/
RUN apt update
RUN apt install -y ca-certificates curl unzip
RUN curl -fsSL https://bun.sh/install | bash
RUN ln -s /root/.bun/bin/bun /usr/sbin/bun
# ENV PATH="/root/.bun/bin:${PATH}"
RUN bun install
RUN bun run check

CMD ["sh", "-c", "migrate -verbose -path ./.migrations -database=sqlite3://$ASSETS_DB up && bun run backend:dev"]
