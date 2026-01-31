"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Send } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Jméno musí mít alespoň 2 znaky.",
  }),
  email: z.string().email({
    message: "Zadejte platnou emailovou adresu.",
  }),
  message: z.string().min(1, {
    message: "Zpráva musí mít alespoň 1 znak.",
  }),
})

export function ContactForm() {
  const { data: session } = authClient.useSession()
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  React.useEffect(() => {
    if (session?.user) {
      const currentName = form.getValues("name")
      const currentEmail = form.getValues("email")

      if (!currentName && session.user.name) {
        form.setValue("name", session.user.name)
      }
      if (!currentEmail && session.user.email) {
        form.setValue("email", session.user.email)
      }
    }
  }, [session, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setSuccess(false)
    setError(null)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Odeslání se nezdařilo')
      }

      setSuccess(true)
      form.reset()
      
      if (session?.user) {
        form.setValue("name", session.user.name)
        form.setValue("email", session.user.email)
      }
    } catch (err) {
      console.error(err)
      setError("Něco se pokazilo. Zkuste to prosím později.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl bg-card border border-border p-6 md:p-8 shadow-xl">
      <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Napište nám</h2>
      
      {success && (
        <div className="mb-4 p-4 bg-green-500/20 text-green-700 dark:text-green-400 rounded-lg border border-green-500/30">
          Děkujeme! Váš dotaz byl úspěšně odeslán.
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg border border-red-500/30">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jméno</FormLabel>
                <FormControl>
                  <Input placeholder="Jan Novák" {...field} className="bg-background border-input text-foreground" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="vas@email.cz" {...field} className="bg-background border-input text-foreground" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Váš dotaz</FormLabel>
                <FormControl>
                  <Textarea 
                    rows={5} 
                    placeholder="Na co se chcete zeptat?" 
                    className="bg-background border-input text-foreground resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold" disabled={isSubmitting}>
            {isSubmitting ? (
              <>Odesílám...</>
            ) : (
              <>
                Odeslat dotaz <Send className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}