import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CompanyCreditCardService } from './company-credit-card.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCompanyCreditCardDto } from './dto/create-company-credit-card.dto';
import { UpdateCompanyCreditCardDto } from './dto/update-company-credit-card.dto';

@UseGuards(JwtAuthGuard)
@Controller('company-credit-card')
export class CompanyCreditCardController {
  constructor(
    private readonly companyCreditCardService: CompanyCreditCardService,
  ) { }

  @Post()
  create(@Body() createDto: CreateCompanyCreditCardDto) {
    return this.companyCreditCardService.create(createDto);
  }

  @Get()
  findAll(@Query('cashboxId') cashboxId?: string) {
    return this.companyCreditCardService.findAll(cashboxId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyCreditCardService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCompanyCreditCardDto) {
    return this.companyCreditCardService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyCreditCardService.remove(id);
  }

}
