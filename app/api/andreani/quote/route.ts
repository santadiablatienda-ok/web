import { NextResponse } from "next/server"
import { quoteShipping } from "@/lib/andreani"

interface RequestBody {
  codigoPostal?: string
}

export async function POST(req: Request) {
  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body invalido" }, { status: 400 })
  }

  if (!body.codigoPostal?.trim()) {
    return NextResponse.json({ error: "Falta el codigo postal" }, { status: 400 })
  }

  const quote = await quoteShipping()
  return NextResponse.json(quote)
}
