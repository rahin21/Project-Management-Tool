# Project Management Tool (NestJS + Next.js)

## 🚀 Live Demo

- **Frontend**: https://project-management-tool-beige.vercel.app/
- **Backend API**: https://project-management-tool-chan.onrender.com/api
- **API Documentation**: https://project-management-tool-chan.onrender.com/api/docs

## Local Development

Run everything with Docker. No manual Postgres setup needed.

## Quick start

1. Create `.env` in project root (see Environment below)
2. Start services:

```
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Swagger: http://localhost:3001/api/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Elasticsearch: http://localhost:9200

3. Seed an admin user:

```
curl -X POST http://localhost:3001/api/users/health
curl -X POST http://localhost:3001/api/users/seed-admin -H 'Content-Type: application/json' -d '{"email":"admin@example.com","password":"admin123"}'
```

Login:

```
curl -X POST http://localhost:3001/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@example.com","password":"admin123"}'
```

## Tech
- NestJS (REST + GraphQL)
- PostgreSQL (TypeORM, sync on dev)
- Redis (queues/cache)
- Elasticsearch (search)
- WebSockets (notifications)
- Next.js frontend

## Environment

Create `.env` in project root:

```
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=pmtool
REDIS_HOST=redis
REDIS_PORT=6379
ELASTICSEARCH_NODE=http://elasticsearch:9200
JWT_SECRET=dev_secret
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Scripts

- docker compose up --build (start full stack)
- Backend swagger at /api/docs

## Notes

This is a minimal but working skeleton implementing schema, auth, projects, tasks with dependencies and topo sort, and notifications foundation. Extend with RBAC guards, GraphQL resolvers, tests, and search indexing as needed.


