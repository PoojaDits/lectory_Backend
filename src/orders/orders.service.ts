import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './orders.schema';
import { OrderStatus } from '../common/enums';
import { Listing, ListingDocument } from '../listings/listings.schema';
import { UserRole } from '../common/enums';

interface CreateOrderInput {
  customerId: string;
  sellerId: string;
  shippingAddress: string;
  total: number;
  items: Array<{
    listingId: string;
    bookId: string;
    sellerId: string;
    quantity: number;
    price: number;
    titleSnapshot: string;
    coverImageSnapshot?: string;
    authorSnapshot?: string;
    sellerNameSnapshot?: string;
  }>;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
  ) {}

  async create(input: CreateOrderInput, authUser: { userId: string; role: UserRole }): Promise<OrderDocument> {
    if (authUser.role !== UserRole.CUSTOMER && authUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only customers can place orders.');
    }

    const customerId = authUser.role === UserRole.CUSTOMER ? authUser.userId : input.customerId;
    if (!input.items?.length) throw new BadRequestException('Order must contain at least one item.');

    for (const item of input.items) {
      const listing = await this.listingModel.findById(item.listingId).exec();
      if (!listing) throw new NotFoundException(`Listing not found: ${item.listingId}`);
      if (!listing.active) throw new BadRequestException(`Listing is not active: ${item.listingId}`);
      if (listing.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${item.titleSnapshot}`);
      }
      if (listing.sellerId.toString() !== String(item.sellerId)) {
        throw new BadRequestException('Order item seller does not match listing seller.');
      }
    }

    const order = await this.orderModel.create({
      customerId,
      sellerId: input.sellerId,
      status: OrderStatus.CREATED,
      shippingAddress: input.shippingAddress,
      total: input.total,
      items: input.items,
    });

    for (const item of input.items) {
      await this.listingModel.findByIdAndUpdate(item.listingId, {
        $inc: { stock: -item.quantity },
      }).exec();
    }

    return order;
  }

  findAll(): Promise<OrderDocument[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  findByCustomer(customerId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ customerId }).sort({ createdAt: -1 }).exec();
  }

  findBySeller(sellerId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ sellerId }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    authUser: { userId: string; role: UserRole },
  ): Promise<OrderDocument> {
    const order = await this.findById(id);
    if (authUser.role === UserRole.SELLER && order.sellerId.toString() !== authUser.userId) {
      throw new ForbiddenException('You can only update your own orders.');
    }
    if (![UserRole.ADMIN, UserRole.SELLER].includes(authUser.role)) {
      throw new ForbiddenException('Only admin or seller can update order status.');
    }

    const updated = await this.orderModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!updated) throw new NotFoundException('Order not found');
    return updated;
  }
}
