-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('WEBSITE_VISITED', 'USER_LOGGED_IN', 'USER_LOGGED_OUT', 'ITEM_ADDED_TO_CART', 'ITEM_REMOVED_FROM_CART', 'ITEM_PURCHASED');

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "additional_message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
