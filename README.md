# store-management-api

A RESTful API for managing products and users with authentication, role-based access control, validation, pagination, and soft delete, built using Express, Prisma, and PostgreSQL.

## Features
- User authentication (register, login, & logout)
- CRUD Product 
- Input validation using Zod
- Pagination for product list
- Filter by category
- Search product by name
- Soft delete
- Prisma ORM with PostgreSQL
- Role-based access control (in progress)

## Tech Stack
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- Zod (validation)

## ERD Diagram

```mermaid
erDiagram
USER ||--o{ PRODUCT : creates
USER {
  string id
  string email
  string password
  string name
  enum role
  datetime createdAt
  datetime updatedAt
}
PRODUCT {
  string id
  string name
  float price
  int stock
  enum category
  string description
  boolean isDeleted
  string userId
  datetime createdAt
  datetime updatedAt
}

## Installation
1. Clone repository
git clone https://github.com/username/project-name.git

2. Install dependencies
npm install

3. Setup environment variables
Create `.env` file:
DATABASE_URL="your_database_url"

4. Run migration
npx prisma migrate dev

5. Start server
npm run dev

## API Endpoints

### Auth
POST /auth/register
POST /auth/login
POST /auth/logout

### Products
GET /products
GET /products/:id
POST /products
PUT /products/:id
DELETE /products/:id

## Query Features
- Pagination: ?page=1&limit=10
- Search: ?search=keyboard
- Category filter: ?category=FOOD

## Notes
- Soft delete is implemented using `isDeleted` flag
- All product queries exclude deleted items

## Author
Built by Sarah Nur Haibah
