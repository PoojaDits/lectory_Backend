import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import { UserRole } from '../common/enums';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private adminFilter() {
    return { role: UserRole.ADMIN };
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create({
      ...data,
      role: UserRole.ADMIN,
      isActive: true,
      isEmailVerified: true,
    });
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel
      .find(this.adminFilter())
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const admin = await this.userModel
      .findOne({ _id: id, ...this.adminFilter() })
      .exec();
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async findByUserId(userId: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ _id: userId, ...this.adminFilter() })
      .exec();
  }

  async update(id: string, data: Partial<User>): Promise<UserDocument> {
    const admin = await this.userModel
      .findOneAndUpdate(
        { _id: id, ...this.adminFilter() },
        data,
        { new: true },
      )
      .exec();
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }
}
