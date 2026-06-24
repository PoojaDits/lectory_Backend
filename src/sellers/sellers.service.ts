import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import { UserRole, SellerStatus } from '../common/enums';
import { UsersService } from '../users/users.service';

@Injectable()
export class SellersService {
  private readonly logger = new Logger(SellersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(createSellerDto: any) {
    try {
      const { password, ...rest } = createSellerDto;
      if (!password) throw new Error('Password is required');

      return await this.usersService.createUser(
        { ...rest, role: UserRole.SELLER, sellerStatus: SellerStatus.PENDING },
        password,
      );
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Create seller failed: ${err.message}`, err.stack);
      throw error;
    }
  }

  async findAll() {
    try {
      return this.userModel.find({ role: UserRole.SELLER }).exec();
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Find all sellers failed: ${err.message}`, err.stack);
      throw error;
    }
  }

  async updateStatus(id: string, status: string) {
    try {
      const seller = await this.userModel.findOneAndUpdate(
        { _id: id, role: UserRole.SELLER },
        { sellerStatus: status },
        { new: true },
      );
      if (!seller) throw new NotFoundException('Seller not found');
      return seller;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Update seller status failed: ${err.message}`, err.stack);
      throw error;
    }
  }
}