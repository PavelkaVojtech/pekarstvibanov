import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  // --- TOTO PŘIDEJTE ---
  trustedOrigins: [
    "https://pekarstvibanov.vercel.app", // Hlavní produkční doména
    "https://pekarstvibanov-*.vercel.app", // Všechny preview verze (hvězdička je důležitá!)
    // Volitelně i localhost, pokud by zlobil:
    "http://localhost:3000"
  ],
  // ---------------------
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
});