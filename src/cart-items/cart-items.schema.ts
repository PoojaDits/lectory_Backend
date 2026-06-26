import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type CartItemDocument = HydratedDocument<CartItem>;

@Schema({ timestamps: true })
export class CartItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Cart', required: true, index: true })
  cartId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Listing', required: true, index: true })
  listingId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Book', required: true })
  bookId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  sellerId: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  // Display snapshots so the cart renders without extra joins
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop()
  coverImage?: string;

  @Prop({ required: true })
  sellerName: string;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

CartItemSchema.index({ cartId: 1, listingId: 1 }, { unique: true });

CartItemSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    (ret as any).id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
