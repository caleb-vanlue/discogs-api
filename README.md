# Discogs Collection API

A proprietary NestJS REST API for managing Discogs music collections and wantlists, with Discogs search, suggestions, automatic sync, and API key authentication. Utilized by side-a, my personal portfolio site.

## Features

- **Collection & Wantlist**: Read your synced Discogs collection and wantlist with sorting and pagination
- **Discogs Search**: Search releases directly against the Discogs API
- **Suggestions**: Track releases you want to suggest to others, stored locally
- **Auto Sync**: Syncs your Discogs collection and wantlist on startup and nightly at midnight UTC
- **Advanced Sorting**: Sort by date added, title, artist, year, rating, genre, or format
- **API Key Authentication**: Secure endpoints with token-based access control
- **Request Validation**: Comprehensive input validation with detailed error messages
- **API Documentation**: Interactive Swagger/OpenAPI documentation

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL with TypeORM
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Language**: TypeScript

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Setup

1. **Clone repository**

   ```bash
   git clone https://github.com/caleb-vanlue/discogs-api.git
   cd discogs-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Required environment variables:

   ```bash
   # API Security
   API_KEY=your-generated-api-key

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=discogs

   # Discogs Integration
   DISCOGS_USERNAME=your_discogs_username
   DISCOGS_API_TOKEN=your_discogs_token

   # Application
   PORT=3000
   NODE_ENV=development

   # Sync behavior (optional, both default to true)
   SYNC_ON_STARTUP=true
   CRON_SYNC_ENABLED=true
   ```

4. **Database setup**

   ```bash
   createdb discogs
   npm run migration:run
   ```

5. **Start application**

   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

## Sync Behavior

On startup the app automatically syncs your Discogs collection and wantlist into the local database. A daily sync also runs at midnight UTC. Both can be disabled independently via environment variables:

- `SYNC_ON_STARTUP=false` — skip the startup sync
- `CRON_SYNC_ENABLED=false` — disable the nightly cron

## API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication

All endpoints require API key authentication via one of:

- Header: `X-API-Key: your-api-key`
- Header: `Authorization: Bearer your-api-key`

### Interactive Documentation

Access Swagger UI at `http://localhost:3000/api` for complete API documentation with request/response examples.

### Endpoints

#### Collection

- `GET /collection/{userId}` — Retrieve user collection with sorting and pagination

#### Wantlist

- `GET /collection/{userId}/wantlist` — Retrieve user wantlist with sorting and pagination

#### Discogs

- `GET /discogs/search` — Search for releases on Discogs
- `GET /discogs/suggestions/{userId}` — Get a user's suggestion list
- `POST /discogs/suggestions/{userId}` — Add a release to a user's suggestions
- `DELETE /discogs/suggestions/{userId}/{releaseId}` — Remove a release from suggestions

### Query Parameters

**Pagination**

- `limit`: Items per page (1–100, default: 50)
- `offset`: Items to skip (default: 0)

**Sorting**

- `sort_by`: Field to sort by
  - Collection: `dateAdded`, `title`, `primaryArtist`, `year`, `rating`, `primaryGenre`, `primaryFormat`
  - Wantlist & Suggestions: `dateAdded`, `title`, `primaryArtist`, `year`, `primaryGenre`, `primaryFormat`
- `sort_order`: `ASC` or `DESC` (default: `DESC`)

**Search** (`GET /discogs/search`)

- `query`: Search string (required)
- `page`: Page number (default: 1)
- `per_page`: Results per page (default: 25)

### Example Requests

**Get collection sorted by title**

```bash
curl -H "X-API-Key: your-key" \
  "http://localhost:3000/collection/username?limit=25&sort_by=title&sort_order=ASC"
```

**Search Discogs**

```bash
curl -H "X-API-Key: your-key" \
  "http://localhost:3000/discogs/search?query=kind+of+blue"
```

**Add to suggestions**

```bash
curl -X POST -H "X-API-Key: your-key" -H "Content-Type: application/json" \
  -d '{"releaseId": 123456}' \
  "http://localhost:3000/discogs/suggestions/username"
```

## Development

### Commands

```bash
npm run start:dev       # Start with hot reload
npm run build           # Build for production
npm test                # Run unit tests
npm run test:cov        # Run tests with coverage
npm run lint            # Lint and fix issues
```

### Database Migrations

```bash
npm run migration:generate -- --name=MigrationName   # Generate from entity changes
npm run migration:run                                  # Apply pending migrations
npm run migration:revert                               # Rollback last migration
```
