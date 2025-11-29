/*
  Migration to recreate transactions table with BigInt paymentId
*/

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_paymentId_fkey";

-- Drop the entire transactions table (data is test data)
DROP TABLE "transactions";

-- Recreate transactions table with new structure
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "paymentId" BIGINT NOT NULL,
    "paymentIdString" TEXT NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "currency" TEXT NOT NULL,
    "exchangeRate" DECIMAL(18,8),
    "finalAmount" DECIMAL(10,2),
    "finalCurrency" TEXT DEFAULT 'ARS',
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "blockchainTxHash" TEXT,
    "walletAddress" TEXT,
    "confirmationCount" INTEGER NOT NULL DEFAULT 0,
    "requiredConfirmations" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_paymentIdString_fkey" FOREIGN KEY ("paymentIdString") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
