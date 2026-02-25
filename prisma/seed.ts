import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL not set");

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.expense.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const password = await bcrypt.hash("password123", 12);

  const user = await prisma.user.create({
    data: {
      name: "Mario Rossi",
      email: "mario@test.com",
      password,
      plan: "FREE",
    },
  });
  console.log(`Created user: ${user.email} (password: password123)`);

  // Create properties
  const casa = await prisma.property.create({
    data: {
      userId: user.id,
      name: "Casa Milano",
      address: "Via Roma 42, 20121 Milano",
      type: "OWNED",
      notes: "Appartamento principale",
    },
  });

  const affitto = await prisma.property.create({
    data: {
      userId: user.id,
      name: "Bilocale Torino",
      address: "Corso Francia 15, 10138 Torino",
      type: "RENTED",
      notes: "In affitto da settembre 2024",
    },
  });

  console.log(`Created properties: ${casa.name}, ${affitto.name}`);

  // Create expenses for Casa Milano
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);

  await prisma.expense.createMany({
    data: [
      {
        propertyId: casa.id,
        category: "CONDOMINIUM",
        description: "Spese condominiali Q1",
        amount: 450,
        issuedAt: lastMonth,
        dueDate: thisMonth,
        isPaid: true,
        paidAt: new Date(now.getFullYear(), now.getMonth() - 1, 20),
        isRecurring: true,
        frequency: "QUARTERLY",
      },
      {
        propertyId: casa.id,
        category: "UTILITIES",
        description: "Bolletta gas",
        amount: 87.5,
        issuedAt: thisMonth,
        dueDate: nextMonth,
        isPaid: false,
        isRecurring: true,
        frequency: "MONTHLY",
      },
      {
        propertyId: casa.id,
        category: "UTILITIES",
        description: "Bolletta luce",
        amount: 62.3,
        issuedAt: thisMonth,
        dueDate: nextMonth,
        isPaid: false,
        isRecurring: true,
        frequency: "MONTHLY",
      },
      {
        propertyId: casa.id,
        category: "TAX",
        description: "IMU 2025",
        amount: 1200,
        issuedAt: new Date(2025, 5, 1),
        dueDate: new Date(2025, 5, 16),
        isPaid: true,
        paidAt: new Date(2025, 5, 14),
        isRecurring: true,
        frequency: "YEARLY",
      },
      {
        propertyId: casa.id,
        category: "MAINTENANCE",
        description: "Riparazione caldaia",
        amount: 320,
        issuedAt: lastMonth,
        isPaid: true,
        paidAt: lastMonth,
        isRecurring: false,
        frequency: "NONE",
        notes: "Sostituzione valvola",
      },
      {
        propertyId: casa.id,
        category: "INSURANCE",
        description: "Polizza casa",
        amount: 380,
        issuedAt: new Date(2025, 0, 10),
        dueDate: new Date(2025, 0, 31),
        isPaid: true,
        paidAt: new Date(2025, 0, 25),
        isRecurring: true,
        frequency: "YEARLY",
      },
    ],
  });

  // Create expenses for Bilocale Torino
  await prisma.expense.createMany({
    data: [
      {
        propertyId: affitto.id,
        category: "RENT",
        description: "Affitto mensile",
        amount: 750,
        issuedAt: thisMonth,
        dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
        isPaid: true,
        paidAt: new Date(now.getFullYear(), now.getMonth(), 3),
        isRecurring: true,
        frequency: "MONTHLY",
      },
      {
        propertyId: affitto.id,
        category: "UTILITIES",
        description: "Bolletta acqua",
        amount: 45,
        issuedAt: lastMonth,
        dueDate: thisMonth,
        isPaid: false,
        isRecurring: true,
        frequency: "QUARTERLY",
      },
      {
        propertyId: affitto.id,
        category: "UTILITIES",
        description: "Internet fibra",
        amount: 29.9,
        issuedAt: thisMonth,
        dueDate: nextMonth,
        isPaid: false,
        isRecurring: true,
        frequency: "MONTHLY",
      },
    ],
  });

  const expenseCount = await prisma.expense.count();
  console.log(`Created ${expenseCount} expenses`);

  // Create a second user (PRO)
  const user2 = await prisma.user.create({
    data: {
      name: "Laura Bianchi",
      email: "laura@test.com",
      password: await bcrypt.hash("password123", 12),
      plan: "PRO",
    },
  });
  console.log(`Created user: ${user2.email} (password: password123)`);

  const villa = await prisma.property.create({
    data: {
      userId: user2.id,
      name: "Villa Lago di Como",
      address: "Via Lungolago 8, 22100 Como",
      type: "OWNED",
    },
  });

  await prisma.expense.createMany({
    data: [
      {
        propertyId: villa.id,
        category: "MORTGAGE",
        description: "Rata mutuo",
        amount: 1350,
        issuedAt: thisMonth,
        dueDate: new Date(now.getFullYear(), now.getMonth(), 28),
        isPaid: false,
        isRecurring: true,
        frequency: "MONTHLY",
      },
      {
        propertyId: villa.id,
        category: "MAINTENANCE",
        description: "Giardiniere",
        amount: 200,
        issuedAt: thisMonth,
        isPaid: true,
        paidAt: thisMonth,
        isRecurring: true,
        frequency: "MONTHLY",
      },
    ],
  });

  console.log(`Created property: ${villa.name} with 2 expenses`);
  console.log("\nSeed complete!");
  console.log("\n--- Test credentials ---");
  console.log("User FREE: mario@test.com / password123");
  console.log("User PRO:  laura@test.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
