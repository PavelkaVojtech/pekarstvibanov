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

type EmailResult = 
  | { success: true; data: any }
  | { success: false; error: unknown };

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 500
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

export async function sendEmail({ to, subject, text, html, replyTo }: EmailPayload): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM;
  const debug = process.env.EMAIL_DEBUG === '1'
  const maxRetries = process.env.EMAIL_RETRY_COUNT ? parseInt(process.env.EMAIL_RETRY_COUNT) : 3;

  if (debug) {
    console.log('[email.debug] attempting to send email', { to, subject, from, hasApiKey: Boolean(apiKey), replyTo, maxRetries });
  }

  if (!apiKey) {
    console.error('Email neni odeslan: chybi RESEND_API_KEY v prostredi.');
    return { success: false, error: 'RESEND_API_KEY is missing' } as EmailResult;
  }

  try {
    const data = await retryWithBackoff(async () => {
      const payload = {
        from,
        to: to,
        subject: subject,
        text: text,
        html: html || text,
        replyTo: replyTo,
      }

      if (debug) {
        try {
          console.log('[email.debug] payload', { to: payload.to, subject: payload.subject, from: payload.from, hasHtml: Boolean(payload.html) });
        } catch {}
      }

      const sdkData = await resend.emails.send({
        from,
        to: to, 
        subject: subject,
        text: text,
        html: html || text,
        replyTo: replyTo,
      });

      if (debug) console.log('[email.debug] resend SDK response', { ok: Boolean((sdkData as any)?.id), data: (sdkData as any)?.error ? { error: (sdkData as any).error } : undefined });

      if (sdkData.error) {
        console.error('Chyba Resend API (SDK):', sdkData.error);

        if (sdkData.error.name === 'application_error') {
          try {
            if (debug) console.log('[email.debug] attempting REST fallback to Resend');
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
              throw new Error(`REST fallback failed: ${JSON.stringify(fallbackPayload)}`);
            }

            if (debug) console.log('[email.debug] resend REST fallback success', fallbackPayload);
            return fallbackPayload;
          } catch (fallbackError) {
            console.error('Resend fallback selhal. Zkontrolujte DNS/firewall/egress na Vercelu.', fallbackError);
            throw fallbackError;
          }
        }

        throw new Error(`Resend API error: ${JSON.stringify(sdkData.error)}`);
      }

      if (debug) console.log('[email.debug] resend SDK success', sdkData);
      return sdkData;
    }, maxRetries, 500);

    return { success: true, data } as EmailResult;
  } catch (error) {
    console.error("Neočekávaná chyba při odesílání (po retrech):", error);
    return { success: false, error } as EmailResult;
  }
}