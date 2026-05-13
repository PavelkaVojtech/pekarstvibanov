export async function verifyCaptcha(token: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'development' && token === 'dev-mock-token') {
    return true
  }

  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY
  if (!recaptchaSecret || !token) {
    return false
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: recaptchaSecret,
        response: token,
      }),
    })

    if (!response.ok) {
      return false
    }

    const data = (await response.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}
