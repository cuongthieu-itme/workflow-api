import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDTO, UpdateUserByIdDTO } from './dtos';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { HashService } from 'src/common/hash/hash.service';

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

    const passwordHashed = await this.hashService.encode(dto.password);
    return this.prismaService.user.create({
      data: {
        email: dto.email,
        userName: dto.userName,
        password: passwordHashed,
        fullName: dto.fullName,
        role: dto.role,
      },
    });
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

    return this.prismaService.user.update({ where: { id }, data: dto });
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
}
