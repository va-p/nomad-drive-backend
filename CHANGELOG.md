# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-03-20

### 🎨 New Features

#### Multi-Image Gallery for Vehicles

Added comprehensive multi-image gallery support for vehicles with full CRUD operations.

**Database Changes:**
- Created new `vehicle_images` table with one-to-many relationship to vehicles
- Added foreign key with CASCADE DELETE (deleting vehicle removes all images)
- Added performance indexes for `vehicleId`, `isPrimary`, and `displayOrder`
- Stores image URLs (not base64) for better performance and scalability

**API Endpoints:**
- **Modified Endpoints:**
  - `POST /api/v1/vehicle` - Now accepts optional `images` array
  - `PUT/PATCH /api/v1/vehicle/:id` - Supports image replacement
  - `GET /api/v1/vehicle` - Returns vehicles with images sorted by displayOrder
  - `GET /api/v1/vehicle/:id` - Includes images in response

- **New Image-Specific Endpoints:**
  - `POST /api/v1/vehicle/:id/images` - Add images to existing vehicle
  - `PUT /api/v1/vehicle/:id/images/:imageId` - Update specific image
  - `DELETE /api/v1/vehicle/:id/images/:imageId` - Delete specific image
  - `PATCH /api/v1/vehicle/:id/images/reorder` - Reorder vehicle images

**Features:**
- Primary image designation (only one per vehicle)
- Custom display ordering with auto-increment
- Optional image captions (max 255 characters)
- HTTPS URL validation
- Duplicate URL prevention per vehicle
- Automatic primary image assignment (first image if none specified)
- Auto-promotion of next image when primary is deleted
- Admin-only access for image modifications

**Business Logic:**
- Backward compatible (vehicles can exist without images)
- Images optional during vehicle creation
- Cascade delete ensures data integrity
- Transaction support for reordering operations
- Images always returned sorted by `displayOrder` ascending

**Files Added:**
- `prisma/migrations/20260320155003_add_vehicle_images/migration.sql`
- `src/types/vehicle.types.ts` - TypeScript type definitions
- `VEHICLE_IMAGES_GUIDE.md` - Comprehensive feature documentation
- `VEHICLE_IMAGES_SETUP.md` - Setup and installation instructions

**Files Modified:**
- `prisma/schema.prisma` - Added VehicleImage model
- `src/controllers/vehicle.controller.ts` - Image handling in all CRUD operations
- `src/schemas/vehicle.schema.ts` - Image validation schemas
- `src/routes/vehicles.routes.ts` - New image routes

**Documentation:**
- Complete API documentation with examples
- Migration guide
- Best practices for image URLs and storage
- TypeScript type definitions
- Testing checklist

---

## [1.1.0] - 2026-03-19

### 🎉 Major Improvements

#### ✅ Fixed Critical Issues

1. **Fixed Prisma Seed Command**
   - Resolved `PrismaClientConstructorValidationError` by importing prisma client from `src/lib/prisma.ts`
   - Seed now uses the correct MariaDB adapter configuration
   - Issue: Seed script was creating new PrismaClient without adapter, causing incompatibility with Prisma v7.5

2. **Fixed passengerCapacity Bug in Vehicle Registration**
   - Added missing `passengerCapacity` field to vehicle registration endpoint
   - Updated validation to require passengerCapacity
   - Fixed vehicle update endpoint to handle passengerCapacity

3. **Fixed Authentication on Vehicle Registration**
   - Added authentication requirement to vehicle registration endpoint
   - Added admin role check - only admins can register new vehicles
   - Improved security by preventing unauthorized vehicle creation

#### 🚀 Performance Improvements

4. **Added Database Indexes**
   - **Users Table:**
     - Index on `email` for faster login lookups
     - Index on `clerkId` for SSO authentication
     - Index on `role` for permission checks
   - **Vehicles Table:**
     - Index on `status` for filtering available vehicles
     - Index on `type` for vehicle type queries
     - Index on `isActive` for active vehicle lookups
     - Composite index on `status, isActive` for common queries
   - **Rentals Table:**
     - Index on `userId` for user rental lookups
     - Index on `vehicleId` for vehicle availability checks
     - Index on `status` for rental status filtering
     - Index on `startDate, endDate` for date range queries
     - Composite index on `vehicleId, status, startDate, endDate` for conflict detection
   - Migration: `20260319002627_add_performance_indexes`

#### ✨ Code Quality Improvements

5. **Added Zod Validation**
   - Installed Zod v4.3.6 for runtime type validation
   - Created validation schemas:
     - `auth.schema.ts` - User registration, login, password updates
     - `vehicle.schema.ts` - Vehicle registration, updates, queries
     - `rental.schema.ts` - Rental creation, status updates, queries
   - Created validation middleware (`validate.ts`) with support for:
     - Body validation
     - Query parameter validation
     - URL parameter validation
     - Multiple target validation
   - Applied validation to all routes:
     - Auth routes: register, login, password updates, Clerk SSO
     - Vehicle routes: create, update, get by ID, delete
     - Rental routes: create, cancel
   - Updated error handler to properly format Zod validation errors
   - Removed manual validation logic from controllers (DRY principle)

