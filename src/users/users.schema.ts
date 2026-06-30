import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole, SellerStatus } from '../common/enums';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ select: false })
  otpCode?: string;

  @Prop()
  otpExpiresAt?: Date;

  @Prop({ select: false })
  refreshTokenHash?: string;

  // ── Customer fields ──
  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ type: [Object], default: [] })
  addresses?: Record<string, any>[];

  @Prop()
  avatar?: string;


  // ── Seller fields ──
  @Prop()
  businessName?: string;

  @Prop()
  contactPerson?: string;

  @Prop({ trim: true })
  mobileNumber?: string;

  @Prop({ enum: SellerStatus, type: String })
  sellerStatus?: SellerStatus;

  @Prop()
  rejectionReason?: string;

  @Prop()
  approvedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    (ret as any).id = ret._id?.toString?.();
    if (ret.sellerStatus) {
      (ret as any).status =
        ret.sellerStatus === SellerStatus.PENDING
          ? 'Pending Approval'
          : ret.sellerStatus === SellerStatus.APPROVED
            ? 'Approved'
            : 'Rejected';
    }
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.otpCode;
    delete ret.refreshTokenHash;
    return ret;
  },
});
