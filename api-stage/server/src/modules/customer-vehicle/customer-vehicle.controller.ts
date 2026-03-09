import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync, existsSync } from 'fs';
import { CustomerVehicleService } from './customer-vehicle.service';
import { CreateCustomerVehicleDto, UpdateCustomerVehicleDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { editFileName, imageFileFilter } from '../../common/utils/file-upload.utils';

@UseGuards(JwtAuthGuard)
@Controller('customer-vehicle')
export class CustomerVehicleController {
  constructor(private readonly customerVehicleService: CustomerVehicleService) {}

  @Post('upload-ruhsat')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = './uploads/ruhsat';
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadRuhsatPhoto(@UploadedFile() file: Express.Multer.File) {
    const url = `/api/uploads/ruhsat/${file.filename}`;
    return { url };
  }

  @Post()
  create(@Body() dto: CreateCustomerVehicleDto) {
    return this.customerVehicleService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('accountId') accountId?: string,
  ) {
    return this.customerVehicleService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      search,
      accountId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerVehicleService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerVehicleDto,
  ) {
    return this.customerVehicleService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerVehicleService.remove(id);
  }
}
