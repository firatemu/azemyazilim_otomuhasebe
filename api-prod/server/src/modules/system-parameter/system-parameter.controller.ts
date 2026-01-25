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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SystemParameterService } from './system-parameter.service';
import { CreateParameterDto } from './dto/create-parameter.dto';
import { UpdateParameterDto } from './dto/update-parameter.dto';

@UseGuards(JwtAuthGuard)
@Controller('system-parameter')
export class SystemParameterController {
  constructor(private readonly systemParameterService: SystemParameterService) {}

  @Get()
  getAll(@Query('category') category?: string) {
    if (category) {
      return this.systemParameterService.getParametersByCategory(category);
    }
    return this.systemParameterService.getAllParameters();
  }

  @Get(':key')
  getOne(@Param('key') key: string) {
    return this.systemParameterService.getParameter(key);
  }

  @Post()
  create(@Body() createParameterDto: CreateParameterDto) {
    return this.systemParameterService.create(createParameterDto);
  }

  @Put(':key')
  update(@Param('key') key: string, @Body() updateParameterDto: UpdateParameterDto) {
    return this.systemParameterService.update(key, updateParameterDto);
  }

  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.systemParameterService.remove(key);
  }
}
