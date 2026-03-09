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
import { BankAccountService } from './bank-account.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@UseGuards(JwtAuthGuard)
@Controller('bank-account')
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) { }

  @Post()
  create(@Body() createDto: CreateBankAccountDto) {
    return this.bankAccountService.create(createDto);
  }

  @Get()
  findAll(@Query('bankId') bankId?: string, @Query('type') type?: string) {
    return this.bankAccountService.findAll(bankId, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankAccountService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateBankAccountDto) {
    return this.bankAccountService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankAccountService.remove(id);
  }
}
