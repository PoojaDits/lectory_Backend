import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import { UserRole } from '../common/enums';
import { UsersService } from '../users/users.service';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(createCustomerDto: any) {
    try {
      // Use existing UsersService which handles password hashing
      const { password, ...rest } = createCustomerDto;
      if (!password) throw new Error('Password is required');

      return await this.usersService.createUser(
        { ...rest, role: UserRole.CUSTOMER },
        password,
      );
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Create customer failed: ${err.message}`, err.stack);
      throw error;
    }
  }

  async findAll() {
    try {
      return this.userModel.find({ role: UserRole.CUSTOMER }).exec();
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Find all customers failed: ${err.message}`, err.stack);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const customer = await this.userModel.findOne({
        _id: id,
        role: UserRole.CUSTOMER,
      });
      if (!customer) throw new NotFoundException('Customer not found');
      return customer;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Find customer failed: ${err.message}`, err.stack);
      throw error;
    }
  }

  async update(id: string, updateCustomerDto: any) {
    try {
      const customer = await this.userModel.findOneAndUpdate(
        { _id: id, role: UserRole.CUSTOMER },
        updateCustomerDto,
        { new: true },
      );
      if (!customer) throw new NotFoundException('Customer not found');
      return customer;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Update customer failed: ${err.message}`, err.stack);
      throw error;
    }
  }
}