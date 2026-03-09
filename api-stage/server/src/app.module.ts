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
import { VehicleBrandModule } from './modules/vehicle-brand/vehicle-brand.module';
import { CustomerVehicleModule } from './modules/customer-vehicle/customer-vehicle.module';
import { WorkOrderModule } from './modules/work-order/work-order.module';
import { TechniciansModule } from './modules/technicians/technicians.module';
import { WorkOrderItemModule } from './modules/work-order-item/work-order-item.module';
import { PartRequestModule } from './modules/part-request/part-request.module';
import { ServiceInvoiceModule } from './modules/service-invoice/service-invoice.module';
import { JournalEntryModule } from './modules/journal-entry/journal-entry.module';
import { AuthModule } from './modules/auth/auth.module';
import { BankTransferModule } from './modules/bank-transfer/bank-transfer.module';
import { BankAccountModule } from './modules/bank-account/bank-account.module';
import { BankModule } from './modules/bank/bank.module';
import { SimpleOrderModule } from './modules/simple-order/simple-order.module';
import { AccountMovementModule } from './modules/account-movement/account-movement.module';
import { AccountModule } from './modules/account/account.module';
import { SalesAgentModule } from './modules/sales-agent/sales-agent.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';


import { CodeTemplateModule } from './modules/code-template/code-template.module';
import { CostingModule } from './modules/costing/costing.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { PriceListModule } from './modules/price-list/price-list.module';
import { InvoiceProfitModule } from './modules/invoice-profit/invoice-profit.module';
import { CompanyCreditCardModule } from './modules/company-credit-card/company-credit-card.module';
import { CashboxModule } from './modules/cashbox/cashbox.module';
import { CategoryModule } from './modules/category/category.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { LocationModule } from './modules/location/location.module';
import { BrandModule } from './modules/brand/brand.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { SalaryPlanModule } from './modules/salary-plan/salary-plan.module';
import { SalaryPaymentModule } from './modules/salary-payment/salary-payment.module';
import { AdvanceModule } from './modules/advance/advance.module';
import { UnitSetModule } from './modules/unit-set/unit-set.module';
import { PlansModule } from './modules/plans/plans.module';
import { PriceCardModule } from './modules/price-card/price-card.module';
import { ProductBarcodeModule } from './modules/product-barcode/product-barcode.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { InventoryCountModule } from './modules/inventory-count/inventory-count.module';
import { OrderModule } from './modules/order/order.module';
import { SalesWaybillModule } from './modules/sales-waybill/sales-waybill.module';
import { PurchaseWaybillModule } from './modules/purchase-waybill/purchase-waybill.module';
import { StockMoveModule } from './modules/stock-move/stock-move.module';
import { ProductMovementModule } from './modules/product-movement/product-movement.module';
import { ProductModule } from './modules/product/product.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { SystemParameterModule } from './modules/system-parameter/system-parameter.module';
import { CollectionModule } from './modules/collection/collection.module';
// import { QuoteModule } from './modules/quote/quote.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { PostalCodeModule } from './modules/postal-code/postal-code.module';
import { QuickInvoiceModule } from './modules/quick-invoice/quick-invoice.module';
import { WarehouseCriticalStockModule } from './modules/warehouse-critical-stock/warehouse-critical-stock.module';
import { WarehouseTransferModule } from './modules/warehouse-transfer/warehouse-transfer.module';
import { CheckBillModule } from './modules/check-bill/check-bill.module';
import { PosModule } from './modules/pos/pos.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { StorageModule } from './modules/storage/storage.module';
import { AdminModule } from './modules/admin/admin.module';
import { QueueModule } from './common/modules/queue.module';
import { CompanyVehiclesModule } from './modules/company-vehicles/company-vehicles.module';
import { VehicleExpensesModule } from './modules/vehicle-expenses/vehicle-expenses.module';
import { RlsModule } from './modules/rls/rls.module';

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
    SalesAgentModule,
    TenantsModule,
    SubscriptionsModule,
    PaymentsModule,
    PlansModule,
    AnalyticsModule,
    UsersModule,
    DashboardModule,
    LicensesModule,

    ProductModule,
    ProductMovementModule,
    AccountModule,
    AccountMovementModule,
    InvoiceModule,
    OrderModule,
    SalesWaybillModule,
    PurchaseWaybillModule,
    // QuoteModule,
    InventoryCountModule,
    SystemParameterModule,
    CollectionModule,
    CashboxModule,
    BankAccountModule,
    BankModule,
    CompanyCreditCardModule,
    ExpenseModule,
    BankTransferModule,

    EmployeeModule,
    SalaryPlanModule,
    // SalaryPaymentModule, // Temporarily disabled due to multiple errors
    AdvanceModule,
    UnitSetModule,
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
    ReportingModule,
    BrandModule,
    CategoryModule,
    VehicleBrandModule,
    CustomerVehicleModule,
    WorkOrderModule,
    TechniciansModule,
    WorkOrderItemModule,
    PartRequestModule,
    ServiceInvoiceModule,
    JournalEntryModule,
    PurchaseOrdersModule,
    SimpleOrderModule,
    QuickInvoiceModule,
    // Service Module - REMOVED
    WarehouseTransferModule,
    CheckBillModule,
    PosModule,
    StorageModule,
    AdminModule,
    QueueModule,
    CompanyVehiclesModule,
    VehicleExpensesModule,
    RlsModule,
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
