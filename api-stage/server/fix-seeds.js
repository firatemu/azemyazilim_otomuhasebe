const fs = require('fs');
const path = require('path');

const SEED_DICT = {
    'stokKodu': 'code',
    'stokAdi': 'name',
    'stokTuru': 'type',
    'kdvOrani': 'taxRate',
    'marka': 'brand',
    'alisFiyati': 'purchasePrice',
    'satisFiyati': 'salesPrice',
    'birim': 'unit',
    'aciklama': 'description'
};

const dir = path.join(__dirname, 'prisma');
if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith('.ts')) {
            const fullPath = path.join(dir, file);
            let content = fs.readFileSync(fullPath, 'utf8');

            for (const [tr, en] of Object.entries(SEED_DICT)) {
                content = content.replace(new RegExp(`\\b${tr}\\b`, 'g'), en);
            }
            content = content.replace(/\.stok\b/g, '.product');
            content = content.replace(/\.stoklar\b/g, '.products');

            fs.writeFileSync(fullPath, content);
            console.log(`Updated seed file: ${file}`);
        }
    }
}

// And fix DEMAND_DEPOSIT one final time brutally
const dtoPath = path.join(__dirname, 'src/modules/bank-account/dto/create-bank-account.dto.ts');
if (fs.existsSync(dtoPath)) {
    let content = fs.readFileSync(dtoPath, 'utf8');
    // Strip out duplicate enum member line
    let lines = content.split('\n');
    lines = lines.filter(l => !l.includes("DEMAND_DEPOSIT") || l.indexOf("DEMAND_DEPOSIT") === l.lastIndexOf("DEMAND_DEPOSIT"));
    // Above logic might break if both are on same line. Let's just use replace.
    content = content.replace(/DEMAND_DEPOSIT\s*=\s*['"]DEMAND_DEPOSIT['"],\s*DEMAND_DEPOSIT\s*=\s*['"]DEMAND_DEPOSIT['"],/, "DEMAND_DEPOSIT = 'DEMAND_DEPOSIT',");
    fs.writeFileSync(dtoPath, content);
    console.log("Fixed DEMAND_DEPOSIT duplicate in DTO");
}

// repro_empty
const reproPath = path.join(__dirname, 'repro_empty.ts');
if (fs.existsSync(reproPath)) {
    fs.unlinkSync(reproPath);
}
