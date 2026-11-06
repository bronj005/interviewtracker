-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCount" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "calls" INTEGER NOT NULL DEFAULT 0,
    "round1" INTEGER NOT NULL DEFAULT 0,
    "round2" INTEGER NOT NULL DEFAULT 0,
    "round3" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_name_key" ON "Profile"("name");

-- CreateIndex
CREATE INDEX "DailyCount_date_idx" ON "DailyCount"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCount_profileId_date_key" ON "DailyCount"("profileId", "date");

-- AddForeignKey
ALTER TABLE "DailyCount" ADD CONSTRAINT "DailyCount_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

