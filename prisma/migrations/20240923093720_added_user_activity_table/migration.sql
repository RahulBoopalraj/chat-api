-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('ACTIVITY_1', 'ACTIVITY_2', 'ACTIVITY_3', 'ACTIVITY_4', 'ACTIVITY_5', 'ACTIVITY_6', 'ACTIVITY_7', 'ACTIVITY_8');

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "activity" "ActivityType"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);
