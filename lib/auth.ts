import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  // TOTO JE TA KLÍČOVÁ ČÁST
  user: {
    additionalFields: {
      role: {
        type: "string",       // Better Auth bude s rolí pracovat jako s řetězcem
        required: false,
        defaultValue: "USER",
        input: false,         // Zabráníme uživateli, aby si roli poslal při registraci přes API
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key",
});