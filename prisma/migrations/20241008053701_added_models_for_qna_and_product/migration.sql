-- CreateTable
CREATE TABLE "QnA" (
    "id" TEXT NOT NULL,
    "question" JSONB NOT NULL,
    "answer" JSONB NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "related_questions" TEXT[],
    "explanation" TEXT,

    CONSTRAINT "QnA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
