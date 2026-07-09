-- Drop old FK/index on User that will move to Employee
ALTER TABLE "User" DROP CONSTRAINT "User_positionId_fkey";
DROP INDEX "User_cedula_key";

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cedula" TEXT,
    "phone" TEXT,
    "positionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- Backfill: one Employee row per existing User, carrying over the fields being split off
INSERT INTO "Employee" ("id", "userId", "name", "cedula", "phone", "positionId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), "id", "name", "cedula", "phone", "positionId", now(), now()
FROM "User";

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_cedula_key" ON "Employee"("cedula");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Now that the data lives in Employee, drop the columns from User
ALTER TABLE "User" DROP COLUMN "name",
DROP COLUMN "cedula",
DROP COLUMN "phone",
DROP COLUMN "positionId";
