import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import { UserRole, SellerStatus, BookStatus } from '../common/enums';
import { Book, BookDocument } from '../books/books.schema';
import { Listing, ListingDocument } from '../listings/listings.schema';
import { Order, OrderDocument } from '../orders/orders.schema';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  private adminFilter() {
    return { role: UserRole.ADMIN };
  }

  async dashboardSummary() {
    const [
      totalSellers,
      totalCustomers,
      totalBooks,
      totalListings,
      activeListings,
      totalOrders,
      pendingSellers,
      pendingBooks,
      approvedSellers,
      approvedBooks,
      rejectedSellers,
      rejectedBooks,
    ] = await Promise.all([
      this.userModel.countDocuments({ role: UserRole.SELLER }),
      this.userModel.countDocuments({ role: UserRole.CUSTOMER }),
      this.bookModel.countDocuments(),
      this.listingModel.countDocuments(),
      this.listingModel.countDocuments({ active: true }),
      this.orderModel.countDocuments(),
      this.userModel.countDocuments({ role: UserRole.SELLER, sellerStatus: SellerStatus.PENDING }),
      this.bookModel.countDocuments({ status: BookStatus.PENDING }),
      this.userModel.countDocuments({ role: UserRole.SELLER, sellerStatus: SellerStatus.APPROVED }),
      this.bookModel.countDocuments({ status: BookStatus.APPROVED }),
      this.userModel.countDocuments({ role: UserRole.SELLER, sellerStatus: SellerStatus.REJECTED }),
      this.bookModel.countDocuments({ status: BookStatus.REJECTED }),
    ]);

    const revenueAgg = await this.orderModel.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]);

    return {
      totalSellers,
      totalCustomers,
      totalBooks,
      totalListings,
      activeListings,
      totalOrders,
      pendingSellers,
      pendingBooks,
      approvedSellers,
      approvedBooks,
      rejectedSellers,
      rejectedBooks,
      totalRevenue: revenueAgg[0]?.totalRevenue ?? 0,
    };
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
        { returnDocument: 'after' },
      )
      .exec();
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }
}
