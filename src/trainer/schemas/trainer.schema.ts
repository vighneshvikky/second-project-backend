import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseModel } from 'src/common/model/base-model';

@Schema()
export class Trainer extends BaseModel {
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
  rejectedAt?: Date;

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
}

export const TrainerSchema = SchemaFactory.createForClass(Trainer);
