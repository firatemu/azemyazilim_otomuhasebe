import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
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
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AracModule } from './modules/arac/arac.module';
import { AuthModule } from './modules/auth/auth.module';
import { BankaHavaleModule } from './modules/banka-havale/banka-havale.module';
import { BankaHesapModule } from './modules/banka-hesap/banka-hesap.module';
import { BasitSiparisModule } from './modules/basit-siparis/basit-siparis.module';
import { CariHareketModule } from './modules/cari-hareket/cari-hareket.module';
import { CariModule } from './modules/cari/cari.module';
import { CekSenetModule } from './modules/cek-senet/cek-senet.module';
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
import { TechnicianModule } from './modules/technician/technician.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { WorkOrderModule } from './modules/work-order/work-order.module';
import { ServiceWorkflowModule } from './modules/service-workflow/service-workflow.module';

@Module({
  imports: [
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
    RedisModule,
    LicenseModule,
    JwtModule.register({}),
    AuthModule,
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
    FirmaKrediKartiModule,
    DepoModule,
    MasrafModule,
    BankaHavaleModule,
    CekSenetModule,
    PersonelModule,
    WarehouseModule,
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
    PurchaseOrdersModule,
    BasitSiparisModule,
    SatinAlmaSiparisiModule,
    HizliModule,
    // Service Module
    TechnicianModule,
    VehicleModule,
    WorkOrderModule,
    ServiceWorkflowModule,
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
