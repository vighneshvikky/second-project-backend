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

  // New fields for trainer profile
  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  specialization: string;

  @Prop({ required: true })
  experience: number;

  @Prop({ required: false, maxlength: 1000 })
  bio?: string;

  @Prop({ required: false })
  certificationUrl?: string;

  @Prop({ required: true })
  idProofUrl: string;
}

export const TrainerSchema = SchemaFactory.createForClass(Trainer);
