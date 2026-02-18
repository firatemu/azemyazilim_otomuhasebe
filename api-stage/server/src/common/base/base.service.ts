import { BaseRepository } from './base.repository';
import { Delegate } from './delegate.interface';

export abstract class BaseService<
    D extends Delegate,
    T = any,
    CreateInput = any,
    UpdateInput = any
> {
    constructor(
        protected readonly repository: BaseRepository<D, T, CreateInput, UpdateInput>,
    ) { }

    async create(data: CreateInput): Promise<T> {
        return this.repository.create(data);
    }

    async findAll(params?: any): Promise<T[]> {
        return this.repository.findAll(params);
    }

    async findOne(id: string): Promise<T> {
        return this.repository.findOneOrThrow(id);
    }

    async update(id: string, data: UpdateInput): Promise<T> {
        return this.repository.update(id, data);
    }

    async remove(id: string): Promise<T> {
        return this.repository.softDelete(id);
    }

    async count(params?: any): Promise<number> {
        return this.repository.count(params);
    }
}
