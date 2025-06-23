import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseModel } from 'src/common/model/base-model';

@Schema()
export class User extends BaseModel {
  
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
}

export const UserSchema = SchemaFactory.createForClass(User);
