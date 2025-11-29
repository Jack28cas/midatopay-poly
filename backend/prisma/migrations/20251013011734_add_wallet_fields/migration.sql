-- AlterTable
ALTER TABLE "users" ADD COLUMN     "privateKey" TEXT,
ADD COLUMN     "publicKey" TEXT,
ADD COLUMN     "walletCreatedAt" TIMESTAMP(3);
