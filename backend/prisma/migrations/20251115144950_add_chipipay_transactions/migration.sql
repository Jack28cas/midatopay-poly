-- CreateTable
CREATE TABLE "chipipay_transactions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "amountARS" DECIMAL(10,2) NOT NULL,
    "amountUSDC" DECIMAL(18,6) NOT NULL,
    "txHash" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chipipay_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chipipay_transactions_txHash_key" ON "chipipay_transactions"("txHash");
