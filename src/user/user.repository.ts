import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { BaseRepository } from 'src/common/repositories/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) model: Model<User>) {
    super(model);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.model.findOne({ email }).exec();
  }

  async create(data: Partial<User>): Promise<User> {
    return this.model.create(data);
  }

  async updatePassword(userId: string, newPassword: string){
    await this.model.updateOne(
      { _id: userId },
      { $set: { password: newPassword } }
    ).exec();
  }
}
