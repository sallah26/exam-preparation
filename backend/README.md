# Addis Admin Backend

A Node.js backend built with Express, Prisma, and TypeScript following clean architecture principles.

## 🏗️ Architecture

```
src/
├── config/          # Configuration files
├── controllers/     # Business logic
├── middlewares/     # Express middlewares
├── prisma/         # Prisma client
├── routes/         # Route definitions
├── types/          # TypeScript types
├── utils/          # Helper functions
└── server.ts       # Main server file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MariaDB/MySQL
- npm or yarn

### Installation

1. **Clone and install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up the database:**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev --name init
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

## 🔌 API Endpoints

### Users

| Method | Endpoint         | Description                              |
| ------ | ---------------- | ---------------------------------------- |
| GET    | `/api/users`     | Get all users (with pagination & search) |
| GET    | `/api/users/:id` | Get user by ID                           |
| POST   | `/api/users`     | Create new user                          |
| PATCH  | `/api/users/:id` | Update user                              |
| DELETE | `/api/users/:id` | Delete user                              |

### Query Parameters (GET /api/users)

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in name and email

### Request/Response Examples

#### Create User

```bash
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### Get Users with Pagination

```bash
GET /api/users?page=1&limit=5&search=john
```

Response:

```json
{
  "users": [
    {
      "id": "clx123...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 5
}
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

### Code Structure

- **Controllers**: Handle business logic and database operations
- **Routes**: Define API endpoints and connect to controllers
- **Types**: TypeScript interfaces and DTOs
- **Middlewares**: Error handling and request processing
- **Config**: Environment and database configuration

## 🔧 Configuration

### Environment Variables

| Variable       | Description                | Default     |
| -------------- | -------------------------- | ----------- |
| `DATABASE_URL` | Database connection string | -           |
| `DB_HOST`      | Database host              | localhost   |
| `DB_PORT`      | Database port              | 3306        |
| `DB_USERNAME`  | Database username          | root        |
| `DB_PASSWORD`  | Database password          | password    |
| `DB_NAME`      | Database name              | addis_admin |
| `PORT`         | Server port                | 3000        |
| `NODE_ENV`     | Environment                | development |

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Run `npm run build`
4. Start with `npm start`

## 📝 Future Enhancements

- [ ] Authentication & Authorization
- [ ] Input validation middleware
- [ ] Rate limiting
- [ ] Logging system
- [ ] API documentation (Swagger)
- [ ] Unit and integration tests
- [ ] Docker configuration
