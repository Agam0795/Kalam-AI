// Backward compatibility shim for older imports '@/lib/db'
// Re-export prisma from the current in-memory / database implementation
import { prisma } from './database/db';
export { prisma };
export default prisma;