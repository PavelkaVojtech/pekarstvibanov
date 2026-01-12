import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Neautorizovaný přístup" }, { status: 401 });
    }

    // Načteme uživatele z DB včetně custom políček
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            email: true,
            phone: true,
            companyName: true,
            ico: true,
            dic: true
        }
    });

    if (!user) {
        return NextResponse.json({ error: "Uživatel nenalezen" }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error("Chyba při načítání profilu:", error);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}

const profileSchema = z.object({
  name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  email: z.string().email("Neplatný formát emailu").optional(),
  phone: z.string().optional().or(z.literal("").or(z.null())),
  isCompany: z.boolean(),
  companyName: z.string().optional().or(z.literal("").or(z.null())),
  ico: z.string().optional().or(z.literal("").or(z.null())),
  dic: z.string().optional().or(z.literal("").or(z.null())),
}).refine((data) => {
  if (data.isCompany) {
    return !!data.companyName && !!data.ico;
  }
  return true;
}, {
  message: "Pro firemní účet je nutné vyplnit Název firmy a IČO",
  path: ["companyName"],
});

export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Neautorizovaný přístup" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = profileSchema.safeParse(body);

    if (!parseResult.success) {
        return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }

    const { name, email, phone, isCompany, companyName, ico, dic } = parseResult.data;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email: email || undefined,
        phone,
        companyName: isCompany ? companyName : null,
        ico: isCompany ? ico : null,
        dic: isCompany ? dic : null,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Chyba při aktualizaci profilu:", error);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}