import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/users.schema';
import { AdminsService } from './admin.service';
import { AdminsController } from './admin.controller';
import { Book, BookSchema } from '../books/books.schema';
import { Listing, ListingSchema } from '../listings/listings.schema';
import { Order, OrderSchema } from '../orders/orders.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Book.name, schema: BookSchema },
      { name: Listing.name, schema: ListingSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminModule {}
