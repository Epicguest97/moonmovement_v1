
-- CreateTable
CREATE TABLE "SubredditBan" (
    "id" SERIAL NOT NULL,
    "subreddit" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "reason" TEXT,
    "duration" TEXT,
    "bannedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SubredditBan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubredditBan_subreddit_userId_key" ON "SubredditBan"("subreddit", "userId");

-- AddForeignKey
ALTER TABLE "SubredditBan" ADD CONSTRAINT "SubredditBan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubredditBan" ADD CONSTRAINT "SubredditBan_bannedBy_fkey" FOREIGN KEY ("bannedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
