import { ApiProperty } from '@nestjs/swagger';

// Common Response DTOs
export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Validation failed',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({
    description: 'Detailed validation errors',
    example: [
      'email must be a valid email address',
      'password must be at least 8 characters',
    ],
    type: [String],
  })
  message: string[];

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error: string;
}

// Common response schemas for reuse
export const CommonResponses = {
  BadRequest: {
    status: 400,
    description: 'Bad Request - Validation errors',
    type: ValidationErrorResponseDto,
  },
  Unauthorized: {
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: ErrorResponseDto,
  },
  NotFound: {
    status: 404,
    description: 'Not Found - Resource not found',
    type: ErrorResponseDto,
  },
  Conflict: {
    status: 409,
    description: 'Conflict - Resource already exists',
    type: ErrorResponseDto,
  },
  InternalServerError: {
    status: 500,
    description: 'Internal Server Error',
    type: ErrorResponseDto,
  },
};

// Swagger Tags
export const SwaggerTags = {
  AUTH: 'Auth',
  USERS: 'Users',
  CATEGORIES: 'Categories',
  NOTIFICATIONS: 'Notifications',
} as const;

// Common API Property options
export const ApiPropertyOptions = {
  email: {
    description: 'Email address',
    format: 'email',
    example: 'user@example.com',
  },
  password: {
    description: 'Password',
    minLength: 8,
    example: 'password123',
  },
  id: {
    description: 'Unique identifier',
    type: 'number',
    example: 1,
  },
  name: {
    description: 'Name',
    minLength: 2,
    example: 'Sample Name',
  },
  description: {
    description: 'Description',
    example: 'Sample description',
  },
  createdAt: {
    description: 'Creation timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-15T10:00:00Z',
  },
  updatedAt: {
    description: 'Last update timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-15T10:00:00Z',
  },
} as const;
