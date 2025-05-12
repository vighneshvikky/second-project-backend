import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Trainer extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['user', 'trainer'] })
  role: 'user' | 'trainer';

  @Prop({ default: false })
  isBlocked: boolean;
}

export const TrainerSchema = SchemaFactory.createForClass(Trainer);
