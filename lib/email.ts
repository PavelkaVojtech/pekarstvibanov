import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const DEFAULT_FROM = 'Pekarstvi Banov <objednavky@pekarstvibanov.cz>';

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, text, html, replyTo }: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM;

  if (!apiKey) {
    console.error('Email neni odeslan: chybi RESEND_API_KEY v prostredi.');
    return { success: false, error: 'RESEND_API_KEY is missing' };
  }

  try {
    const data = await resend.emails.send({
      from,
      to: to, 
      subject: subject,
      text: text,
      html: html || text,
      replyTo: replyTo,
    });

    if (data.error) {
      console.error('Chyba Resend API (SDK):', data.error);

      if (data.error.name === 'application_error') {
        try {
          const fallbackResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from,
              to,
              subject,
              text,
              html: html || text,
              reply_to: replyTo,
            }),
            cache: 'no-store',
          });

          const fallbackPayload = await fallbackResponse.json();

          if (!fallbackResponse.ok) {
            console.error('Chyba Resend API (REST fallback):', fallbackPayload);
            return { success: false, error: fallbackPayload };
          }

          return { success: true, data: fallbackPayload };
        } catch (fallbackError) {
          console.error('Resend fallback selhal. Zkontrolujte DNS/firewall/egress na Vercelu.', fallbackError);
        }
      }

      return { success: false, error: data.error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Neočekávaná chyba při odesílání:", error);
    return { success: false, error };
  }
}