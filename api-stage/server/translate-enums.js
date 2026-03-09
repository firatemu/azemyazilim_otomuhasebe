const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');

const ENUM_DICT = {
    // Transfer / Movement types
    'HAVALE_GELEN': 'INCOMING_TRANSFER',
    'HAVALE_GIDEN': 'OUTGOING_TRANSFER',
    'GELEN_HAVALE': 'INCOMING_TRANSFER',
    'GIDEN_HAVALE': 'OUTGOING_TRANSFER',
    'KREDI_KARTI': 'CREDIT_CARD',
    'NAKIT': 'CASH',
    'VIRMAN': 'TRANSFER',
    'DEVIR': 'CARRY_FORWARD',
    'CEK_TAHSILAT': 'CHECK_COLLECTION',
    'SENET_TAHSILAT': 'PROMISSORY_COLLECTION',

    // Invoice / Document types
    'ALIS': 'PURCHASE',
    'SATIS': 'SALES',
    'ALIS_IADE': 'PURCHASE_RETURN',
    'SATIS_IADE': 'SALES_RETURN',
    'TAHSILAT': 'COLLECTION',
    'ODEME': 'PAYMENT',
    'GELIR': 'INCOME',
    'GIDER': 'EXPENSE',

    // Account Types
    'BANKA': 'BANK',
    'KASA': 'CASHBOX',
    'CARI': 'CUSTOMER',
    'PERSONEL': 'PERSONNEL',

    // Statuses
    'ACIK': 'OPEN',
    'KAPALI': 'CLOSED',
    'BEKLIYOR': 'PENDING',
    'TAMAMLANDI': 'COMPLETED',
    'KISMI': 'PARTIAL',

    // Other specific occurrences
    'DEMAND_DEPOSIT': 'DEMAND_DEPOSIT', // Duplicate remover handles this implicitly if needed

    // DTO Files and generic cleanup
    'accountKodu': 'accountCode',
    'cashboxAdi': 'name', // explicit fix
    'cashboxKodu': 'code',

    // Module replacements specifically in imports
    'satinalma': 'purchase',
    'siparis': 'order',
    'stok': 'product'
};

function walkAndReplace(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            walkAndReplace(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content;

            for (const [tr, en] of Object.entries(ENUM_DICT)) {
                // Enums are usually uppercase and part of a member expression or string literal
                const regex = new RegExp(`\\b${tr}\\b`, 'g');
                newContent = newContent.replace(regex, en);
            }

            // Fix duplicate DEMAND_DEPOSIT issue specifically
            newContent = newContent.replace(/DEMAND_DEPOSIT\s*=\s*'DEMAND_DEPOSIT',\s*DEMAND_DEPOSIT\s*=\s*'DEMAND_DEPOSIT'/g, "DEMAND_DEPOSIT = 'DEMAND_DEPOSIT'");

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated Enums in: ${fullPath}`);
            }
        }
    }
}

console.log("Starting Enum translation script...");
walkAndReplace(SRC_DIR);
console.log("Enum Translation complete!");
