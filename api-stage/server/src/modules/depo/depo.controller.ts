import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DepoService } from './depo.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('depo')
export class DepoController {
  constructor(private readonly depoService: DepoService) {}

  @Get()
  findAll() {
    return this.depoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.depoService.findOne(id);
  }
}
