# API Documentation

## Authentication Endpoints

### User Authentication

- `POST /login` - User login
- `POST /register` - User registration
- `POST /request-password-reset` - Request password reset link via email
- `POST /reset-password` - Reset password using token from email
- `PATCH /verify-account` - Account verification
- `GET /me` - Get current user information

## Categories

- `GET /categories` - Get all categories
- `POST /categories` - Create category
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

## Features

### Authentication

- JWT Token based authentication
- Role-based access control (USER, ADMIN, SUPER_ADMIN)
- Email notifications for login activity
- Secure password reset with time-limited tokens (5 minutes)
- Account verification system

### Database

- PostgreSQL with Prisma ORM
- User sessions management
- Category management

### Background Processing

- Redis-based queue system using BullMQ
- Email notifications for various user actions
- Async email processing

### Email Notifications

- Login notifications
- Registration confirmations
- Password reset links with tokens
- Account verification notifications

## Environment Variables Required

```env
APP_PORT=8080
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
REDIS_HOST=localhost
REDIS_PORT=6379
TOKEN_SECRET_KEY=your-secret-key
FRONTEND_URL=http://localhost:3000
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-email-password
```

## Overview

Dự án này đã được tích hợp hoàn chỉnh với Swagger/OpenAPI để cung cấp documentation tự động cho tất cả API endpoints.

## Truy cập Swagger UI

Sau khi khởi động server, bạn có thể truy cập Swagger documentation tại:

```
http://localhost:8080/api/docs
```

## Tính năng chính

### 🔐 Authentication Support

- Hỗ trợ JWT Bearer Token authentication
- Có thể test authorization trực tiếp trong Swagger UI
- Persistent authorization (token được lưu trong session)

### 📋 API Categories

- **Auth**: Endpoints cho authentication và authorization
- **Categories**: Quản lý danh mục sản phẩm
- **Users**: Quản lý thông tin người dùng

### 🎯 Schema Documentation

- Tất cả DTOs đều có detailed schema documentation
- Request/Response examples
- Validation rules description
- Enum values documentation

## Cách sử dụng

### 1. Testing Authentication

1. Mở Swagger UI tại `/api/docs`
2. Sử dụng endpoint `POST /api/auth/login` để đăng nhập
3. Copy JWT token từ response
4. Click vào nút "Authorize" ở góc phải trên
5. Paste token vào field "Value" (không cần prefix "Bearer ")
6. Click "Authorize"

### 2. Testing Protected Endpoints

- Sau khi authorize, các protected endpoints sẽ tự động sử dụng token
- Endpoints được bảo vệ sẽ có biểu tượng khóa 🔒

### 3. API Response Formats

Tất cả responses đều được documented với:

- HTTP status codes
- Response schema
- Error response formats

## API Endpoints Summary

### Authentication (`/api/auth`)

- `POST /login` - User login
- `POST /register` - User registration
- `POST /request-password-reset` - Request password reset link via email
- `POST /reset-password` - Reset password using token from email
- `PATCH /verify-account` - Account verification
- `GET /me` - Get current user info (Protected)

### Categories (`/api/categories`)

- `GET /` - Get all categories
- `POST /` - Create new category
- `GET /:id` - Get category by ID
- `PATCH /:id` - Update category
- `DELETE /:id` - Delete category

## Configuration

### Swagger Setup

Swagger được cấu hình trong file `src/swagger.config.ts` với:

- Custom styling
- API metadata
- Authentication schemes
- Server information

### Environment Variables

Đảm bảo các environment variables sau được set:

```env
APP_PORT=8080
DATABASE_URL=postgresql://...
```

## Schema Validation

Tất cả DTOs sử dụng class-validator decorators và Swagger decorators:

```typescript
@ApiProperty({
  description: 'User email address',
  example: 'user@example.com',
  format: 'email'
})
@IsEmail()
email: string;
```

## Error Handling

API sử dụng standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## Development

### Adding New Endpoints

Khi thêm endpoints mới, hãy:

1. **Thêm Swagger decorators vào Controller:**

```typescript
@ApiTags('YourModule')
@Controller('your-module')
export class YourController {
  @Post()
  @ApiOperation({ summary: 'Create item' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  @ApiBody({ type: YourDTO })
  create(@Body() dto: YourDTO) {
    // implementation
  }
}
```

2. **Thêm Swagger decorators vào DTOs:**

```typescript
export class YourDTO {
  @ApiProperty({
    description: 'Property description',
    example: 'example value',
  })
  @IsNotEmpty()
  property: string;
}
```

3. **Update tag trong `swagger.config.ts`:**

```typescript
.addTag('YourModule', 'Your module description')
```

### Best Practices

1. **Descriptions**: Luôn cung cấp mô tả rõ ràng cho operations và properties
2. **Examples**: Thêm examples cho tất cả properties
3. **Status Codes**: Document tất cả possible response status codes
4. **Authentication**: Sử dụng `@ApiBearerAuth('JWT-auth')` cho protected endpoints
5. **Validation**: Combine class-validator với Swagger decorators

## Troubleshooting

### Common Issues

1. **Swagger UI không load:**
   - Check server đang chạy trên đúng port
   - Verify `/api/docs` path

2. **Schema không hiển thị:**
   - Ensure DTOs có Swagger decorators
   - Check import statements

3. **Authentication không work:**
   - Verify JWT token format
   - Check bearer auth configuration

### Useful Commands

```bash
# Start development server
pnpm start:dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## References

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/docs/open-source-tools/swagger-ui/)
