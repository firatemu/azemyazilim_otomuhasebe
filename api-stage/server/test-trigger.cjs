const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const cariId = 'f0b1ca26-051b-4515-84ef-394f2d7239fd';
  const tutar = 5;
  
  const cariBefore = await prisma.cari.findUnique({ where: { id: cariId } });
  console.log('Balance before:', cariBefore.bakiye.toNumber());
  
  await prisma.cariHareket.create({
    data: {
      cariId: cariId,
      tip: 'ALACAK',
      tutar: tutar,
      bakiye: 0,
      aciklama: 'Trigger Test',
      belgeTipi: 'TAHSILAT',
      belgeNo: 'TEST-TRIGGER-' + Date.now(),
    },
  });
  
  const cariAfter = await prisma.cari.findUnique({ where: { id: cariId } });
  console.log('Balance after:', cariAfter.bakiye.toNumber());
  
  if (cariBefore.bakiye.toNumber() !== cariAfter.bakiye.toNumber()) {
    console.log('HIDDEN TRIGGER DETECTED!');
  } else {
    console.log('No hidden trigger found.');
  }
}

test();
