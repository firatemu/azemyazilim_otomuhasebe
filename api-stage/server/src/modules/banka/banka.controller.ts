import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { BankaService } from './banka.service';
import { CreateBankaDto, UpdateBankaDto } from './dto/create-banka.dto';
import { CreateBankaHesapDto, UpdateBankaHesapDto } from './dto/create-hesap.dto';
import { CreateBankaHareketDto, CreatePosHareketDto } from './dto/create-hareket.dto';
import { CreateKrediKullanimDto } from './dto/create-kredi.dto';
import { PayCreditInstallmentDto } from './dto/pay-credit-installment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('banka')
@UseGuards(JwtAuthGuard)
export class BankaController {
    constructor(private readonly bankaService: BankaService) {
        console.log('BankaController initialized');
    }

    @Get('ping')
    ping() {
        return 'pong';
    }

    // ============ BANKA ENDPOINTS ============

    @Post()
    create(@Body() createBankaDto: CreateBankaDto) {
        return this.bankaService.create(createBankaDto);
    }

    @Get()
    findAll() {
        return this.bankaService.findAll();
    }

    @Get('ozet')
    getBankalarOzet() {
        return this.bankaService.getBankalarOzet();
    }

    // ============ HAREKET ENDPOINTS ============

    @Get('hesap/:hesapId/hareketler')
    getHareketler(
        @Param('hesapId') hesapId: string,
        @Query('baslangic') baslangic?: string,
        @Query('bitis') bitis?: string,
        @Query('limit') limit?: string,
    ) {
        return this.bankaService.getHareketler(hesapId, {
            baslangic: baslangic ? new Date(baslangic) : undefined,
            bitis: bitis ? new Date(bitis) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }

    @Post('hesap/:hesapId/hareket')
    createHareket(
        @Param('hesapId') hesapId: string,
        @Body() dto: CreateBankaHareketDto,
    ) {
        return this.bankaService.createHareket(hesapId, dto);
    }

    // POS Tahsilat - Komisyon hesaplamalı
    @Post('hesap/:hesapId/pos-tahsilat')
    createPosHareket(
        @Param('hesapId') hesapId: string,
        @Body() dto: CreatePosHareketDto,
    ) {
        return this.bankaService.createPosHareket(hesapId, dto);
    }

    // ============ KREDİ İŞLEMLERİ ============

    // Tüm kredileri listele (tenant bazlı)
    @Get('krediler/tum')
    getAllKrediler() {
        return this.bankaService.getAllKrediler();
    }

    @Post('hesap/:hesapId/kredi-kullan')
    krediKullan(
        @Param('hesapId') hesapId: string,
        @Body() dto: CreateKrediKullanimDto,
    ) {
        return this.bankaService.krediKullan(hesapId, dto);
    }

    @Get('hesap/:hesapId/krediler')
    getKrediler(@Param('hesapId') hesapId: string) {
        return this.bankaService.getKrediler(hesapId);
    }

    @Get('kredi/:krediId')
    getKrediDetay(@Param('krediId') krediId: string) {
        return this.bankaService.getKrediDetay(krediId);
    }

    @Get('taksitler/yaklasan')
    getYaklasanTaksitler(
        @Query('baslangic') baslangic?: string,
        @Query('bitis') bitis?: string,
    ) {
        return this.bankaService.getYaklasanTaksitler(
            baslangic ? new Date(baslangic) : new Date(),
            bitis ? new Date(bitis) : new Date(),
        );
    }
    @Get('kredi-karti/yaklasan')
    getUpcomingKrediKartiTarihleri(
        @Query('baslangic') baslangic?: string,
        @Query('bitis') bitis?: string,
    ) {
        return this.bankaService.getUpcomingKrediKartiTarihleri(
            baslangic ? new Date(baslangic) : new Date(),
            bitis ? new Date(bitis) : new Date(),
        );
    }

    @Post('kredi/:krediId/plan')
    addKrediPlan(
        @Param('krediId') krediId: string,
        @Body() dto: { tutar: number; vadeTarihi: Date | string },
    ) {
        return this.bankaService.addKrediPlan(krediId, {
            ...dto,
            vadeTarihi: new Date(dto.vadeTarihi),
        });
    }

    @Delete('kredi-plan/:id')
    deleteKrediPlan(@Param('id') id: string) {
        return this.bankaService.deleteKrediPlan(id);
    }

    @Put('kredi-plan/:id')
    updateKrediPlan(
        @Param('id') id: string,
        @Body() dto: { tutar?: number; vadeTarihi?: Date | string },
    ) {
        return this.bankaService.updateKrediPlan(id, {
            ...dto,
            vadeTarihi: dto.vadeTarihi ? new Date(dto.vadeTarihi) : undefined,
        });
    }

    @Post('kredi-plan/:id/odeme')
    payInstallment(
        @Param('id') id: string,
        @Body() dto: PayCreditInstallmentDto,
    ) {
        return this.bankaService.payInstallment(id, dto);
    }

    @Get('hesap')
    findAllAccounts() {
        return this.bankaService.findAllAccounts();
    }

    // ============ HESAP İŞLEMLERİ ============

    @Post(':id/hesap')
    createAccount(
        @Param('id') id: string,
        @Body() dto: CreateBankaHesapDto,
    ) {
        return this.bankaService.createAccount(id, dto);
    }

    @Get('hesap/:id')
    findAccount(@Param('id') id: string) {
        return this.bankaService.findAccount(id);
    }

    @Put('hesap/:id')
    updateAccount(
        @Param('id') id: string,
        @Body() dto: UpdateBankaHesapDto,
    ) {
        return this.bankaService.updateAccount(id, dto);
    }

    @Delete('hesap/:id')
    removeAccount(@Param('id') id: string) {
        return this.bankaService.removeAccount(id);
    }

    // ============ GENERIC BANKA ENDPOINTS (Sona taşındı) ============

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bankaService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateBankaDto: UpdateBankaDto) {
        return this.bankaService.update(id, updateBankaDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bankaService.remove(id);
    }
}
