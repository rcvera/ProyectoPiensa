-- CreateTable
CREATE TABLE "Overtime" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "workedHours" DOUBLE PRECISION NOT NULL,
    "overtimeHours" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Overtime_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Overtime" ADD CONSTRAINT "Overtime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Overtime" ADD CONSTRAINT "Overtime_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
