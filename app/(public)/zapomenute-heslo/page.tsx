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
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email({
    message: "Zadejte platnou emailovou adresu.",
  }),
})

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)
    
    // ZMĚNA: Použití requestPasswordReset místo forgetPassword
    const { error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: "/obnovit-heslo", 
    })

    if (error) {
        setError(error.message || "Něco se nepovedlo. Zkuste to prosím znovu.")
        setIsSubmitting(false)
    } else {
        setSuccess(true)
        setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-20 px-4">
      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Zapomenuté heslo</CardTitle>
          <CardDescription className="text-center">
            Zadejte svůj email a my vám pošleme instrukce pro obnovu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="p-4 bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg border border-green-500/20 text-sm">
                <p className="font-medium">Zkontrolujte svou schránku!</p>
                Email s instrukcemi byl odeslán na <strong>{form.getValues("email")}</strong>.
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/prihlaseni">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Zpět na přihlášení
                </Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 text-red-600 rounded-md border border-red-500/20 text-sm text-center">
                    {error}
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Váš e-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="vas@email.cz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Odesílám...
                    </>
                  ) : (
                    "Odeslat instrukce"
                  )}
                </Button>
                
                <div className="text-center mt-4">
                  <Link href="/prihlaseni" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center">
                    <ArrowLeft className="mr-1 h-3 w-3" /> Zpět na přihlášení
                  </Link>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}