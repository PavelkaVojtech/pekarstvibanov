import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { sendEmail } from "./email"; // Přidán import

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  emailAndPassword: {
    enabled: true,
    // Zde jsme přidali funkci pro odeslání emailu při resetu hesla
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Obnova hesla - Pekařství Bánov",
        text: `Pro obnovu hesla klikněte na tento odkaz: ${url}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Obnova hesla</h2>
            <p>Dobrý den,</p>
            <p>obdrželi jsme žádost o obnovu hesla k vašemu účtu.</p>
            <p>Pro nastavení nového hesla klikněte na tlačítko níže:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" style="background-color: #eab308; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Obnovit heslo</a>
            </div>
            <p style="color: #666; font-size: 14px;">Odkaz je platný po omezenou dobu. Pokud jste o obnovu nežádali, tento email ignorujte.</p>
          </div>
        `,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
});