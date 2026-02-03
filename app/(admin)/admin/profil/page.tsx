"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/toast"
import { Loader2 } from "lucide-react"

const profileFormSchema = z.object({
  name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  email: z.string().email("Neplatný formát emailu").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  isCompany: z.boolean(),
  companyName: z.string().optional().or(z.literal("")),
  ico: z.string().optional().or(z.literal("")),
  dic: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (data.isCompany) {
    return !!data.companyName && !!data.ico
  }
  return true
}, {
  message: "Vyplňte název firmy a IČO",
  path: ["companyName"],
})

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Zadejte prosím současné heslo"),
  newPassword: z.string().min(8, "Nové heslo musí mít alespoň 8 znaků"),
  confirmPassword: z.string().min(8, "Potvrzení hesla musí mít alespoň 8 znaků"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Hesla se neshodují",
  path: ["confirmPassword"],
})

type ProfileFormValues = z.input<typeof profileFormSchema>
type PasswordFormValues = z.input<typeof passwordFormSchema>

export default function AdminProfilePage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const { toast } = useToast()

  const isEmployee = session?.user?.role === "EMPLOYEE"

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      isCompany: false,
      companyName: "",
      ico: "",
      dic: "",
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  React.useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user) return
      try {
        const profileRes = await fetch("/api/profile")
        if (!profileRes.ok) return
        const userData = await profileRes.json()
        const hasCompanyData = !!(userData.companyName || userData.ico)
        profileForm.reset({
          name: userData.name || "",
          email: userData.email || session.user.email || "",
          phone: userData.phone || "",
          isCompany: isEmployee ? false : hasCompanyData,
          companyName: isEmployee ? "" : (userData.companyName || ""),
          ico: isEmployee ? "" : (userData.ico || ""),
          dic: isEmployee ? "" : (userData.dic || ""),
        })
      } catch (error) {
        console.error("Nepodařilo se načíst profil", error)
      }
    }

    if (!isPending) {
      loadProfile()
    }
  }, [isPending, session, profileForm, isEmployee])

  const onProfileSubmit = async (values: ProfileFormValues) => {
    try {
      const payload: ProfileFormValues = {
        ...values,
        isCompany: isEmployee ? false : values.isCompany,
        companyName: isEmployee ? "" : values.companyName,
        ico: isEmployee ? "" : values.ico,
        dic: isEmployee ? "" : values.dic,
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        const message = (() => {
          if (!data || typeof data !== "object") return "Nepodařilo se uložit profil."
          const record = data as Record<string, unknown>
          return typeof record.error === "string" ? record.error : "Nepodařilo se uložit profil."
        })()
        throw new Error(message)
      }

      toast.success("Uloženo", "Profil byl aktualizován.")
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Chyba při ukládání profilu."
      toast.error("Chyba", message)
    }
  }

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    toast.info("Probíhá změna hesla...", "Prosím čekejte.")

    await authClient.changePassword({
      newPassword: values.newPassword,
      currentPassword: values.currentPassword,
      revokeOtherSessions: true,
    }, {
      onSuccess: () => {
        toast.success("Heslo změněno", "Vaše heslo bylo úspěšně aktualizováno.")
        passwordForm.reset()
      },
      onError: (ctx) => {
        toast.error("Chyba změny hesla", ctx.error.message || "Zkontrolujte své současné heslo.")
      },
    })
  }

  if (isPending) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Musíte být přihlášen.</p>
      </div>
    )
  }

  const showCompanyFields = !isEmployee && profileForm.watch("isCompany")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Můj profil</CardTitle>
          <CardDescription>
            {isEmployee
              ? "Základní osobní údaje pro zaměstnance."
              : "Základní osobní a fakturační údaje."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jméno</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan Novák" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jan@example.cz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="+420 123 456 789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {!isEmployee && (
                <FormField
                  control={profileForm.control}
                  name="isCompany"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 rounded-md border border-border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel>Firemní účet</FormLabel>
                        <p className="text-sm text-muted-foreground">Zobrazí firemní údaje na faktuře.</p>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {!isEmployee && showCompanyFields && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Název firmy</FormLabel>
                        <FormControl>
                          <Input placeholder="Pekařství Bánov s.r.o." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="ico"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IČO</FormLabel>
                        <FormControl>
                          <Input placeholder="12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="dic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DIČ</FormLabel>
                        <FormControl>
                          <Input placeholder="CZ12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <CardFooter className="px-0">
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                  Uložit změny
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Změna hesla</CardTitle>
          <CardDescription>Aktualizujte přihlašovací heslo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Současné heslo</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nové heslo</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Potvrdit heslo</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <CardFooter className="px-0">
                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                  Změnit heslo
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
