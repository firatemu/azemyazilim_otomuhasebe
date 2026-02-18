import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CodeTemplateService } from './code-template.service';
import { CreateCodeTemplateDto } from './dto/create-code-template.dto';
import { UpdateCodeTemplateDto } from './dto/update-code-template.dto';
import { GetNextCodeDto } from './dto/get-next-code.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ModuleType } from '@prisma/client';

@Controller('code-template')
@UseGuards(JwtAuthGuard)
export class CodeTemplateController {
  constructor(private readonly codeTemplateService: CodeTemplateService) {}

  @Post()
  create(@Body() createDto: CreateCodeTemplateDto) {
    return this.codeTemplateService.create(createDto);
  }

  @Get('next-code/:module')
  async getNextCode(@Param('module') module: ModuleType) {
    try {
      console.log('🔍 [CodeTemplate Controller] getNextCode çağrıldı', { module });
      const code = await this.codeTemplateService.getNextCode(module);
      console.log('✅ [CodeTemplate Controller] getNextCode başarılı', { module, code });
      return { nextCode: code };
    } catch (error: any) {
      console.error('❌ [CodeTemplate Controller] getNextCode hatası:', error);
      throw error;
    }
  }

  @Get('by-module/:module')
  findByModule(@Param('module') module: ModuleType) {
    return this.codeTemplateService.findByModule(module);
  }

  @Get()
  findAll() {
    return this.codeTemplateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.codeTemplateService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCodeTemplateDto) {
    return this.codeTemplateService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.codeTemplateService.remove(id);
  }

  @Post('reset-counter/:module')
  resetCounter(
    @Param('module') module: ModuleType,
    @Body('newValue') newValue?: number,
  ) {
    return this.codeTemplateService.resetCounter(module, newValue);
  }
}
