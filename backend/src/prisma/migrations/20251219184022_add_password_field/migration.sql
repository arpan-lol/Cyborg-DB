-- AlterTable
ALTER TABLE "ChatSession" ADD COLUMN     "vectorIndexKey" BYTEA;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT,
ALTER COLUMN "googleId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ChunkData" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "vectorId" TEXT NOT NULL,
    "pageNumber" INTEGER,
    "startChar" INTEGER,
    "endChar" INTEGER,
    "storedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChunkData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChunkData_vectorId_key" ON "ChunkData"("vectorId");

-- CreateIndex
CREATE INDEX "ChunkData_vectorId_idx" ON "ChunkData"("vectorId");

-- CreateIndex
CREATE INDEX "ChunkData_attachmentId_idx" ON "ChunkData"("attachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ChunkData_attachmentId_chunkIndex_key" ON "ChunkData"("attachmentId", "chunkIndex");

-- AddForeignKey
ALTER TABLE "ChunkData" ADD CONSTRAINT "ChunkData_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
