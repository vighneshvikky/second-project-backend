import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: true, enum: ['user', 'trainer'] })
  role: 'user' | 'trainer';

  @Prop({ default: 'local', enum: ['local', 'google'] })
  provider: 'local' | 'google';

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  googleId?: string;

  @Prop()
  image: string;

  @Prop()
  dob: string;

  @Prop()
  height: number;

  @Prop()
  heightUnit: string;

  @Prop()
  weight: number;

  @Prop()
  weightUnit: string;

  @Prop()
  fitnessLevel: string;

  @Prop({ type: [String], default: [] })
  fitnessGoals: string[];

  @Prop({ type: [String], default: [] })
  trainingTypes: string[];

  @Prop({ default: 'flexible' })
  preferredTime: string;

  @Prop({ type: [String], default: [] })
  equipments: string[];

    @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
