// config/db.js — Prisma client singleton
// We create one instance and reuse it everywhere
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

module.exports = prisma
