import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@UseGuards(JwtAuthGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get('stats')
  getStats(
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expenseService.getStats(
      categoryId,
      startDate,
      endDate,
    );
  }

  @Get('categoryler')
  findAllCategoryler() {
    return this.expenseService.findAllCategoryler();
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expenseService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      categoryId,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateExpenseDto) {
    return this.expenseService.create(createDto);
  }

  @Post('categoryler')
  createCategory(@Body() body: { name: string; notes?: string }) {
    return this.expenseService.createCategory(body.name, body.notes);
  }

  @Put('categoryler/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() body: { name: string; notes?: string },
  ) {
    return this.expenseService.updateCategory(
      id,
      body.name,
      body.notes,
    );
  }

  @Delete('categoryler/:id')
  removeCategory(@Param('id') id: string) {
    return this.expenseService.removeCategory(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateExpenseDto) {
    return this.expenseService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseService.remove(id);
  }
}
