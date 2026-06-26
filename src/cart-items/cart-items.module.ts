import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartItem, CartItemSchema } from './cart-items.schema';
import { CartItemsService } from './cart-items.service';
import { CartItemsController } from './cart-items.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CartItem.name, schema: CartItemSchema }]),
  ],
  controllers: [CartItemsController],
  providers: [CartItemsService],
  exports: [CartItemsService],
})
export class CartItemsModule {}
