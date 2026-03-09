import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get()
    findAll() {
        return this.categoryService.findAll();
    }

    @Get(':mainCategory/subcategories')
    findSubCategories(@Param('mainCategory') mainCategory: string) {
        return this.categoryService.findSubCategories(mainCategory);
    }

    @Post(':mainCategory/subcategory')
    addSubCategory(
        @Param('mainCategory') mainCategory: string,
        @Body('subCategory') subCategory: string,
    ) {
        return this.categoryService.addSubCategory(mainCategory, subCategory);
    }

    @Post('main-category')
    addMainCategory(@Body('mainCategory') mainCategory: string) {
        return this.categoryService.addMainCategory(mainCategory);
    }

    @Delete(':mainCategory/subcategory/:subCategory')
    removeSubCategory(
        @Param('mainCategory') mainCategory: string,
        @Param('subCategory') subCategory: string,
    ) {
        return this.categoryService.removeSubCategory(mainCategory, subCategory);
    }

    @Delete(':mainCategory')
    removeMainCategory(@Param('mainCategory') mainCategory: string) {
        return this.categoryService.removeMainCategory(mainCategory);
    }
}
