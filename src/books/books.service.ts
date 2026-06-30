import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookDocument } from './books.schema';
import { User, UserDocument } from '../users/users.schema';
import { BookStatus } from '../common/enums';
import { CreateBookDto, QueryBooksDto, UpdateBookStatusDto } from './dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectModel('Book') private bookModel: Model<BookDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailService: MailService,
  ) {}

  async findByIsbn(isbn: string): Promise<BookDocument | null> {
    return this.bookModel.findOne({ isbn: isbn.trim() }).exec();
  }

  async createBySeller(dto: CreateBookDto, sellerId: string): Promise<BookDocument> {
    try {
      const existing = await this.findByIsbn(dto.isbn);
      if (existing) {
        throw new ConflictException('A book with this ISBN already exists.');
      }

      const created = await this.bookModel.create({
        ...dto,
        status: BookStatus.PENDING,
        createdBySellerId: sellerId,
      });
      return created;
    } catch (error) {
      this.logger.error(`Failed to create book by seller: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async createByAdmin(dto: CreateBookDto): Promise<BookDocument> {
    try {
      const existing = await this.findByIsbn(dto.isbn);
      if (existing) {
        throw new ConflictException('A book with this ISBN already exists.');
      }

      const created = await this.bookModel.create({
        ...dto,
        status: BookStatus.APPROVED,
        reviewedAt: new Date(),
      });
      return created;
    } catch (error) {
      this.logger.error(`Failed to create book by admin: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async findAllAsArray(query: QueryBooksDto = {}, forceApproved = false): Promise<BookDocument[]> {
    const filter: any = {};

    if (forceApproved) {
      filter.status = BookStatus.APPROVED;
    } else if (query.status) {
      filter.status = query.status;
    }

    if (query.category) {
      filter.categories = query.category;
    }

    if (query.search?.trim()) {
      const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: regex },
        { author: regex },
        { isbn: regex },
        { publisher: regex },
      ];
    }

    // Return array directly for perfect JSON-server frontend compatibility
    return this.bookModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findPaginated(query: QueryBooksDto = {}) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.status) filter.status = query.status;
    if (query.category) filter.categories = query.category;

    if (query.search?.trim()) {
      const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: regex },
        { author: regex },
        { isbn: regex },
        { publisher: regex },
      ];
    }

    const [items, total] = await Promise.all([
      this.bookModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.bookModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOneOrFail(id: string): Promise<BookDocument> {
    try {
      const book = await this.bookModel.findById(id).exec();
      if (!book) {
        throw new NotFoundException('Book not found');
      }
      return book;
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(id: string, status: BookStatus): Promise<BookDocument> {
    try {
      const book = await this.bookModel.findByIdAndUpdate(
        id,
        {
          status,
          reviewedAt: new Date(),
        },
        { new: true },
      ).exec();

      if (!book) {
        throw new NotFoundException('Book not found');
      }

      await this.notifySellerAboutBookReview(book, status);

      return book;
    } catch (error) {
      this.logger.error(`Failed to update book status: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }


  private async notifySellerAboutBookReview(
    book: BookDocument,
    status: BookStatus,
  ): Promise<void> {
    if (!book.createdBySellerId) return;
    if (status !== BookStatus.APPROVED && status !== BookStatus.REJECTED) return;

    const seller = await this.userModel.findById(book.createdBySellerId).exec();
    if (!seller?.email) return;

    const sellerName = seller.contactPerson || seller.businessName || 'Seller';

    if (status === BookStatus.APPROVED) {
      await this.mailService.sendBookApprovedEmail(
        seller.email,
        sellerName,
        book.title,
      );
      return;
    }

    await this.mailService.sendBookRejectedEmail(
      seller.email,
      sellerName,
      book.title,
    );
  }

  async deleteBook(id: string): Promise<void> {
    try {
      const book = await this.bookModel.findByIdAndDelete(id).exec();
      if (!book) {
        throw new NotFoundException('Book not found');
      }
    } catch (error) {
      this.logger.error(`Failed to delete book: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
