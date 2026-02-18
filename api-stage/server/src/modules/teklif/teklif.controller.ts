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
  Req,
} from '@nestjs/common';
import { TeklifService } from './teklif.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateTeklifDto } from './dto/create-teklif.dto';
import { UpdateTeklifDto } from './dto/update-teklif.dto';
import { QueryTeklifDto } from './dto/query-teklif.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('teklif')
export class TeklifController {
  constructor(private readonly teklifService: TeklifService) {}

  @Get()
  findAll(@Query() query: QueryTeklifDto) {
    return this.teklifService.findAll(
      query.page ? parseInt(query.page) : 1,
      query.limit ? parseInt(query.limit) : 50,
      query.teklifTipi as any,
      query.search,
      query.cariId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teklifService.findOne(id);
  }

  @Post()
  create(
    @Body() createTeklifDto: CreateTeklifDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.teklifService.create(
      createTeklifDto,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTeklifDto: UpdateTeklifDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.teklifService.update(
      id,
      updateTeklifDto,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.teklifService.remove(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/durum')
  changeDurum(
    @Param('id') id: string,
    @Body('durum') durum: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.teklifService.changeDurum(
      id,
      durum as any,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/siparise-donustur')
  sipariseDonustur(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.teklifService.sipariseDonustur(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }
}
