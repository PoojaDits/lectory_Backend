import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartItem, CartItemDocument } from './cart-items.schema';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItemDocument>,
  ) {}

  async create(data: Partial<CartItem>): Promise<CartItemDocument> {
    // If same listing already in cart, merge by adding quantity
    const existing = await this.cartItemModel.findOne({
      cartId: data.cartId,
      listingId: data.listingId,
    }).exec();

    if (existing) {
      const newQty = existing.quantity + (data.quantity || 1);
      return this.cartItemModel.findByIdAndUpdate(
        existing.id,
        { quantity: newQty },
        { new: true },
      ).exec() as Promise<CartItemDocument>;
    }

    return this.cartItemModel.create(data);
  }

  async findAll(query?: { cartId?: string; listingId?: string }): Promise<CartItemDocument[]> {
    const filter: any = {};
    if (query?.cartId) filter.cartId = query.cartId;
    if (query?.listingId) filter.listingId = query.listingId;
    return this.cartItemModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findByCartId(cartId: string): Promise<CartItemDocument[]> {
    return this.cartItemModel.find({ cartId }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<CartItemDocument> {
    const item = await this.cartItemModel.findById(id).exec();
    if (!item) throw new NotFoundException('Cart item not found');
    return item;
  }

  async update(id: string, quantity: number): Promise<CartItemDocument> {
    const item = await this.cartItemModel.findByIdAndUpdate(
      id,
      { quantity: Math.max(1, Math.round(quantity)) },
      { new: true },
    ).exec();
    if (!item) throw new NotFoundException('Cart item not found');
    return item;
  }

  async delete(id: string): Promise<void> {
    const item = await this.cartItemModel.findByIdAndDelete(id).exec();
    if (!item) throw new NotFoundException('Cart item not found');
  }

  async deleteByCartId(cartId: string): Promise<void> {
    await this.cartItemModel.deleteMany({ cartId }).exec();
  }
}
