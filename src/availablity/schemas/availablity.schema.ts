import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Availability extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true,
  })
  trainerId: mongoose.Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: String;

  @Prop({
    type: [
      {
        start: { type: String, required: true },
        end: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
      },
    ],
    required: true,
  })
  slots: {
    start: string;
    end: string;
    isDefault?: boolean;
    isActive?: boolean;
  }[];
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);
