import { CreateUserDTO } from 'src/user/dtos';
import { PickType } from '@nestjs/swagger';

export class RegisterDTO extends PickType(CreateUserDTO, [
  'email',
  'userName',
  'fullName',
  'password',
  'role',
]) {}
