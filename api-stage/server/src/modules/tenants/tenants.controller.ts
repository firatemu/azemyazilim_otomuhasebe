import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, Req, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../../common/utils/file-upload.utils';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) { }

  @Post()
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get('current')
  getCurrent(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    return this.tenantsService.getCurrent(tenantId);
  }

  @Get('settings')
  getSettings(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    return this.tenantsService.getSettings(tenantId);
  }

  @Put('settings')
  updateSettings(@Req() req: any, @Body() updateSettingsDto: UpdateTenantSettingsDto) {
    const tenantId = req.user?.tenantId;
    return this.tenantsService.updateSettings(tenantId, updateSettingsDto);
  }

  @Post('settings/logo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadLogo(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const tenantId = req.user?.tenantId;
    // URL'yi oluştur - main.ts'de /api/uploads olarak sunuluyor
    const logoUrl = `/api/uploads/${file.filename}`;
    return this.tenantsService.updateLogo(tenantId, logoUrl);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }

  @Post(':id/approve-trial')
  approveTrial(@Param('id') id: string) {
    return this.tenantsService.approveTrial(id);
  }
}

