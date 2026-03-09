import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('brand')
export class BrandController {
    constructor(private readonly brandService: BrandService) { }

    @Get()
    findAll() {
        return this.brandService.findAll();
    }

    @Post()
    create(@Body('brandName') brandName: string) {
        return this.brandService.create(brandName);
    }

    @Get(':brandName')
    findOne(@Param('brandName') brandName: string) {
        return this.brandService.findOne(brandName);
    }

    @Put(':brandName')
    update(
        @Param('brandName') brandName: string,
        @Body('newBrandName') newBrandName: string,
    ) {
        return this.brandService.update(brandName, newBrandName);
    }

    @Delete(':brandName')
    remove(@Param('brandName') brandName: string) {
        return this.brandService.remove(brandName);
    }
}
