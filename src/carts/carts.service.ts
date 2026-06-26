import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './carts.schema';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  async create(customerId: string): Promise<CartDocument> {
    const existing = await this.cartModel.findOne({ customerId }).exec();
    if (existing) return existing;
    return this.cartModel.create({ customerId });
  }

  async findAll(): Promise<CartDocument[]> {
    return this.cartModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<CartDocument> {
    const cart = await this.cartModel.findById(id).exec();
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  async findByCustomerId(customerId: string): Promise<CartDocument | null> {
    return this.cartModel.findOne({ customerId }).exec();
  }

  async delete(id: string): Promise<void> {
    const cart = await this.cartModel.findByIdAndDelete(id).exec();
    if (!cart) throw new NotFoundException('Cart not found');
  }

  async deleteByCustomerId(customerId: string): Promise<void> {
    await this.cartModel.deleteOne({ customerId }).exec();
  }
}
