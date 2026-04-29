# {{PROJECT_NAME}}

{{DESCRIPTION}}

## Tech Stack

- **Language**: Go 1.22
- **Framework**: Gin
- **Database**: PostgreSQL with pgx
- **Testing**: Go testing
- **Build**: Docker multi-stage build

## Getting Started

```bash
# Start database with Docker
docker-compose up -d db

# Run the server
go run cmd/server/main.go
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /api/v1/users | Create user |
| GET | /api/v1/users | List users |
| GET | /api/v1/users/:id | Get user |
| PUT | /api/v1/users/:id | Update user |
| DELETE | /api/v1/users/:id | Delete user |

## Testing

```bash
go test -v ./...
```

## Author

{{AUTHOR}} - {{YEAR}}

## License

MIT
