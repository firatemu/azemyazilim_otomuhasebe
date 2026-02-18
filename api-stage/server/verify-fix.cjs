const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const cariId = 'f0b1ca26-051b-4515-84ef-394f2d7239fd';
  const tutar = 100;
  
  try {
    const cariBefore = await prisma.cari.findUnique({ where: { id: cariId } });
    console.log('Balance before:', cariBefore.bakiye.toNumber());
    
    await prisma.$transaction(async (tx) => {
       const cariRecord = await tx.cari.findUnique({
          where: { id: cariId },
          select: { bakiye: true },
        });
        const yeniCariBakiye = cariRecord.bakiye.toNumber() - tutar;
        
        await tx.cariHareket.create({
          data: {
            cariId: cariId,
            tip: 'ALACAK',
            tutar: tutar,
            bakiye: yeniCariBakiye,
            aciklama: 'Verification Test',
            belgeTipi: 'TAHSILAT',
            belgeNo: 'TEST-VERIFY-' + Date.now(),
          },
        });

        await tx.cari.update({
          where: { id: cariId },
          data: { bakiye: yeniCariBakiye },
        });
    });
    
    const cariAfter = await prisma.cari.findUnique({ where: { id: cariId } });
    console.log('Balance after:', cariAfter.bakiye.toNumber());
    
    const diff = cariAfter.bakiye.toNumber() - cariBefore.bakiye.toNumber();
    console.log('Difference:', diff);
    
    if (Math.abs(diff + tutar) < 0.001) {
      console.log('Verification SUCCESS: Balance updated exactly once.');
    } else {
      console.log('Verification FAILED: Balance updated incorrectly:', diff);
    }
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
