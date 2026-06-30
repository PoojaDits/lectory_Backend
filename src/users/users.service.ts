import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './users.schema';
import { UserRole } from '../common/enums';
import { USER_MESSAGES } from '../common/constants/messages.constant';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  findByEmail(email: string, withSecrets = false) {
    const q = this.userModel.findOne({ email: email.toLowerCase() });
    return withSecrets
      ? q.select('+password +otpCode +refreshTokenHash').exec()
      : q.exec();
  }

  findById(id: string, withSecrets = false) {
    const q = this.userModel.findById(id);
    return withSecrets
      ? q.select('+password +otpCode +refreshTokenHash').exec()
      : q.exec();
  }

  async getByIdOrFail(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    return user;
  }

  async createUser(data: Partial<User>, plainPassword: string) {
    const exists = await this.findByEmail(data.email!);
    if (exists) throw new ConflictException(USER_MESSAGES.EMAIL_EXISTS);

    const password = await bcrypt.hash(plainPassword, 12);
    return this.userModel.create({ ...data, password });
  }

  async upsertAdmin(data: Partial<User>, plainPassword: string) {
    const email = data.email!.toLowerCase();
    const password = await bcrypt.hash(plainPassword, 12);

    return this.userModel.findOneAndUpdate(
      { email },
      {
        $set: {
          ...data,
          email,
          role: UserRole.ADMIN,
          password,
          isActive: true,
          isEmailVerified: true,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).exec();
  }

  async findAll() {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async setOtp(userId: string, otpHash: string, expiresAt: Date) {
    return this.userModel.findByIdAndUpdate(userId, {
      otpCode: otpHash,
      otpExpiresAt: expiresAt,
    }).exec();
  }

  async markEmailVerified(userId: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { isEmailVerified: true, otpCode: null, otpExpiresAt: null },
      { new: true },
    ).exec();
  }



  async updatePassword(userId: string, plainPassword: string) {
    const password = await bcrypt.hash(plainPassword, 12);
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { password },
      { new: true },
    ).exec();
    if (!user) throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    return user;
  }

  async clearOtp(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      otpCode: null,
      otpExpiresAt: null,
    }).exec();
  }

  async setRefreshToken(userId: string, refreshTokenHash: string | null) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { refreshTokenHash },
    ).exec();
  }

  async updateActiveStatus(id: string, isActive: boolean) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    ).exec();
    if (!user) throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    return user;
  }

  async updateProfile(userId: string, dto: any) {
    const user = await this.getByIdOrFail(userId);
    const update: any = {};

    if (dto.password) {
      update.password = await bcrypt.hash(dto.password, 12);
    }

    if (user.role === UserRole.CUSTOMER) {
      if (dto.firstName !== undefined) update.firstName = dto.firstName;
      if (dto.lastName !== undefined) update.lastName = dto.lastName;
    }

    if (user.role === UserRole.SELLER) {
      if (dto.businessName !== undefined) update.businessName = dto.businessName;
      if (dto.contactPerson !== undefined) update.contactPerson = dto.contactPerson;
      if (dto.mobileNumber !== undefined) update.mobileNumber = dto.mobileNumber;
    }

    return this.userModel.findByIdAndUpdate(userId, update, { new: true }).exec();
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    return user;
  }
}
