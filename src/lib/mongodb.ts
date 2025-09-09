// Shim re-export to maintain backwards compatibility with older import path '@/lib/mongodb'
// The actual implementation lives in '@/lib/database/mongodb'.
export { default } from './database/mongodb';