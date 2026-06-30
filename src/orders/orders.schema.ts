import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { OrderStatus } from '../common/enums';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: true })
export class OrderItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Listing', required: true })
  listingId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Book', required: true })
  bookId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  sellerId: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true })
  titleSnapshot: string;

  @Prop()
  coverImageSnapshot?: string;

  @Prop()
  authorSnapshot?: string;

  @Prop()
  sellerNameSnapshot?: string;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  customerId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  sellerId: string;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.CREATED })
  status: OrderStatus;

  @Prop({ required: true })
  shippingAddress: string;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    (ret as any).id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (Array.isArray(ret.items)) {
      ret.items = ret.items.map((item: any) => ({
        ...item,
        id: item._id?.toString?.() ?? item.id,
        _id: undefined,
      }));
    }
    return ret;
  },
});
