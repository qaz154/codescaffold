# {{PROJECT_NAME}}

{{DESCRIPTION}}

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy + Alembic
- **Authentication**: JWT (python-jose + passlib)
- **Testing**: Pytest
- **Linting**: Ruff

## Getting Started

```bash
# Install dependencies
pip install -e ".[dev]"

# Set up environment variables
cp .env.example .env

# Start database with Docker
docker-compose up -d db

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
pytest
```

## Author

{{AUTHOR}} - {{YEAR}}

## License

MIT
