GORUN=go run
GOBUILD=go build
BINARY_NAME=dist/assets
GOTEST=go test
GOCLEAN=go clean
GOVET=go vet
GOFMT=go fmt

all: build
run:
	$(GORUN) .
build:
	$(GOBUILD) -o $(BINARY_NAME) -v
test:
	$(GOTEST) -v ./...
clean:
	$(GOCLEAN)
	rm -f $(BINARY_NAME)
vet:
	$(GOVET) ./...
fmt:
	$(GOFMT) -w .

.PHONY: all build test clean vet fmt