import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export abstract class BaseModel extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password?: string;

  @Prop({ required: true, enum: ['user', 'trainer', 'admin'] })
  role: 'user' | 'trainer' | 'admin';

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
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
