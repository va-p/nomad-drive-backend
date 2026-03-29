# 🚗 Nomad Drive Backend

> A modern vehicle rental platform backend for remote destinations, starting with Atins in Lençóis Maranhenses, Brazil.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.16-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.5-2D3748.svg)](https://www.prisma.io/)
[![MariaDB](https://img.shields.io/badge/MariaDB-3.5-003545.svg)](https://mariadb.org/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🔐 **Dual Authentication**: Support for both JWT and Clerk SSO authentication
- 🚙 **Vehicle Management**: Complete CRUD operations for vehicle fleet management
- 📅 **Rental System**: Advanced booking system with availability checking and conflict prevention
- 👥 **User Management**: User registration, authentication, and profile management
- 🔒 **Role-Based Access Control**: Admin and user roles with different permission levels
- ✅ **Input Validation**: Comprehensive request validation using Zod schemas
- 🚀 **Performance Optimized**: Database indexes for frequently queried fields
- 📝 **Type-Safe**: Full TypeScript implementation with strict type checking
- 🔧 **Error Handling**: Centralized error handling with detailed error messages
- 📊 **Logging**: Winston-based logging system for production monitoring
- 🛡️ **Security**: Helmet.js, CORS, rate limiting, and secure password hashing

## 🛠️ Tech Stack

### Core Technologies

- **Runtime**: Node.js 22.16.0
- **Language**: TypeScript 5.9
- **Framework**: Express.js 5.2
- **Database**: MariaDB 3.5
- **ORM**: Prisma 7.5 with MariaDB adapter

### Key Dependencies

- **Authentication**: @clerk/express, jsonwebtoken, argon2
- **Validation**: Zod 4.3
- **Security**: Helmet, CORS
- **Logging**: Winston
- **Environment**: @dotenvx/dotenvx
- **Development**: tsx, TypeScript

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v22.16.0 or higher ([Download](https://nodejs.org/))
- **Yarn**: v4.6.0 or higher ([Installation](https://yarnpkg.com/getting-started/install))
- **MariaDB**: v10.x or higher ([Download](https://mariadb.org/download/))

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/nomad-drive-backend.git
cd nomad-drive-backend
```

2. **Install dependencies**

```bash
yarn install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` and configure your environment variables (see [Configuration](#-configuration)).

## ⚙️ Configuration

Create a `.env` file in the root directory by following the example in the ".env.example" file.

### Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `3000` | Yes |
| `API_BASE_URL` | API base URL | `http://localhost:3000` | Yes |
| `DATABASE_URL` | MariaDB connection string | - | Yes |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` | No |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | - | No |
| `CLERK_SECRET_KEY` | Clerk secret key | - | No |
| `CORS_ORIGIN` | Allowed CORS origins | `*` | No |

## 🗄️ Database Setup

1. **Create a MariaDB database**

```bash
mysql -u root -p
```

```sql
CREATE DATABASE nomaddrive_dev;
CREATE USER 'nomad_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON nomaddrive_dev.* TO 'nomad_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

2. **Run Prisma migrations**

```bash
yarn prisma:migrate
```

3. **Seed the database** (Optional)

```bash
yarn prisma:seed
```

This will populate your database with sample vehicles for the Atins location.

4. **Generate Prisma Client**

```bash
yarn prisma:generate
```

## 🏃 Running the Application

### Development Mode

```bash
yarn dev
```

The server will start on `http://localhost:3000` with hot-reloading enabled.

### Production Mode

1. **Build the application**

```bash
yarn build
```

2. **Start the production server**

```bash
yarn start
```

### Prisma Studio (Database GUI)

```bash
yarn prisma:studio
```

Access Prisma Studio at `http://localhost:5555` to view and edit your database.

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication

Most endpoints require authentication via JWT token or Clerk session.

**Authorization Header:**

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### 🔐 Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/auth/me` | Get current user | Private |
| GET | `/auth/clerk_sso` | Clerk SSO login | Public |
| PUT | `/auth/password` | Update password | Private |
| POST | `/auth/forgot-password` | Request password reset | Public |

#### 🚙 Vehicles

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/vehicle` | Get all active vehicles | Private |
| GET | `/vehicle/:id` | Get vehicle by ID | Private |
| POST | `/vehicle` | Create new vehicle | Admin |
| PUT | `/vehicle/:id` | Update vehicle | Admin |
| PATCH | `/vehicle/:id` | Partially update vehicle | Admin |
| DELETE | `/vehicle/:id` | Soft delete vehicle | Admin |

#### 📅 Rentals

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/rentals/me` | Get user's rentals | Private |
| POST | `/rentals` | Create new rental | Private |
| PUT | `/rentals/:id/cancel` | Cancel rental | Private |

### Example Requests

#### Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João",
    "lastName": "Silva",
    "email": "joao@example.com",
    "phone": "+55 98 98765-4321",
    "password": "SecurePass123!"
  }'
```

#### Get Vehicles

```bash
curl http://localhost:3000/api/v1/vehicle \
  -H "Authorization: Bearer your-jwt-token"
```

#### Create Rental

```bash
curl -X POST http://localhost:3000/api/v1/rentals \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "uuid-of-vehicle",
    "startDate": "2026-04-01T00:00:00Z",
    "endDate": "2026-04-05T00:00:00Z"
  }'
```

### Response Format

**Success Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

## 📁 Project Structure

```
nomad-drive-backend/
├── prisma/
│   ├── migrations/          # Database migration files
│   ├── schema.prisma        # Prisma schema definition
│   └── seed.ts             # Database seeding script
├── src/
│   ├── controllers/        # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── rental.controller.ts
│   │   └── vehicle.controller.ts
│   ├── middlewares/        # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   ├── notFoundHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validate.ts
│   ├── routes/            # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── rental.routes.ts
│   │   ├── user.routes.ts
│   │   └── vehicles.routes.ts
│   ├── schemas/           # Zod validation schemas
│   │   ├── auth.schema.ts
│   │   ├── rental.schema.ts
│   │   └── vehicle.schema.ts
│   ├── services/          # Business logic services
│   │   └── webhook.service.ts
│   ├── utils/             # Utility functions
│   │   ├── jwt.ts
│   │   └── logger.ts
│   ├── lib/               # Library configurations
│   │   └── prisma.ts
│   └── server.ts          # Application entry point
├── logs/                  # Application logs
├── .env                   # Environment variables
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## 💻 Development

### Available Scripts

```bash
# Development server with hot-reload
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Generate Prisma Client
yarn prisma:generate

# Run database migrations
yarn prisma:migrate

# Deploy migrations (production)
yarn prisma:migrate:prod

# Open Prisma Studio
yarn prisma:studio

# Seed database
yarn prisma:seed

# Run tests
yarn test
```

### Database Schema

The application uses the following main models:

- **User**: User accounts with authentication
- **Vehicle**: Vehicle fleet information
- **Rental**: Booking/rental records

See `prisma/schema.prisma` for detailed schema definition.

### Adding a New Feature

1. **Create schema validation** in `src/schemas/`
2. **Create controller** in `src/controllers/`
3. **Create route** in `src/routes/`
4. **Add route to server** in `src/server.ts`
5. **Update this README** with new endpoints

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure proper `DATABASE_URL`
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Set up log rotation
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring (e.g., PM2, New Relic)
- [ ] Configure backup strategy
- [ ] Run `yarn prisma:migrate:prod`

### Recommended Deployment Platforms

- **VPS**: DigitalOcean, Linode, AWS EC2
- **Platform**: Render, Railway, Fly.io
- **Container**: Docker, Kubernetes


## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Write descriptive commit messages
- Add tests for new features
- Update documentation
- Use Zod for input validation
- Handle errors properly

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Vitor Azevedo Paiva**

## 🙏 Acknowledgments

- Built for the amazing remote destination of Atins, Lençóis Maranhenses
- Powered by the Prisma + MariaDB combo
- Secured with Clerk authentication

## 📞 Support

For support, email paiva.v@icloud.com or open an issue in the repository.

---

**Happy Coding! 🚗💨**
