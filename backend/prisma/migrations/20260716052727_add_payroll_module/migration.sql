-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "baseSalary" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "expectedDays" INTEGER NOT NULL,
    "workedDays" INTEGER NOT NULL,
    "absenceDays" INTEGER NOT NULL,
    "lateMinutes" INTEGER NOT NULL,
    "overtimeHours50" DOUBLE PRECISION NOT NULL,
    "overtimeHours100" DOUBLE PRECISION NOT NULL,
    "overtimePay" DOUBLE PRECISION NOT NULL,
    "grossIncome" DOUBLE PRECISION NOT NULL,
    "iessPersonal" DOUBLE PRECISION NOT NULL,
    "iessPatronal" DOUBLE PRECISION NOT NULL,
    "absenceDeduction" DOUBLE PRECISION NOT NULL,
    "lateDeduction" DOUBLE PRECISION NOT NULL,
    "netPay" DOUBLE PRECISION NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_userId_month_year_key" ON "Payslip"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
