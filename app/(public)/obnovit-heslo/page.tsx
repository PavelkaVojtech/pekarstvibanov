"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
// ZMĚNA: Správný import z hooks
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  password: z.string().min(8, {
    message: "Heslo musí mít alespoň 8 znaků.",
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hesla se neshodují.",
  path: ["confirmPassword"],
})

export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  // ZMĚNA: Správná inicializace
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)
    
    const { error } = await authClient.resetPassword({
        newPassword: values.password,
    })

    if (error) {
        setError(error.message || "Odkaz je neplatný nebo vypršel.")
        setIsSubmitting(false)
    } else {
        // ZMĚNA: Správné volání toast funkce
        toast({
            title: "Heslo změněno",
            description: "Vaše heslo bylo úspěšně obnoveno.",
            variant: "success", 
        })
        router.push("/prihlaseni")
    }
  }

  return (
    <div className="container max-w-md mx-auto py-20 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Nové heslo</CardTitle>
          <CardDescription className="text-center">
            Zadejte prosím vaše nové heslo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 text-red-600 rounded-md border border-red-500/20 text-sm text-center">
                  {error}
                </div>
              )}
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nové heslo</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potvrzení hesla</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Změnit heslo"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}