import { Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { BaseService } from './base.service';
import { Delegate } from './delegate.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

// We cannot use @Controller here because it's abstract, but child classes will.
// We expect T, CreateDto, UpdateDto to be passed.
export abstract class BaseController<
    D extends Delegate,
    T = any,
    CreateDto = any,
    UpdateDto = any
> {
    constructor(protected readonly service: BaseService<D, T, CreateDto, UpdateDto>) { }

    @Post()
    async create(@Body() createDto: CreateDto): Promise<T> {
        return this.service.create(createDto);
    }

    @Get()
    async findAll(@Query() query?: any): Promise<T[]> {
        return this.service.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<T> {
        return this.service.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateDto,
    ): Promise<T> {
        const data = updateDto as unknown as UpdateDto; // Type assertion if needed
        return this.service.update(id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<T> {
        return this.service.remove(id);
    }
}
