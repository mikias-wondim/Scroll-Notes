-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
