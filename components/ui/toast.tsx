"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

type Toast = {
  id: string
  title?: string
  description?: string
  type?: "default" | "success" | "error"
}

type ToastContextValue = {
  push: (t: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts((s) => [...s, { ...toast, id }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((s) => s.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((t) =>
      setTimeout(() => remove(t.id), 4000)
    )
    return () => timers.forEach((t) => clearTimeout(t))
  }, [toasts, remove])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}

      <div aria-live="polite" className="fixed right-4 bottom-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-sm w-full px-4 py-3 rounded-md shadow-md text-sm text-white flex items-start justify-between gap-3 ${t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-slate-800'}`}>
            <div>
              {t.title && <div className="font-medium">{t.title}</div>}
              {t.description && <div className="text-xs opacity-90">{t.description}</div>}
            </div>
            <button className="opacity-90 hover:opacity-100 ml-2" onClick={() => remove(t.id)} aria-label="close">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")

  return {
    toast: {
      success: (title: string, description?: string) => ctx.push({ title, description, type: "success" }),
      error: (title: string, description?: string) => ctx.push({ title, description, type: "error" }),
      info: (title: string, description?: string) => ctx.push({ title, description, type: "default" }),
    },
    push: ctx.push,
  }
}

export default ToastProvider
