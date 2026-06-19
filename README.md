# Real Estate Backend API

Enterprise-grade RESTful API for real estate property management with authentication, property listings, reviews, and booking system.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (Access & Refresh Tokens)
- **Validation:** express-validator
- **Security:** Helmet, CORS, Rate Limiting, mongo-sanitize

## Project Structure

```
├── config/             # Configuration files
│   ├── db.js          # MongoDB connection
│   └── env.js         # Environment variable validation
├── controllers/        # Route handlers / business logic
│   ├── authController.js
│   ├── bookingController.js
│   └── propertyController.js
├── middleware/         # Express middleware
│   ├── authMiddleware.js   # JWT verification & role authorization
│   ├── errorHandler.js     # Global error handling
│   ├── rateLimiter.js      # Rate limiting
│   ├── uploadMiddleware.js # File upload handling
│   └── validate.js         # Validation middleware
├── models/            # Mongoose schemas
│   ├── user.js
│   ├── property.js
│   └── booking.js
├── routes/            # API route definitions
│   ├── admin.js
│   ├── auth.js
│   ├── bookings.js
│   └── properties.js
├── utils/             # Utility functions
│   ├── ApiError.js
│   ├── asyncHandler.js
│   ├── jwt.js
│   └── paginationHelper.js
├── validators/        # Request validation rules
│   ├── authValidator.js
│   ├── bookingValidator.js
│   └── propertyValidator.js
├── uploads/           # Uploaded files directory
├── server.js          # Application entry point
└── package.json
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/refresh-token` | Refresh access token | Public |
| POST | `/api/auth/logout` | Logout user | Public |
| GET | `/api/auth/profile` | Get user profile | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| PUT | `/api/auth/password` | Change password | Private |

### Properties
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/properties` | List properties (filter/sort/paginate) | Public |
| GET | `/api/properties/featured` | Get featured properties | Public |
| GET | `/api/properties/:id` | Get single property | Public |
| POST | `/api/properties` | Create property | Admin/Agent |
| PUT | `/api/properties/:id` | Update property | Admin/Agent |
| DELETE | `/api/properties/:id` | Delete property | Admin |
| POST | `/api/properties/:id/reviews` | Add review | Private |

### Bookings
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/bookings` | Create booking | Private |
| GET | `/api/bookings` | Get all bookings | Admin |
| GET | `/api/bookings/mine` | Get user bookings | Private |
| GET | `/api/bookings/:id` | Get booking details | Private/Admin |
| PATCH | `/api/bookings/:id/status` | Update booking status | Admin |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking | Private |

### Admin
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/dashboard` | Dashboard stats | Admin |
| GET | `/api/admin/users` | List all users | Admin |
| PATCH | `/api/admin/users/:id/toggle-status` | Toggle user active status | Admin |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd real-estate-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Set MONGO_URL, JWT_SECRET, and JWT_REFRESH_SECRET

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | No | development | Environment mode |
| PORT | No | 5000 | Server port |
| MONGO_URL | Yes | - | MongoDB connection string |
| JWT_SECRET | Yes | - | JWT signing secret |
| JWT_EXPIRE | No | 7d | Access token expiry |
| JWT_REFRESH_SECRET | Yes | - | Refresh token secret |
| JWT_REFRESH_EXPIRE | No | 30d | Refresh token expiry |
| CORS_ORIGIN | No | * | Allowed origins |

## Security Features

- Password hashing with bcryptjs (12 salt rounds)
- JWT access + refresh token pattern
- HTTP-only cookies for sensitive tokens
- Request rate limiting (global + auth-specific)
- XSS protection via Helmet
- NoSQL injection prevention (mongo-sanitize)
- CORS configuration
- Request payload size limits
- Input validation on all endpoints
- Password change detection for token invalidation
- Account deactivation support

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "status": "fail",
  "message": "Error description"
}
```

## Pagination

List endpoints support pagination with `page` and `limit` query parameters:
```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "total": 100,
    "currentPage": 1,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "data": [...]
}