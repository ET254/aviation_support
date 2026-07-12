import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']
    : ['error'],
});

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  // Type assertion to bypass TypeScript's strict type checking
  (prisma as any).$on('query', (e: { query: string; params: string; duration: number }) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Params: ${e.params}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;