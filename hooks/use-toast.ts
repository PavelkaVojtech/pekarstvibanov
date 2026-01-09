"use client"

import { useToast as useInternalToast } from "@/components/ui/toast"

type ToastVariant = "default" | "destructive" | "success"

export type ToastOptions = {
  title?: string
  description?: string
  variant?: ToastVariant
  [key: string]: unknown
}

export function useToast() {
  const internal = useInternalToast()

  const toast = ({ title, description, variant }: ToastOptions) => {
    if (variant === "destructive") {
      internal.toast.error(title ?? "Chyba", description)
      return
    }

    if (variant === "success") {
      internal.toast.success(title ?? "", description)
      return
    }

    internal.toast.info(title ?? "", description)
  }

  return { toast }
}
