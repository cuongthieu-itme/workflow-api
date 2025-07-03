import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDTO,
  UpdateUserByIdDTO,
  GetUserResponseDTO,
  GetUsersResponseDTO,
} from './dtos';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard, AuthRoles, PaginationQuery } from 'src/common/decorators';
import { UserRole } from '@prisma/client';
import { IPaginationQuery } from 'src/common/types';

@ApiTags('Users')
@AuthGuard()
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @AuthRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo người dùng mới' })
  async createUser(
    @Body() createUserDto: CreateUserDTO,
  ): Promise<GetUserResponseDTO> {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @AuthRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách người dùng có phân trang' })
  async findAllUsers(
    @PaginationQuery() paginationQuery: IPaginationQuery,
  ): Promise<GetUsersResponseDTO> {
    return this.userService.findAllUsers(paginationQuery);
  }

  @Get(':id')
  @AuthGuard()
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  async findUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetUserResponseDTO> {
    const user = await this.userService.findUserById(id);
    const { password, ...userResponse } = user;
    return userResponse as GetUserResponseDTO;
  }

  @Patch(':id')
  @AuthGuard()
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng theo ID' })
  async updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserByIdDTO,
  ): Promise<GetUserResponseDTO> {
    const updatedUser = await this.userService.updateUserById(
      id,
      updateUserDto,
    );
    const { password, ...userResponse } = updatedUser;
    return userResponse as GetUserResponseDTO;
  }

  @Delete(':id')
  @AuthRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa người dùng theo ID' })
  async deleteUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetUserResponseDTO> {
    return this.userService.deleteUserById(id);
  }

  @Get('username/:username')
  @AuthGuard()
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo tên đăng nhập' })
  async findUserByUsername(
    @Param('username') username: string,
  ): Promise<GetUserResponseDTO> {
    const user = await this.userService.findUserByUserName(username, true);
    const { password, ...userResponse } = user;
    return userResponse as GetUserResponseDTO;
  }

  @Get('email/:email')
  @AuthGuard()
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo email' })
  async findUserByEmail(
    @Param('email') email: string,
  ): Promise<GetUserResponseDTO> {
    const user = await this.userService.findUserByEmail(email, true);
    const { password, ...userResponse } = user;
    return userResponse as GetUserResponseDTO;
  }
}
