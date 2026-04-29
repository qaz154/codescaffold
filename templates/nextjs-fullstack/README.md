# {{PROJECT_NAME}}

{{DESCRIPTION}}

## Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Backend**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Vitest
- **Deployment**: Docker + Docker Compose

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
```

## Project Structure

```
{{PROJECT_NAME}}/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utilities
│   └── db.ts             # Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
├── src/                   # Express backend
│   ├── routes/
│   ├── controllers/
│   └── middleware/
├── tests/                # Test files
├── docker-compose.yml
└── Dockerfile
```

## Author

{{AUTHOR}} - {{YEAR}}

## License

MIT
