# Prisma Setup Script

# This script will set up Prisma properly when you're ready to use a real database
# For now, we're using in-memory storage

# 1. Install Prisma packages
npm install prisma @prisma/client

# 2. Generate Prisma client
npx prisma generate

# 3. Push database schema
npx prisma db push

# 4. (Optional) Open Prisma Studio to view data
npx prisma studio

# To switch back to real Prisma database:
# 1. Run this script
# 2. Replace the content of src/lib/db.ts with the original Prisma code
# 3. Restart the development server
