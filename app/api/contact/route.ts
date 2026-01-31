import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = contactSchema.parse(body);

    const result = await sendEmail({
      to: 'info@pekarstvibanov.cz',
      replyTo: email,
      subject: `Nový dotaz z webu: ${name}`,
      text: `Jméno: ${name}\nEmail: ${email}\n\nZpráva:\n${message}`,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Chyba při odesílání emailu' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chyba API:', error);
    return NextResponse.json(
      { error: 'Neplatná data' }, 
      { status: 400 }
    );
  }
}