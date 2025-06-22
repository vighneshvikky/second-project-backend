import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Trainer extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: true, enum: ['user', 'trainer', 'admin'] })
  role: 'user' | 'trainer' | 'admin';

  @Prop({ default: 'local', enum: ['local', 'google'] })
  provider: 'local' | 'google';

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({
    enum: ['pending', 'approved', 'rejected', 'requested'],
    default: 'pending',
  })
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'requested';

  @Prop()
  phoneNumber: string;

  @Prop()
  verifiedAt?: Date;

  @Prop({ enum: ['Cardio', 'Strength', 'Yoga', 'Nutrition'] })
  category?: string;

  @Prop({ type: [String] })
  specialization?: string[];

  @Prop()
  experience: number;

  @Prop({ required: false, maxlength: 1000 })
  bio?: string;

  @Prop({ required: false })
  certificationUrl?: string;

  @Prop()
  idProofUrl: string;

  @Prop()
  rejectionReason?: string;

  @Prop()
  googleId?: string;

  @Prop()
  rejectedAt?: Date;

  @Prop()
  image: string;
    @Prop({
    type: {
      oneToOneSession: { type: Number, required: true, default: 0 },
      workoutPlan: { type: Number, required: true, default: 0 },
    },
    required: true,
    default: {
      oneToOneSession: 0,
      workoutPlan: 0,
    },
  })
  pricing: {
    oneToOneSession: number;
    workoutPlan: number;
  };

    @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TrainerSchema = SchemaFactory.createForClass(Trainer);
