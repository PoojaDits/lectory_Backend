import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  customerId: string;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    (ret as any).id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
