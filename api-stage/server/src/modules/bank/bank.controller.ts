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
import { BankService } from './bank.service';
import { CreateBankDto, UpdateBankDto } from './dto/create-bank.dto';
import { BankAccountCreateDto, BankAccountUpdateDto } from './dto/create-account.dto';
import { CreateBankHareketDto, CreatePosHareketDto } from './dto/create-movement.dto';
import { CreateLoanKullanimDto } from './dto/create-loan.dto';
import { PayCreditInstallmentDto } from './dto/pay-credit-installment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('bank')
@UseGuards(JwtAuthGuard)
export class BankController {
    constructor(private readonly bankService: BankService) {
        console.log('BankController initialized');
    }

    @Get('ping')
    ping() {
        return 'pong';
    }

    // ============ BANK ENDPOINTS ============

    @Post()
    create(@Body() createBankDto: CreateBankDto) {
        return this.bankService.create(createBankDto);
    }

    @Get()
    findAll() {
        return this.bankService.findAll();
    }

    @Get('ozet')
    getBanklarOzet() {
        return this.bankService.getBanklarOzet();
    }

    // ============ HAREKET ENDPOINTS ============

    @Get('account/:accountId/movements')
    getHareketler(
        @Param('accountId') accountId: string,
        @Query('start') start?: string,
        @Query('end') end?: string,
        @Query('limit') limit?: string,
    ) {
        return this.bankService.getHareketler(accountId, {
            baslangic: start ? new Date(start) : undefined,
            bitis: end ? new Date(end) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }

    @Post('account/:accountId/movement')
    createHareket(
        @Param('accountId') accountId: string,
        @Body() dto: CreateBankHareketDto,
    ) {
        return this.bankService.createHareket(accountId, dto);
    }

    @Post('account/:accountId/pos-payment')
    createPosHareket(
        @Param('accountId') accountId: string,
        @Body() dto: CreatePosHareketDto,
    ) {
        return this.bankService.createPosHareket(accountId, dto);
    }

    // ============ KREDİ İŞLEMLERİ ============

    @Get('loans/all')
    getAllLoanler() {
        return this.bankService.getAllLoanler();
    }

    @Post('account/:accountId/loan-kullan')
    loanKullan(
        @Param('accountId') accountId: string,
        @Body() dto: CreateLoanKullanimDto,
    ) {
        return this.bankService.loanKullan(accountId, dto);
    }

    @Get('account/:accountId/loans')
    getLoanler(@Param('accountId') accountId: string) {
        return this.bankService.getLoanler(accountId);
    }

    @Get('loan/:loanId')
    getLoanDetay(@Param('loanId') loanId: string) {
        return this.bankService.getLoanDetay(loanId);
    }

    @Get('credit-cards/upcoming')
    getUpcomingCreditCardDates(
        @Query('start') start?: string,
        @Query('end') end?: string,
    ) {
        return this.bankService.getUpcomingCreditCardDates(
            start ? new Date(start) : new Date(),
            end ? new Date(end) : new Date(),
        );
    }

    @Get('installments/upcoming')
    getUpcomingInstallments(
        @Query('start') start?: string,
        @Query('end') end?: string,
    ) {
        return this.bankService.getYaklasanInstallmentler(
            start ? new Date(start) : new Date(),
            end ? new Date(end) : new Date(),
        );
    }

    @Post('loan/:loanId/plan')
    addLoanPlan(
        @Param('loanId') loanId: string,
        @Body() dto: { amount: number; dueDate: Date | string },
    ) {
        return this.bankService.addLoanPlan(loanId, {
            amount: dto.amount,
            dueDate: new Date(dto.dueDate),
        });
    }

    @Put('loan-plan/:id')
    updateLoanPlan(
        @Param('id') id: string,
        @Body() dto: { amount?: number; dueDate?: Date | string },
    ) {
        return this.bankService.updateLoanPlan(id, {
            amount: dto.amount,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        });
    }

    @Delete('loan-plan/:id')
    deleteLoanPlan(@Param('id') id: string) {
        return this.bankService.deleteLoanPlan(id);
    }

    @Post('loan-plan/:id/payment')
    payInstallment(
        @Param('id') id: string,
        @Body() dto: PayCreditInstallmentDto,
    ) {
        return this.bankService.payInstallment(id, dto);
    }

    // ============ HESAP İŞLEMLERİ ============

    @Get('account')
    findAllAccounts() {
        return this.bankService.findAllAccounts();
    }

    @Post(':id/account')
    createAccount(
        @Param('id') id: string,
        @Body() dto: BankAccountCreateDto,
    ) {
        return this.bankService.createAccount(id, dto);
    }

    @Get('account/:id')
    findAccount(@Param('id') id: string) {
        return this.bankService.findAccount(id);
    }

    @Put('account/:id')
    updateAccount(
        @Param('id') id: string,
        @Body() dto: BankAccountUpdateDto,
    ) {
        return this.bankService.updateAccount(id, dto);
    }

    @Delete('account/:id')
    removeAccount(@Param('id') id: string) {
        return this.bankService.removeAccount(id);
    }

    // ============ GENERIC BANK ENDPOINTS ============

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bankService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateBankDto: UpdateBankDto) {
        return this.bankService.update(id, updateBankDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bankService.remove(id);
    }
}
