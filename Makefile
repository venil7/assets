DOCKERBUILD=docker buildx build -t "assets:latest" .
MIGRATE=migrate -path ./.migrations -database=sqlite3://assets.db
DOCKER=docker compose

all: docker
docker:
	$(DOCKERBUILD)
migrate:
	$(MIGRATE) up
migrdown:
	$(MIGRATE) down
deploy_headless:
	$(DOCKER) down
	$(DOCKER) up -d

.PHONY: all docker