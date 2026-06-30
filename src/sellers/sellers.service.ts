import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import { UserRole, SellerStatus } from '../common/enums';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SellersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailService: MailService,
  ) {}

  private sellerFilter() {
    return { role: UserRole.SELLER };
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create({
      ...data,
      role: UserRole.SELLER,
      sellerStatus: SellerStatus.PENDING,
    });
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel
      .find(this.sellerFilter())
      .sort({ createdAt: -1 })
      .exec();
  }

  async findApprovedPublic(): Promise<UserDocument[]> {
    return this.userModel
      .find({ ...this.sellerFilter(), sellerStatus: SellerStatus.APPROVED, isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const seller = await this.userModel
      .findOne({ _id: id, ...this.sellerFilter() })
      .exec();
    if (!seller) throw new NotFoundException('Seller not found');
    return seller;
  }

  async findByUserId(userId: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ _id: userId, ...this.sellerFilter() })
      .exec();
  }

  async findPending(): Promise<UserDocument[]> {
    return this.userModel
      .find({ ...this.sellerFilter(), sellerStatus: SellerStatus.PENDING })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, data: Partial<User>): Promise<UserDocument> {
    const seller = await this.userModel
      .findOneAndUpdate(
        { _id: id, ...this.sellerFilter() },
        data,
        { new: true },
      )
      .exec();
    if (!seller) throw new NotFoundException('Seller not found');
    return seller;
  }

  async approve(id: string): Promise<UserDocument> {
    const seller = await this.userModel
      .findOneAndUpdate(
        { _id: id, ...this.sellerFilter() },
        {
          sellerStatus: SellerStatus.APPROVED,
          approvedAt: new Date(),
          rejectionReason: null,
        },
        { new: true },
      )
      .exec();
    if (!seller) throw new NotFoundException('Seller not found');

    await this.mailService.sendSellerApprovedEmail(
      seller.email,
      seller.contactPerson || seller.businessName || 'Seller',
    );

    return seller;
  }

  async reject(id: string, reason?: string): Promise<UserDocument> {
    const seller = await this.userModel
      .findOneAndUpdate(
        { _id: id, ...this.sellerFilter() },
        {
          sellerStatus: SellerStatus.REJECTED,
          rejectionReason: reason || 'Rejected by admin',
          approvedAt: null,
        },
        { new: true },
      )
      .exec();
    if (!seller) throw new NotFoundException('Seller not found');

    await this.mailService.sendSellerRejectedEmail(
      seller.email,
      seller.contactPerson || seller.businessName || 'Seller',
      reason || 'Rejected by admin',
    );

    return seller;
  }
}
