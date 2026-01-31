import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, text, html, replyTo }: EmailPayload) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`To: ${to} | Subject: ${subject}`);
    return { success: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'Pekařství Bánov <objednavky@pekarstvibanov.cz>', 
      to: to, 
      subject: subject,
      text: text,
      html: html || text,
      replyTo: replyTo,
    });

    if (data.error) {
      console.error("Chyba Resend API:", data.error);
      return { success: false, error: data.error };
    }

    console.log(`Email odeslán ID: ${data.data?.id}`);
    return { success: true, data };
  } catch (error) {
    console.error("Neočekávaná chyba při odesílání:", error);
    return { success: false, error };
  }
}