import { UserRole } from '@prisma/client';

export class GetMeResponseDTO {
  id: number;
  fullName: string;
  email: string;
  isVerifiedAccount: boolean;
  verifiedDate: Date | null;
  role: UserRole;
  lastLoginDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.fullName = user.fullName;
    this.email = user.email;
    this.isVerifiedAccount = user.isVerifiedAccount;
    this.verifiedDate = user.verifiedDate;
    this.role = user.role;
    this.lastLoginDate = user.lastLoginDate;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
