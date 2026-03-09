import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.join(__dirname, 'src');

// A mapping of Old Turkish Terms -> New English Terms based on the Prisma schema changes
const DICTIONARY: Record<string, string> = {
    // Common Fields
    'islemTipi': 'actionType',
    'islemTarihi': 'transactionDate',
    'aciklama': 'description',
    'tutar': 'amount',
    'birimFiyat': 'unitPrice',
    'toplamTutar': 'totalAmount',
    'kdvOrani': 'taxRate',
    'kdvTutari': 'taxAmount',
    'indirimOrani': 'discountRate',
    'indirimTutari': 'discountAmount',
    'araToplam': 'subTotal',
    'genelToplam': 'grandTotal',
    'belgeNo': 'documentNo',
    'notlar': 'notes',
    'tarih': 'date',

    // Models / Entities (Prisma Client Relations)
    'stokHareket': 'productMovement',
    'stokHareketleri': 'productMovements',
    'StokHareket': 'ProductMovement',
    'StokHareketleri': 'ProductMovements',

    'cariHareket': 'accountMovement',
    'cariHareketler': 'accountMovements',
    'CariHareket': 'AccountMovement',
    'CariHareketler': 'AccountMovements',

    'faturaKalem': 'invoiceItem',
    'faturaKalemleri': 'invoiceItems',
    'FaturaKalem': 'InvoiceItem',
    'FaturaKalemleri': 'InvoiceItems',

    'siparisKalem': 'salesOrderItem',
    'siparisKalemleri': 'salesOrderItems',
    'SiparisKalem': 'SalesOrderItem',
    'SiparisKalemleri': 'SalesOrderItems',
    'siparis_no': 'orderNo',
    'siparisNo': 'orderNo',

    'teklifKalem': 'quoteItem',
    'teklifKalemleri': 'quoteItems',
    'TeklifKalem': 'QuoteItem',
    'TeklifKalemleri': 'QuoteItems',

    'kasaHareket': 'cashboxMovement',
    'kasaHareketler': 'cashboxMovements',
    'KasaHareket': 'CashboxMovement',
    'KasaHareketler': "CashboxMovements",

    'bankaHareket': 'bankMovement',
    'BankaHareket': 'BankMovement',

    // Enums and Lookups
    'faturaTipi': 'invoiceType',
    'siparisTipi': 'orderType',
    'odemeTipi': 'paymentType',

    // Prisma Include/Select mappings
    'faturas': 'invoices',
    'cariler': 'accounts',
    'stoklar': 'products',
    'kasalar': 'cashboxes',
    'masraflar': 'expenses',
    'bankalar': 'banks',
    'depolar': 'warehouses',
    'personeller': 'employees',
    'fisNo': 'receiptNo',
    'cariId': 'accountId',
    'stokId': 'productId',
    'depoId': 'warehouseId',
    'kasaId': 'cashboxId',
    'bankaId': 'bankAccountId',
    'personelId': 'employeeId',

    // Types
    'FaturaTipi': 'InvoiceType',
    'SiparisTipi': 'OrderType',
    'OdemeTipi': 'PaymentType',
    'IslemTipi': 'ActionType',

    // Specifically for Enums properties where Typescript errors like "DURUM_DEGISIKLIGI"
    'DURUM_DEGISIKLIGI': 'STATUS_CHANGE',
    'TAHSIL': 'COLLECTION',
    'KISMI_TAHSIL': 'PARTIAL_COLLECTION',
    'IPTAL': 'CANCELLATION',
};

// Precise regex map for object properties, variable names, and method names
// We use \b boundary to prevent partial matches (e.g. replacing 'tarih' inside 'tescilTarihi')
function applyTranslations(content: string): string {
    let newContent = content;

    for (const [tr, en] of Object.entries(DICTIONARY)) {
        // Replace exact word boundaries
        const regex = new RegExp(`\\b${tr}\\b`, 'g');
        newContent = newContent.replace(regex, en);
    }

    // Also replace @Controller('fatura') to @Controller('invoices') type routes
    newContent = newContent.replace(/@Controller\(['"]siparis['"]\)/g, "@Controller('sales-orders')");
    newContent = newContent.replace(/@Controller\(['"]stok['"]\)/g, "@Controller('products')");
    newContent = newContent.replace(/@Controller\(['"]cari['"]\)/g, "@Controller('accounts')");
    newContent = newContent.replace(/@Controller\(['"]fatura['"]\)/g, "@Controller('invoices')");
    newContent = newContent.replace(/@Controller\(['"]kasa['"]\)/g, "@Controller('cashboxes')");
    newContent = newContent.replace(/@Controller\(['"]masraf['"]\)/g, "@Controller('expenses')");
    newContent = newContent.replace(/@Controller\(['"]tahsilat['"]\)/g, "@Controller('collections')");
    newContent = newContent.replace(/@Controller\(['"]odeme['"]\)/g, "@Controller('payments')");
    newContent = newContent.replace(/@Controller\(['"]cek['"]\)/g, "@Controller('checks')");
    newContent = newContent.replace(/@Controller\(['"]senet['"]\)/g, "@Controller('bills')");
    newContent = newContent.replace(/@Controller\(['"]banka['"]\)/g, "@Controller('banks')");
    newContent = newContent.replace(/@Controller\(['"]urun['"]\)/g, "@Controller('products')");
    newContent = newContent.replace(/@Controller\(['"]depo['"]\)/g, "@Controller('warehouses')");

    return newContent;
}

function walkAndReplace(dir: string) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            walkAndReplace(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const newContent = applyTranslations(content);

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

console.log("Starting translation script...");
walkAndReplace(SRC_DIR);
console.log("Translation complete!");
