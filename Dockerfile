FROM catthehacker/ubuntu:act-latest

RUN apt update && apt install -y golang-go
# RUN go install -tags 'sqlite3' github.com/golang-migrate/migrate/v4/cmd/migrate@latest