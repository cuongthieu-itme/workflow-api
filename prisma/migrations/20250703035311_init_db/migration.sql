-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- CreateTable
CREATE TABLE "_users" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isVerifiedAccount" BOOLEAN NOT NULL DEFAULT false,
    "verifiedDate" TIMESTAMP(3),
    "verifiedToken" TEXT,
    "role" "UserRole" NOT NULL,
    "lastLoginDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_user_sessions" (
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "_user_sessions_pkey" PRIMARY KEY ("userId","token")
);

-- CreateTable
CREATE TABLE "_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "_users_email_key" ON "_users"("email");

-- CreateIndex
CREATE INDEX "_users_email_idx" ON "_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_user_sessions_userId_key" ON "_user_sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_user_sessions_token_key" ON "_user_sessions"("token");

-- AddForeignKey
ALTER TABLE "_user_sessions" ADD CONSTRAINT "_user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
