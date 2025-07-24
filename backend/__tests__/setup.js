const { PrismaClient } = require('@prisma/client')

let prisma

beforeAll(async () => {
 prisma = new PrismaClient();
})

afterAll(async () => {
 if (prisma) {
   await prisma.$disconnect();
 }
})

module.exports = { prisma }
