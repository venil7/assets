GORUN=go run
GOBUILD=go build
BINARY_NAME=dist/assets
GOTEST=go test
GOCLEAN=go clean
GOVET=go vet
GOFMT=go fmt
DOCKERBUILD=docker buildx build -t "assets:latest" .
MIGRATE=migrate -path ./.migrations -database=sqlite3://assets.db
DOCKER=docker compose

all: build
migrate:
	$(MIGRATE) up
migrdown:
	$(MIGRATE) down
run:
	SLOG_LEVEL=DEBUG \
	ASSETS_BIND=0.0.0.0:8080 \
	ASSETS_DB=./assets.db \
	$(GORUN) .
build:
	$(GOBUILD) -o $(BINARY_NAME) -v
docker:
	$(DOCKERBUILD)
test:
	$(GOTEST) -v ./...
clean:
	$(GOCLEAN)
	rm -f $(BINARY_NAME)
deploy_headless:
	$(DOCKER) down
	$(DOCKER) up -d
vet:
	$(GOVET) ./...
fmt:
	$(GOFMT) -w .

.PHONY: all build test clean vet fmt