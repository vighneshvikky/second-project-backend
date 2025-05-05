
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAccountDto } from 'src/auth/dto/createAccount.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UserRepository {
    constructor(@InjectModel('User') private userModel: Model<User>){}
  async create(data: CreateAccountDto): Promise<User> {
   const user = new this.userModel({
    ...data,
    role: 'user'
   });

   return user.save();
  }

  async findByEmail(email: string){
    return this.userModel.findOne({email, role: 'user'})
  }
}
