interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text }: EmailPayload) {
  
  console.log(`📨 [MOCK EMAIL] To: ${to} | Subject: ${subject}`);
  console.log(`Content: ${text}`);
  
  return { success: true };
}