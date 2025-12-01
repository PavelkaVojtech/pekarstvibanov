import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validace vstupu
const addressSchema = z.object({
  street: z.string().min(2, "Ulice je příliš krátká"),
  city: z.string().min(2, "Město je příliš krátké"),
  zipCode: z.string()
    .regex(/^\d{3}\s?\d{2}$/, "PSČ musí být ve formátu 12345 nebo 123 45")
    .transform((val) => val.replace(/\s+/g, "")),
});

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { id: 'desc' }
  });

  return NextResponse.json(addresses);
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });

    const body = await req.json();
    
    const parseResult = addressSchema.safeParse(body);
    if (!parseResult.success) {
      // OPRAVA ZOD ERRORU: Použijeme .issues
      return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }

    const { street, city, zipCode } = parseResult.data;

    const newAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        street,
        city,
        zipCode,
        country: "Česká republika"
      }
    });

    return NextResponse.json(newAddress);
  } catch (error) {
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if(!id) return NextResponse.json({ error: "Chybí ID" }, { status: 400 });

    const result = await prisma.address.deleteMany({
        where: {
            id: id,
            userId: session.user.id 
        }
    });

    if (result.count === 0) {
       return NextResponse.json({ error: "Adresa nenalezena nebo nemáte oprávnění" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "Chybí ID" }, { status: 400 });

    const body = await req.json();
    const parseResult = addressSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }

    const { street, city, zipCode } = parseResult.data;

    const result = await prisma.address.updateMany({
      where: { id: id, userId: session.user.id },
      data: { street, city, zipCode }
    });

    if (result.count === 0) {
        return NextResponse.json({ error: "Adresa nenalezena" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}