import { UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserResponseDTO {
  @ApiProperty({
    example: 1,
  })
  id: number;

  @ApiProperty({
    example: '',
  })
  fullName: string;

  @ApiProperty({
    example: '',
  })
  userName: string;

  @ApiProperty({
    example: '',
  })
  email: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  phoneNumber?: string;

  @ApiProperty({
    example: false,
  })
  isVerifiedAccount: boolean;

  @ApiProperty({
    example: '',
    required: false,
  })
  verifiedDate?: Date;

  @ApiProperty({
    example: '',
    enum: UserRole,
  })
  role: UserRole;

  @ApiProperty({
    example: '',
  })
  lastLoginDate?: Date;

  @ApiProperty({
    example: '',
  })
  createdAt: Date;

  @ApiProperty({
    example: '',
  })
  updatedAt: Date;
}

export class GetUsersResponseDTO {
  @ApiProperty({
    type: [GetUserResponseDTO],
  })
  users: GetUserResponseDTO[];

  @ApiProperty({
    example: 0,
  })
  total: number;

  @ApiProperty({
    example: 0,
  })
  page: number;

  @ApiProperty({
    example: 0,
  })
  limit: number;
}
