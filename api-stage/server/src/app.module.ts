import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { PrismaModule } from './common/prisma.module';
import { LicenseModule } from './common/services/license.module';
import { RedisModule } from './common/services/redis.module';
import { TenantContextModule } from './common/services/tenant-context.module';
import { DeletionProtectionModule } from './common/services/deletion-protection.module';
import { SecurityModule } from './common/services/security.module';
import { TenantSecurityExceptionFilter } from './common/filters/tenant-security-exception.filter';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AracModule } from './modules/arac/arac.module';
import { CustomerVehicleModule } from './modules/customer-vehicle/customer-vehicle.module';
import { WorkOrderModule } from './modules/work-order/work-order.module';
import { TechniciansModule } from './modules/technicians/technicians.module';
import { WorkOrderItemModule } from './modules/work-order-item/work-order-item.module';
import { PartRequestModule } from './modules/part-request/part-request.module';
import { ServiceInvoiceModule } from './modules/service-invoice/service-invoice.module';
import { JournalEntryModule } from './modules/journal-entry/journal-entry.module';
import { AuthModule } from './modules/auth/auth.module';
import { BankaHavaleModule } from './modules/banka-havale/banka-havale.module';
import { BankaHesapModule } from './modules/banka-hesap/banka-hesap.module';
import { BankaModule } from './modules/banka/banka.module';
import { BasitSiparisModule } from './modules/basit-siparis/basit-siparis.module';
import { CariHareketModule } from './modules/cari-hareket/cari-hareket.module';
import { CariModule } from './modules/cari/cari.module';
import { SatisElemaniModule } from './modules/satis-elemani/satis-elemani.module';

import { CodeTemplateModule } from './modules/code-template/code-template.module';
import { CostingModule } from './modules/costing/costing.module';
import { DepoModule } from './modules/depo/depo.module';
import { FaturaModule } from './modules/fatura/fatura.module';
import { InvoiceProfitModule } from './modules/invoice-profit/invoice-profit.module';
import { FirmaKrediKartiModule } from './modules/firma-kredi-karti/firma-kredi-karti.module';
import { KasaModule } from './modules/kasa/kasa.module';
import { KategoriModule } from './modules/kategori/kategori.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { LocationModule } from './modules/location/location.module';
import { MarkaModule } from './modules/marka/marka.module';
import { MasrafModule } from './modules/masraf/masraf.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PersonelModule } from './modules/personel/personel.module';
import { MaasPlanModule } from './modules/maas-plan/maas-plan.module';
import { MaasOdemeModule } from './modules/maas-odeme/maas-odeme.module';
import { AvansModule } from './modules/avans/avans.module';
import { PlansModule } from './modules/plans/plans.module';
import { PriceCardModule } from './modules/price-card/price-card.module';
import { ProductBarcodeModule } from './modules/product-barcode/product-barcode.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { RaporlamaModule } from './modules/raporlama/raporlama.module';
import { SatinAlmaSiparisiModule } from './modules/satin-alma-siparisi/satin-alma-siparisi.module';
import { SayimModule } from './modules/sayim/sayim.module';
import { SiparisModule } from './modules/siparis/siparis.module';
import { SatisIrsaliyesiModule } from './modules/satis-irsaliyesi/satis-irsaliyesi.module';
import { SatınAlmaIrsaliyesiModule } from './modules/satin-alma-irsaliyesi/satin-alma-irsaliyesi.module';
import { StockMoveModule } from './modules/stock-move/stock-move.module';
import { StokHareketModule } from './modules/stok-hareket/stok-hareket.module';
import { StokModule } from './modules/stok/stok.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { SystemParameterModule } from './modules/system-parameter/system-parameter.module';
import { TahsilatModule } from './modules/tahsilat/tahsilat.module';
import { TeklifModule } from './modules/teklif/teklif.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { PostalCodeModule } from './modules/postal-code/postal-code.module';
import { HizliModule } from './modules/hizli/hizli.module';
import { WarehouseCriticalStockModule } from './modules/warehouse-critical-stock/warehouse-critical-stock.module';
import { WarehouseTransferModule } from './modules/warehouse-transfer/warehouse-transfer.module';
import { CekSenetModule } from './modules/cek-senet/cek-senet.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { StorageModule } from './modules/storage/storage.module';
import { AdminModule } from './modules/admin/admin.module';
import { QueueModule } from './common/modules/queue.module';
import { CompanyVehiclesModule } from './modules/company-vehicles/company-vehicles.module';
import { VehicleExpensesModule } from './modules/vehicle-expenses/vehicle-expenses.module';
@Module({
  imports: [
    RolesModule,
    PermissionsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 saniye
        limit: 100, // 100 request per minute
      },
    ]),
    PrismaModule,
    TenantContextModule,
    DeletionProtectionModule,
    SecurityModule,
    RedisModule,
    LicenseModule,
    JwtModule.register({}),
    AuthModule,
    SatisElemaniModule,
    TenantsModule,
    SubscriptionsModule,
    PaymentsModule,
    PlansModule,
    AnalyticsModule,
    UsersModule,
    LicensesModule,
    StokModule,
    StokHareketModule,
    CariModule,
    CariHareketModule,
    FaturaModule,
    SiparisModule,
    SatisIrsaliyesiModule,
    SatınAlmaIrsaliyesiModule,
    TeklifModule,
    SayimModule,
    SystemParameterModule,
    TahsilatModule,
    KasaModule,
    BankaHesapModule,
    BankaModule,
    FirmaKrediKartiModule,
    DepoModule,
    MasrafModule,
    BankaHavaleModule,

    PersonelModule,
    MaasPlanModule,
    MaasOdemeModule,
    AvansModule,
    WarehouseModule,
    WarehouseCriticalStockModule,
    PostalCodeModule,
    LocationModule,
    ProductBarcodeModule,
    StockMoveModule,
    CodeTemplateModule,
    PriceCardModule,
    CostingModule,
    InvoiceProfitModule,
    RaporlamaModule,
    MarkaModule,
    KategoriModule,
    AracModule,
    CustomerVehicleModule,
    WorkOrderModule,
    TechniciansModule,
    WorkOrderItemModule,
    PartRequestModule,
    ServiceInvoiceModule,
    JournalEntryModule,
    PurchaseOrdersModule,
    BasitSiparisModule,
    SatinAlmaSiparisiModule,
    HizliModule,
    // Service Module - REMOVED
    WarehouseTransferModule,
    CekSenetModule,
    StorageModule,
    StorageModule,
    AdminModule,
    QueueModule,
    CompanyVehiclesModule,
    VehicleExpensesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => {
        return new JwtAuthGuard(reflector);
      },
      inject: [Reflector],
    },
    {
      provide: APP_FILTER,
      useClass: TenantSecurityExceptionFilter,
    },
    // Global Exception Filter should be last to catch absolute everything else
    // {
    //  provide: APP_FILTER,
    //  useClass: AllExceptionsFilter,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
