-- CreateEnum
CREATE TYPE "JustificationType" AS ENUM ('ENFERMEDAD', 'CALAMIDAD_DOMESTICA', 'LUTO', 'OTRO');

-- CreateEnum
CREATE TYPE "JustificationStatus" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "justificationId" TEXT;

-- CreateTable
CREATE TABLE "Justification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" "JustificationType" NOT NULL,
    "description" TEXT NOT NULL,
    "documentUrl" TEXT,
    "status" "JustificationStatus" NOT NULL DEFAULT 'PENDIENTE',
    "adminResponse" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Justification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_justificationId_fkey" FOREIGN KEY ("justificationId") REFERENCES "Justification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Justification" ADD CONSTRAINT "Justification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Justification" ADD CONSTRAINT "Justification_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
