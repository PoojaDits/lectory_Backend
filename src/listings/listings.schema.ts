import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ListingDocument = HydratedDocument<Listing>;

@Schema({ timestamps: true })
export class Listing {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Book', required: true, index: true })
  bookId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  sellerId: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0, default: 0 })
  stock: number;

  @Prop({ default: true })
  active: boolean;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);

ListingSchema.index({ bookId: 1, sellerId: 1 }, { unique: true });

ListingSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    (ret as any).id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
