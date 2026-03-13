import { auth } from "@/lib/auth";
import { verifyCaptcha } from "@/lib/captcha";
import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { z } from "zod";

const handler = toNextJsHandler(auth);

const captchaBodySchema = z.object({
	captchaToken: z.string().min(1),
}).passthrough();

const CAPTCHA_PROTECTED_PATHS = new Set([
	"/api/auth/sign-in/email",
	"/api/auth/sign-up/email",
	"/api/auth/request-password-reset",
	"/api/auth/reset-password",
]);

export const GET = handler.GET;

export async function POST(request: Request) {
	const pathname = new URL(request.url).pathname.replace(/\/$/, "");

	if (!CAPTCHA_PROTECTED_PATHS.has(pathname)) {
		return handler.POST(request);
	}

	let requestBody: unknown;
	try {
		requestBody = await request.json();
	} catch {
		return NextResponse.json({ error: "Neplatná data" }, { status: 400 });
	}

	const parsedBody = captchaBodySchema.safeParse(requestBody);
	if (!parsedBody.success) {
		return NextResponse.json({ error: "Chybí CAPTCHA token" }, { status: 400 });
	}

	const { captchaToken, ...payload } = parsedBody.data;
	const isCaptchaValid = await verifyCaptcha(captchaToken);

	if (!isCaptchaValid) {
		return NextResponse.json(
			{ error: "Ověření CAPTCHA selhalo. Jste robot?" },
			{ status: 400 }
		);
	}

	const forwardedHeaders = new Headers(request.headers);
	forwardedHeaders.set("content-type", "application/json");

	const forwardedRequest = new Request(request.url, {
		method: "POST",
		headers: forwardedHeaders,
		body: JSON.stringify(payload),
	});

	return handler.POST(forwardedRequest);
}