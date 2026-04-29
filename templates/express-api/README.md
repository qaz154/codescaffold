# {{PROJECT_NAME}}

{{DESCRIPTION}}

## Tech Stack

- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL/MySQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod input validation
- **Internationalization**: i18n support (English/Chinese)
- **Testing**: Vitest with Supertest
- **Deployment**: Docker + Docker Compose + GitHub Actions

## Features

- ✅ Complete JWT Authentication (Register, Login, Profile)
- ✅ Role-based Access Control (admin, user)
- ✅ RESTful API Design
- ✅ Input Validation with Zod
- ✅ Internationalization (i18n)
- ✅ Error Handling Middleware
- ✅ Docker Support
- ✅ CI/CD Pipeline

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start database with Docker
docker-compose up -d db

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev

# Run tests
npm test
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/v1/users/register | Register new user | No |
| POST | /api/v1/users/login | Login | No |
| GET | /api/v1/users/profile | Get current user profile | Yes |
| PUT | /api/v1/users/profile | Update profile | Yes |

### Admin Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/v1/users/ | List all users | Yes (admin) |
| GET | /api/v1/users/:id | Get user by ID | Yes (admin) |
| PUT | /api/v1/users/:id | Update user | Yes (admin) |
| DELETE | /api/v1/users/:id | Delete user | Yes (admin) |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |

## Project Structure

```
{{PROJECT_NAME}}/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/         # Express routes
│   ├── middleware/     # Auth & error handling
│   ├── utils/         # JWT, password, i18n
│   └── server.ts      # Express app setup
├── prisma/
│   └── schema.prisma  # Database schema
├── tests/             # Test files
│   ├── auth.test.ts
│   └── i18n.test.ts
├── docker-compose.yml
├── Dockerfile
└── vitest.config.ts
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/{{PROJECT_NAME}}"
PORT=4000
NODE_ENV=development
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
```

## Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

## Author

{{AUTHOR}} - {{YEAR}}

## License

MIT
