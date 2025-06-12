import {  Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { BaseRepository } from 'src/common/repositories/base.repository';


@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) model: Model<User>) {
    super(model);
  }

  
}
