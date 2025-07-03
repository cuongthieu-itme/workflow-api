import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDTO, UpdateUserByIdDTO } from './dtos';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { HashService } from 'src/common/hash/hash.service';
import { IPaginationQuery } from 'src/common/types';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async createUser(dto: CreateUserDTO) {
    const duplicatedEmailAddress = await this.findUserByEmail(dto.email);
    if (duplicatedEmailAddress) {
      throw new ConflictException('Email đã tồn tại');
    }

    const duplicatedUserName = await this.findUserByUserName(dto.userName);
    if (duplicatedUserName) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    // TODO: Uncomment after running migration
    // if (dto.phoneNumber) {
    //   const duplicatedPhoneNumber = await this.findUserByPhoneNumber(dto.phoneNumber);
    //   if (duplicatedPhoneNumber) {
    //     throw new ConflictException('Số điện thoại đã tồn tại');
    //   }
    // }

    const passwordHashed = await this.hashService.encode(dto.password);
    const user = await this.prismaService.user.create({
      data: {
        email: dto.email,
        userName: dto.userName,
        // phoneNumber: dto.phoneNumber, // TODO: Uncomment after migration
        password: passwordHashed,
        fullName: dto.fullName,
        role: dto.role,
      },
    });

    // Remove password from response
    const { password, ...userResponse } = user;
    return userResponse as any;
  }

  async updateVerificationState(id: number, isVerify: boolean) {
    let data: Record<string, any> = {};
    if (isVerify) {
      data = {
        isVerifiedAccount: true,
        verifiedDate: new Date(),
      };
    } else {
      data = {
        isVerifiedAccount: false,
        verifiedDate: null,
      };
    }
    return this.prismaService.user.update({
      where: { id },
      data,
    });
  }

  async updateUserById(id: number, dto: UpdateUserByIdDTO) {
    if (dto.password) {
      dto.password = await this.hashService.encode(dto.password);
    }

    if (dto.userName) {
      const duplicatedUserName = await this.findUserByUserName(dto.userName);
      if (duplicatedUserName && duplicatedUserName.id !== id) {
        throw new ConflictException('Tên đăng nhập đã tồn tại');
      }
    }

    // TODO: Uncomment after running migration
    // if (dto.phoneNumber) {
    //   const duplicatedPhoneNumber = await this.findUserByPhoneNumber(dto.phoneNumber);
    //   if (duplicatedPhoneNumber && duplicatedPhoneNumber.id !== id) {
    //     throw new ConflictException('Số điện thoại đã tồn tại');
    //   }
    // }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: dto,
    });

    // Remove password from response
    const { password, ...userResponse } = updatedUser;
    return userResponse as any;
  }

  async findUserByEmailAndPassword(email: string, password: string) {
    const user = await this.findUserByEmail(email, true);
    const isPasswordMatching = await this.hashService.compare(
      password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new NotFoundException(
        'Không tìm thấy người dùng với email và mật khẩu này.',
      );
    }
    return user;
  }

  async findUserByEmail(email: string, throwError: boolean = false) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user && throwError) {
      throw new NotFoundException('Không tìm thấy người dùng với email này.');
    }
    return user;
  }

  async findUserById(id: number) {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng với id này.');
    }
    return user;
  }

  async findUserByEmailOrUserNameAndPassword(
    emailOrUserName: string,
    password: string,
  ) {
    const user = await this.findUserByEmailOrUserName(emailOrUserName, true);
    const isPasswordMatching = await this.hashService.compare(
      password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new NotFoundException(
        'Không tìm thấy người dùng với email hoặc tên đăng nhập này.',
      );
    }
    return user;
  }

  async findUserByEmailOrUserName(
    emailOrUserName: string,
    throwError: boolean = false,
  ) {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: emailOrUserName }, { userName: emailOrUserName }],
      },
    });
    if (!user && throwError) {
      throw new NotFoundException(
        'Không tìm thấy người dùng với email hoặc tên đăng nhập này.',
      );
    }
    return user;
  }

  async findUserByUserName(userName: string, throwError: boolean = false) {
    const user = await this.prismaService.user.findUnique({
      where: { userName },
    });
    if (!user && throwError) {
      throw new NotFoundException(
        'Không tìm thấy người dùng với tên đăng nhập này.',
      );
    }
    return user;
  }

  // TODO: Uncomment after running migration
  // async findUserByPhoneNumber(
  //   phoneNumber: string,
  //   throwError: boolean = false,
  // ) {
  //   const user = await this.prismaService.user.findUnique({
  //     where: { phoneNumber },
  //   });
  //   if (!user && throwError) {
  //     throw new NotFoundException(
  //       'Không tìm thấy người dùng với số điện thoại này.',
  //     );
  //   }
  //   return user;
  // }

  async findAllUsers(paginationQuery: IPaginationQuery) {
    const { page, limit } = paginationQuery;
    const skip = page * limit;

    const [users, total] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          userName: true,
          email: true,
          // phoneNumber: true, // TODO: Uncomment after migration
          isVerifiedAccount: true,
          verifiedDate: true,
          role: true,
          lastLoginDate: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.user.count(),
    ]);

    return {
      users: users.map((user) => ({ ...user, phoneNumber: null })), // TODO: Remove after migration
      total,
      page,
      limit,
    };
  }

  async deleteUserById(id: number) {
    const user = await this.findUserById(id);
    const deletedUser = await this.prismaService.user.delete({
      where: { id },
    });

    // Remove password from response and add phoneNumber as null temporarily
    const { password, ...userResponse } = deletedUser;
    return { ...userResponse, phoneNumber: null } as any; // TODO: Fix after migration
  }
}
