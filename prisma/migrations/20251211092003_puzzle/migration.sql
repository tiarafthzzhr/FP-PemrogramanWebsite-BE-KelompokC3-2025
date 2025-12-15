/*
  Warnings:

  - You are about to drop the `PuzzleGame` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PuzzleGame";

-- CreateTable
CREATE TABLE "Puzzle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "thumbnail" TEXT,
    "rows" INTEGER NOT NULL,
    "cols" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Puzzle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuzzleSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "durationSec" INTEGER,
    "moveCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "PuzzleSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PuzzleSession_userId_puzzleId_finishedAt_key" ON "PuzzleSession"("userId", "puzzleId", "finishedAt");

-- AddForeignKey
ALTER TABLE "PuzzleSession" ADD CONSTRAINT "PuzzleSession_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