6. **Enhanced Input Validation**
   - Email validation with proper format checking
   - Password strength requirements:
     - Minimum 8 characters
     - At least one lowercase letter
     - At least one uppercase letter
     - At least one number
     - At least one special character
   - Phone number format validation
   - Name validation (letters, spaces, hyphens, apostrophes only)
   - License plate format validation
   - Date validation with future date checks
   - UUID validation for IDs
   - Passenger capacity limits (1-10)
   - Daily rate limits and positive number checks

#### 📚 Documentation

7. **Comprehensive README**
   - Added professional README with badges
   - Documented all features and tech stack
   - Complete installation and setup instructions
   - Environment variable documentation with examples
   - Database setup guide
   - API documentation with all endpoints
   - Example curl commands for common operations
   - Project structure explanation
   - Development workflow guide
   - Deployment checklist
   - Contributing guidelines

### 🔧 Technical Changes

#### Code Structure
- Created `src/schemas/` directory for Zod validation schemas
- Reorganized validation logic into reusable middleware
- Improved type safety with TypeScript strict mode
- Added proper type assertions for validated data

#### Dependencies Added
- `zod@4.3.6` - Runtime type validation

#### Bug Fixes
- Fixed TypeScript strict mode errors in:
  - `validate.ts` - Type assertions for request objects
  - `errorHandler.ts` - Zod error handling
  - `auth.middleware.ts` - Token parsing null checks
  - `jwt.ts` - JWT sign options type casting
  - `logger.ts` - Winston transport types
  - `rateLimiter.ts` - Store undefined checks
  - `server.ts` - Clerk middleware options
  - All controllers - Type assertions for validated params/query

#### Controllers Simplified
- Removed manual validation from all controllers:
  - `auth.controller.ts`
  - `vehicle.controller.ts`
  - `rental.controller.ts`
- Controllers now rely on Zod middleware for validation
- Cleaner, more maintainable code
- Better error messages from Zod

#### Security Improvements
- Added admin-only restriction to vehicle registration
- Improved token validation with proper null checks
- Enhanced password requirements
- Better input sanitization through Zod schemas

#### Error Handling
- Centralized validation error formatting
- Consistent error response structure
- Detailed field-level error messages
- Support for multiple validation errors in one response

### 📊 Database Changes

#### Migrations
1. `20260319002627_add_performance_indexes` - Added 11 indexes for performance optimization

#### Schema Enhancements
- All existing indexes retained
- Added composite indexes for common query patterns
- Optimized for:
  - User authentication (email, clerkId)
  - Vehicle availability searches (status, type, isActive)
  - Rental conflict detection (vehicleId, dates, status)
  - User rental history (userId)

### 🎯 API Changes

#### Breaking Changes
None - All changes are backward compatible

#### Enhanced Responses
- Validation errors now include field-specific messages
- Better error descriptions for client-side handling
- Consistent response format across all endpoints

### 📝 Files Created
- `src/schemas/auth.schema.ts`
- `src/schemas/vehicle.schema.ts`
- `src/schemas/rental.schema.ts`
- `src/middlewares/validate.ts`
- `README.md` (comprehensive documentation)
- `CHANGELOG.md` (this file)

### 📝 Files Modified
- `prisma/seed.ts` - Fixed Prisma client import
- `prisma/schema.prisma` - Added database indexes
- `src/controllers/auth.controller.ts` - Removed manual validation
- `src/controllers/vehicle.controller.ts` - Added admin checks, removed manual validation
- `src/controllers/rental.controller.ts` - Removed manual validation
- `src/routes/auth.routes.ts` - Added Zod validation middleware
- `src/routes/vehicles.routes.ts` - Added Zod validation middleware
- `src/routes/rental.routes.ts` - Added Zod validation middleware
- `src/middlewares/errorHandler.ts` - Added Zod error handling
- `src/middlewares/auth.middleware.ts` - Fixed TypeScript errors
- `src/middlewares/rateLimiter.ts` - Fixed TypeScript errors
- `src/utils/jwt.ts` - Fixed TypeScript errors
- `src/utils/logger.ts` - Fixed TypeScript errors
- `src/server.ts` - Fixed Clerk middleware configuration

### ✅ Testing
- ✅ Seed command works correctly
- ✅ TypeScript compilation successful
- ✅ No diagnostic errors
- ✅ All endpoints validated with Zod schemas
- ✅ Database indexes created successfully

### 🔮 Future Improvements
- Add unit tests for controllers
- Add integration tests for API endpoints
- Add Swagger/OpenAPI documentation
- Implement refresh token mechanism
- Add email service for password reset
- Add Docker configuration
- Add CI/CD pipeline
- Add request/response logging middleware
- Add API versioning strategy
- Add pagination for list endpoints
- Add filtering and sorting for vehicle queries
- Add booking conflict resolution
- Add vehicle maintenance tracking
- Add rental payment processing

---

## [1.0.0] - 2026-03-16

### Initial Release
- Basic authentication system (JWT + Clerk)
- Vehicle management CRUD operations
- Rental booking system
- User management
- Database schema with Prisma ORM
- MariaDB integration
- Express.js REST API
- TypeScript implementation
- Winston logging
- Security middleware (Helmet, CORS, Rate Limiting)