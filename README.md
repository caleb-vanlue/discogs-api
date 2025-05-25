# Discogs Collection API

A NestJS REST API for managing Discogs music collections and wantlists with CRUD operations, advanced sorting, pagination, and API key authentication.

## Features

- **Collection Management**: Add, remove, and organize Discogs collection items with ratings and notes
- **Wantlist Management**: Track desired releases with personal notes
- **Advanced Sorting**: Sort by date added, title, artist, year, rating, genre, or format
- **Pagination**: Handle large collections with configurable page sizes
- **Statistics**: Collection and wantlist analytics with rating averages
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

### Core Endpoints

#### Collections

- `GET /collection/{userId}` - Retrieve user collection with sorting and pagination
- `POST /collection/{userId}/collection` - Add release to collection
- `DELETE /collection/{userId}/collection/{releaseId}` - Remove from collection
- `GET /collection/{userId}/stats` - Collection statistics

#### Wantlists

- `GET /collection/{userId}/wantlist` - Retrieve user wantlist
- `POST /collection/{userId}/wantlist` - Add release to wantlist
- `DELETE /collection/{userId}/wantlist/{releaseId}` - Remove from wantlist

#### Releases

- `GET /releases` - Browse all releases with sorting and pagination
- `GET /releases/{discogsId}` - Get specific release by Discogs ID

### Query Parameters

**Pagination**

- `limit`: Items per page (1-100, default: 50)
- `offset`: Items to skip (default: 0)

**Sorting**

- `sort_by`: Field to sort by
  - Collections: `dateAdded`, `title`, `primaryArtist`, `year`, `rating`, `primaryGenre`, `primaryFormat`
  - Wantlists: `dateAdded`, `title`, `primaryArtist`, `year`, `primaryGenre`, `primaryFormat`
- `sort_order`: `ASC` or `DESC` (default: `DESC`)

### Example Requests

**Get collection with sorting**

```bash
curl -H "X-API-Key: your-key" \
  "http://localhost:3000/collection/username?limit=25&sort_by=title&sort_order=ASC"
```

**Add to collection**

```bash
curl -X POST -H "X-API-Key: your-key" -H "Content-Type: application/json" \
  -d '{"releaseId": 123456, "rating": 5, "notes": "Signed copy"}' \
  "http://localhost:3000/collection/username/collection"
```

## Development

### Database Operations

**Create migration**

```bash
npm run migration:generate -- --name=MigrationName
```

**Run migrations**

```bash
npm run migration:run
```

**Revert migration**

```bash
npm run migration:revert
```

## Deployment

### Environment-Specific Configuration

- Use separate `.env` files for different environments
- Validate configuration for each deployment target
- Ensure API keys are securely managed in production
