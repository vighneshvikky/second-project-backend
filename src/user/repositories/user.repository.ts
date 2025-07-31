import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { IUserRepository } from '../interfaces/user-repository.interface';

@Injectable()
export class UserRepository
  extends BaseRepository<User>
  implements IUserRepository
{
  constructor(@InjectModel(User.name) model: Model<User>) {
    super(model);
  }

  async findById(id: string): Promise<User | null> {
    return this.model.findById(id).exec();
  }
}
