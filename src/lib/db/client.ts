import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Optimize for serverless environments
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// In production (serverless), we should reuse the client
// In development, we can cache it globally
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
} else {
  // In production, ensure we don't create multiple instances
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma
  }
}
