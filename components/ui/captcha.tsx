"use client"

import * as React from "react"
import ReCAPTCHA from "react-google-recaptcha"

type CaptchaProps = {
  onChange?: (token: string | null) => void
}

export const Captcha = React.forwardRef<ReCAPTCHA, CaptchaProps>(function Captcha(
  { onChange },
  ref
) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""

  return <ReCAPTCHA ref={ref} sitekey={siteKey} onChange={onChange} />
})
