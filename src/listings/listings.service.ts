import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Listing, ListingDocument } from './listings.schema';
import { BooksService } from '../books/books.service';
import { UserRole } from '../common/enums';

@Injectable()
export class ListingsService {
  constructor(
    @InjectModel(Listing.name) private listingModel: Model<ListingDocument>,
    private readonly booksService: BooksService,
  ) {}

  async create(dto: { bookId: string; sellerId: string; price: number; stock: number; active?: boolean }): Promise<ListingDocument> {
    // Verify book exists and is approved
    const book = await this.booksService.findOneOrFail(dto.bookId);
    if (book.status !== 'Approved') {
      throw new ForbiddenException('Only approved books can be listed for sale.');
    }

    // Prevent duplicate listings for the same book by the same seller
    const existing = await this.listingModel.findOne({
      bookId: dto.bookId,
      sellerId: dto.sellerId,
    }).exec();
    if (existing) {
      throw new ConflictException('You already have a listing for this book. Update it instead.');
    }

    return this.listingModel.create({
      bookId: dto.bookId,
      sellerId: dto.sellerId,
      price: dto.price,
      stock: dto.stock,
      active: dto.active ?? true,
    });
  }

  async findAll(query?: { bookId?: string; sellerId?: string; active?: boolean }): Promise<ListingDocument[]> {
    const filter: any = {};
    if (query?.bookId) filter.bookId = query.bookId;
    if (query?.sellerId) filter.sellerId = query.sellerId;
    if (query?.active !== undefined) filter.active = query.active;
    return this.listingModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<ListingDocument> {
    const listing = await this.listingModel.findById(id).exec();
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async findBySellerId(sellerId: string): Promise<ListingDocument[]> {
    return this.listingModel.find({ sellerId }).sort({ createdAt: -1 }).exec();
  }

  async findByBookId(bookId: string): Promise<ListingDocument[]> {
    return this.listingModel.find({ bookId, active: true }).sort({ price: 1 }).exec();
  }

  async update(
    id: string,
    dto: { price?: number; stock?: number; active?: boolean },
    requester: { userId: string; role: UserRole },
  ): Promise<ListingDocument> {
    const listing = await this.findById(id);

    // Only owner or admin can update
    if (requester.role !== UserRole.ADMIN && listing.sellerId.toString() !== requester.userId) {
      throw new ForbiddenException('You can only update your own listings.');
    }

    // Sellers cannot reactivate an admin-deactivated listing (optional rule)
    const update: any = {};
    if (dto.price !== undefined) update.price = dto.price;
    if (dto.stock !== undefined) update.stock = dto.stock;
    if (dto.active !== undefined) update.active = dto.active;

    return this.listingModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async delete(id: string, requester: { userId: string; role: UserRole }): Promise<void> {
    const listing = await this.findById(id);

    if (requester.role !== UserRole.ADMIN && listing.sellerId.toString() !== requester.userId) {
      throw new ForbiddenException('You can only delete your own listings.');
    }

    await this.listingModel.findByIdAndDelete(id).exec();
  }
}
