import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔄 Creating invoice number templates...')
    const currentYear = new Date().getFullYear()

    // INVOICE_SALES template
    const sales = await prisma.codeTemplate.upsert({
        where: { module: 'INVOICE_SALES' },
        update: {
            prefix: `FRT${currentYear}`,
            digitCount: 9
        },
        create: {
            module: 'INVOICE_SALES',
            name: 'Satış Faturası',
            prefix: `FRT${currentYear}`,
            digitCount: 9,
            currentValue: 0,
            isActive: true
        }
    })
    console.log('✅ Created INVOICE_SALES:', sales)

    // INVOICE_PURCHASE template
    const purchase = await prisma.codeTemplate.upsert({
        where: { module: 'INVOICE_PURCHASE' },
        update: {
            prefix: `FRT${currentYear}`,
            digitCount: 9
        },
        create: {
            module: 'INVOICE_PURCHASE',
            name: 'Alış Faturası',
            prefix: `FRT${currentYear}`,
            digitCount: 9,
            currentValue: 0,
            isActive: true
        }
    })
    console.log('✅ Created INVOICE_PURCHASE:', purchase)

    // Verify all invoice templates
    const templates = await prisma.codeTemplate.findMany({
        where: {
            module: {
                in: ['INVOICE_SALES', 'INVOICE_PURCHASE']
            }
        }
    })

    console.log('\n📊 All invoice templates:')
    console.table(templates)
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
