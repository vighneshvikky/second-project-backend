
import { IBaseRepository } from 'src/common/interface/base-repository.interface';
import { User } from '../schemas/user.schema';

export const IUserRepository = Symbol('IUserRepository')

export interface IUserRepository extends IBaseRepository<User> {
  
}
