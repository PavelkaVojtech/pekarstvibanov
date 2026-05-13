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
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'

  if (!siteKey || isDev) {
    return (
      <div style={{
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '3px',
        backgroundColor: '#f9f9f9',
        fontSize: '12px',
        cursor: 'pointer'
      }} onClick={() => onChange?.('dev-mock-token')}>
        <input type="checkbox" onChange={(e) => {
          if (e.target.checked) {
            onChange?.('dev-mock-token')
          } else {
            onChange?.(null)
          }
        }} /> I'm not a robot (Dev Mode)
      </div>
    )
  }

  return <ReCAPTCHA ref={ref} sitekey={siteKey} onChange={onChange} />
})
