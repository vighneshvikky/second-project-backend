import { Model, Document } from 'mongoose';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseRepository<T extends Document> {
  protected constructor(protected readonly model: Model<T>) {}
  async create(data: Partial<T>): Promise<T> {
    const created = new this.model(data);
    return created.save();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findOne(filter: Record<string, any>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findByEmail(email: string): Promise<T | null> {
    return this.model.findOne({ email }).exec();
  }

  async deleteById(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async search(query: Record<string, any>): Promise<T[]> {
    return this.model.find(query).exec();
  }

  async findPaginated(query: Record<string, any>, options: PaginationOptions): Promise<PaginatedResult<T>> {
    const skip = (options.page - 1) * options.limit;
    
    const [data, total] = await Promise.all([
      this.model.find(query)
        .skip(skip)
        .limit(options.limit)
        .exec(),
      this.model.countDocuments(query).exec()
    ]);

    return {
      data,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit)
    };
  }

  async updateById(id: string, update: Partial<T>): Promise<T> {
    const updated = await this.model.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).exec();
    
    if (!updated) {
      throw new Error('Document not found');
    }
    
    return updated;
  }




}
