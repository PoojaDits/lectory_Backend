import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartItem, CartItemSchema } from './cart-items.schema';
import { CartItemsService } from './cart-items.service';
import { CartItemsController } from './cart-items.controller';
import { Listing, ListingSchema } from '../listings/listings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CartItem.name, schema: CartItemSchema },
      { name: Listing.name, schema: ListingSchema },
    ]),
  ],
  controllers: [CartItemsController],
  providers: [CartItemsService],
  exports: [CartItemsService],
})
export class CartItemsModule {}
