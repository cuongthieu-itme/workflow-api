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

  async create(dto: CreateUserDTO) {
    // Optimized: Check duplicates in parallel
    const [duplicatedEmailAddress, duplicatedUserName] = await Promise.all([
      this.findByEmail(dto.email),
      this.findByUserName(dto.userName),
    ]);

    if (duplicatedEmailAddress) {
      throw new ConflictException('Email đã tồn tại');
    }

    if (duplicatedUserName) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    const passwordHashed = await this.hashService.encode(dto.password);
    const user = await this.prismaService.user.create({
      data: {
        email: dto.email,
        userName: dto.userName,
        password: passwordHashed,
        fullName: dto.fullName,
        role: dto.role,
      },
      select: {
        id: true,
        email: true,
        userName: true,
        fullName: true,
        role: true,
        isVerifiedAccount: true,
        verifiedDate: true,
        lastLoginDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as any;
  }

  async findById(id: number) {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng với id này.');
    }
    return user;
  }

  async findByIdOptimized(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        userName: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        isVerifiedAccount: true,
        verifiedDate: true,
        lastLoginDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng với id này.');
    }
    return user;
  }

  async findAll(paginationQuery: IPaginationQuery) {
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
          phoneNumber: true,
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
      users: users.map((user) => ({ ...user })),
      total,
      page,
      limit,
    };
  }

  async updateById(id: number, dto: UpdateUserByIdDTO) {
    const validationPromises: Promise<any>[] = [];

    if (dto.password) {
      dto.password = await this.hashService.encode(dto.password);
    }

    if (dto.userName) {
      validationPromises.push(this.findByUserName(dto.userName));
    }

    if (validationPromises.length > 0) {
      const results = await Promise.all(validationPromises);

      if (dto.userName && results[0] && results[0].id !== id) {
        throw new ConflictException('Tên đăng nhập đã tồn tại');
      }
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        userName: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        isVerifiedAccount: true,
        verifiedDate: true,
        lastLoginDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser as any;
  }

  async deleteById(id: number) {
    const deletedUser = await this.prismaService.user
      .delete({
        where: { id },
        select: {
          id: true,
          fullName: true,
          userName: true,
          email: true,
          phoneNumber: true,
          isVerifiedAccount: true,
          verifiedDate: true,
          role: true,
          lastLoginDate: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      .catch((error) => {
        if (error.code === 'P2025') {
          throw new NotFoundException('Không tìm thấy người dùng với id này.');
        }
        throw error;
      });

    return { ...deletedUser } as any;
  }

  async findByEmailOrUserNameAndPassword(
    emailOrUserName: string,
    password: string,
  ) {
    const user = await this.findByEmailOrUserName(emailOrUserName, true);
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

  async loginOptimized(emailOrUserName: string, password: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: emailOrUserName }, { userName: emailOrUserName }],
      },
      select: {
        id: true,
        password: true,
        isVerifiedAccount: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Không tìm thấy người dùng với email hoặc tên đăng nhập này.',
      );
    }

    const isPasswordMatching = await this.hashService.compare(
      password,
      user.password,
    );

    if (!isPasswordMatching) {
      throw new NotFoundException(
        'Không tìm thấy người dùng với email hoặc tên đăng nhập này.',
      );
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmailAndPassword(email: string, password: string) {
    const user = await this.findByEmail(email, true);
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

  async updateVerification(id: number, isVerify: boolean) {
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

  async updateLoginDate(id: number): Promise<void> {
    await this.prismaService.user.update({
      where: { id },
      data: { lastLoginDate: new Date() },
      select: { id: true },
    });
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const hashedPassword = await this.hashService.encode(newPassword);

    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng với email này.');
    }

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
      select: { id: true },
    });
  }

  async findByEmail(email: string, throwError: boolean = false) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user && throwError) {
      throw new NotFoundException('Không tìm thấy người dùng với email này.');
    }
    return user;
  }

  async findByEmailOrUserName(
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

  async findByUserName(userName: string, throwError: boolean = false) {
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

  async verifyEmailExists(email: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng với email này.');
    }
  }

  async createUser(dto: CreateUserDTO) {
    return this.create(dto);
  }

  async findUserById(id: number) {
    return this.findById(id);
  }

  async findUserByIdOptimized(id: number) {
    return this.findByIdOptimized(id);
  }

  async findAllUsers(paginationQuery: IPaginationQuery) {
    return this.findAll(paginationQuery);
  }

  async updateUserById(id: number, dto: UpdateUserByIdDTO) {
    return this.updateById(id, dto);
  }

  async deleteUserById(id: number) {
    return this.deleteById(id);
  }

  async findUserByEmailOrUserNameAndPasswordOptimized(
    emailOrUserName: string,
    password: string,
  ) {
    return this.loginOptimized(emailOrUserName, password);
  }

  async updateVerificationState(id: number, isVerify: boolean) {
    return this.updateVerification(id, isVerify);
  }

  async updateLastLoginDate(id: number): Promise<void> {
    return this.updateLoginDate(id);
  }

  async resetUserPasswordByEmail(
    email: string,
    newPassword: string,
  ): Promise<void> {
    return this.resetPassword(email, newPassword);
  }

  async verifyUserExistsByEmail(email: string): Promise<void> {
    return this.verifyEmailExists(email);
  }

  async findUserByEmail(email: string, throwError: boolean = false) {
    return this.findByEmail(email, throwError);
  }

  async findUserByEmailOrUserName(
    emailOrUserName: string,
    throwError: boolean = false,
  ) {
    return this.findByEmailOrUserName(emailOrUserName, throwError);
  }

  async findUserByUserName(userName: string, throwError: boolean = false) {
    return this.findByUserName(userName, throwError);
  }

  async findUserByEmailAndPassword(email: string, password: string) {
    return this.findByEmailAndPassword(email, password);
  }

  async findUserByEmailOrUserNameAndPassword(
    emailOrUserName: string,
    password: string,
  ) {
    return this.findByEmailOrUserNameAndPassword(emailOrUserName, password);
  }
}
