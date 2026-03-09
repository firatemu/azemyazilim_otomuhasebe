import * as fs from 'fs';
import * as path from 'path';

// Define the precise word mapping based on schema.prisma translations
const dictionary: Record<string, string> = {
  // Common Fields
  "islemTarihi": "transactionDate",
  "islemTipi": "actionType",
  "tarih": "date",
  "aciklama": "description",
  "notlar": "notes",
  "tutar": "amount",
  "birimFiyat": "unitPrice",
  "toplamTutar": "totalAmount",
  "kdvOrani": "taxRate",
  "kdvTutari": "taxAmount",
  "indirimOrani": "discountRate",
  "indirimTutari": "discountAmount",
  "genelToplam": "grandTotal",
  "araToplam": "subTotal",
  "belgeNo": "documentNo",
  
  // Specific Models that changed
  "stokHareket": "productMovement",
  "stokHareketleri": "productMovements",
  "StokHareket": "ProductMovement",
  "StokHareketleri": "ProductMovements",

  "cariHareket": "accountMovement",
  "cariHareketler": "accountMovements",
  "CariHareket": "AccountMovement",
  "CariHareketler": "AccountMovements",

  "faturaKalem": "invoiceItem",
  "faturaKalemleri": "invoiceItems",
  "FaturaKalem": "InvoiceItem",
  "FaturaKalemleri": "InvoiceItems",
  
  "siparisKalem": "salesOrderItem",
  "siparisKalemi": "salesOrderItem",
  "siparisKalemleri": "salesOrderItems",
  "SiparisKalem": "SalesOrderItem",
  "SiparisKalemleri": "SalesOrderItems",

  "teklifKalem": "quoteItem",
  "teklifKalemleri": "quoteItems",
  "TeklifKalem": "QuoteItem",
  "TeklifKalemleri": "QuoteItems",

  "kasaHareket": "cashboxMovement",
  "kasaHareketler": "cashboxMovements",
  "KasaHareket": "CashboxMovement",
  "KasaHareketler": "CashboxMovements",

  "bankaHareket": "bankMovement",
  "BankaHareket": "BankMovement",
  
  "faturaTipi": "invoiceType",
  "siparisTipi": "orderType",
  "odemeTipi": "paymentType",

  // Model References
  "faturas": "invoices",
  "cariler": "accounts",
  "stoklar": "products",
  "kasalar": "cashboxes",
  "masraflar": "expenses",
  "bankalar": "banks",
  "depolar": "warehouses",
  "personeller": "employees"
};

// ... we will use a more sophisticated AST or regex based approach
console.log("Dictionary prepared.");
