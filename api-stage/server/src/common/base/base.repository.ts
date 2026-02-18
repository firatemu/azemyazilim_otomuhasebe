import { PrismaService } from '../prisma.service';
import { Delegate } from './delegate.interface';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export abstract class BaseRepository<
    D extends Delegate,
    T = any,
    CreateInput = any,
    UpdateInput = any
> {
    constructor(
        protected readonly prisma: PrismaService,
        protected readonly modelName: string, // e.g., 'user', 'product' (camelCase property on prismaClient)
    ) { }

    protected get delegate(): D {
        return (this.prisma.extended as any)[this.modelName];
    }

    async create(data: CreateInput): Promise<T> {
        return this.delegate.create({ data } as any);
    }

    async findAll(params?: any): Promise<T[]> {
        return this.delegate.findMany(params);
    }

    async findOne(id: string): Promise<T | null> {
        return this.delegate.findFirst({ where: { id } } as any);
    }

    async findOneOrThrow(id: string): Promise<T> {
        const record = await this.findOne(id);
        if (!record) {
            throw new NotFoundException(`${this.modelName} with ID ${id} not found`);
        }
        return record;
    }

    async update(id: string, data: UpdateInput): Promise<T> {
        try {
            return await this.delegate.update({
                where: { id },
                data,
            } as any);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async delete(id: string): Promise<T> {
        try {
            return await this.delegate.delete({ where: { id } } as any);
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async softDelete(id: string): Promise<T> {
        // Requires model to have deletedAt. 
        // If usage of BaseRepository implies strict soft-delete models, we can assume it exists.
        // Or we use update.
        return this.update(id, { deletedAt: new Date() } as any);
    }

    async count(params?: any): Promise<number> {
        return this.delegate.count(params);
    }

    protected handleError(error: any) {
        if (error.code === 'P2025') {
            throw new NotFoundException('Record not found');
        }
        // Add more Prisma error codes as needed
    }
}
