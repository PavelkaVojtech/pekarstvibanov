import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ico: string }> }
) {
  const { ico } = await params

  if (!ico || ico.length !== 8) {
    return NextResponse.json({ error: "Neplatné IČO" }, { status: 400 })
  }

  try {
    const res = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`, {
      headers: { "Accept": "application/json" }
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Subjekt nebyl v registru ARES nalezen" }, { status: 404 })
    }

    const data = await res.json()

    return NextResponse.json({
      companyName: data.obchodniJmeno,
      dic: data.dic,
      address: {
        street: data.sidlo.nazevUlice 
          ? `${data.sidlo.nazevUlice} ${data.sidlo.cisloDomovni}${data.sidlo.cisloOrientacni ? "/" + data.sidlo.cisloOrientacni : ""}`
          : data.sidlo.textovaAdresa,
        city: data.sidlo.nazevObce,
        zipCode: String(data.sidlo.psc)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: "Chyba při komunikaci s ARES" }, { status: 500 })
  }
}