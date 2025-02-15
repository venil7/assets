FROM golang:1.23 as builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN make build

FROM alpine:latest as runner
WORKDIR /app
COPY --from=builder /app/dist/assets ./assets
CMD ["./assets"]
