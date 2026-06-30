import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartItem, CartItemDocument } from './cart-items.schema';
import { Listing, ListingDocument } from '../listings/listings.schema';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItemDocument>,
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
  ) {}

  private async getActiveListingOrFail(listingId?: string) {
    if (!listingId) throw new BadRequestException('Listing is required');
    const listing = await this.listingModel.findById(listingId).exec();
    if (!listing) throw new NotFoundException('Listing not found');
    if (!listing.active) throw new BadRequestException('This listing is not available');
    if (listing.stock <= 0) throw new BadRequestException('This listing is out of stock');
    return listing;
  }

  async create(data: Partial<CartItem>): Promise<CartItemDocument> {
    const listing = await this.getActiveListingOrFail(data.listingId);
    const requestedQty = Math.max(1, Math.round(data.quantity || 1));

    // If same listing already in cart, merge by adding quantity.
    const existing = await this.cartItemModel.findOne({
      cartId: data.cartId,
      listingId: data.listingId,
    }).exec();

    if (existing) {
      if (existing.quantity >= listing.stock) {
        throw new BadRequestException(`Only ${listing.stock} item(s) available in stock`);
      }

      const newQty = Math.min(existing.quantity + requestedQty, listing.stock);
      return this.cartItemModel.findByIdAndUpdate(
        existing.id,
        { quantity: newQty },
        { returnDocument: 'after' },
      ).exec() as Promise<CartItemDocument>;
    }

    const quantity = Math.min(requestedQty, listing.stock);
    return this.cartItemModel.create({ ...data, quantity });
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
    const current = await this.findById(id);
    const listing = await this.getActiveListingOrFail(current.listingId.toString());
    const safe = Math.min(Math.max(1, Math.round(quantity)), listing.stock);

    const item = await this.cartItemModel.findByIdAndUpdate(
      id,
      { quantity: safe },
      { returnDocument: 'after' },
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
