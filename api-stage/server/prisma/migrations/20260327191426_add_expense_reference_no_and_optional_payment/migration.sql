-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "reference_no" TEXT,
ALTER COLUMN "payment_type" DROP NOT NULL;
