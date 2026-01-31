"use client"

import { useState } from "react"
import { FaBreadSlice, FaGoogle, FaSpinner } from "react-icons/fa"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function AuthenticationPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")

  const [signUpName, setSignUpName] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/"
    }, {
      onSuccess: () => {
        setIsLoading(false)
        toast({
            title: "Vítejte!",
            description: "Přihlášení přes Google proběhlo úspěšně.",
            variant: "success"
        })
      },
      onError: (ctx) => {
        setIsLoading(false)
        toast({
            title: "Chyba přihlášení",
            description: ctx.error.message || "Nepodařilo se spojit s Googlem.",
            variant: "destructive"
        })
      }
    })
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await authClient.signIn.email({
      email: signInEmail,
      password: signInPassword,
    }, {
      onSuccess: (ctx) => {
        setIsLoading(false)
        toast({
            title: "Vítejte zpět!",
            description: "Přihlášení proběhlo úspěšně.",
            variant: "success"
        })

        const role = (ctx.data.user as { role?: string } | null | undefined)?.role
        window.location.assign(role === "ADMIN" ? "/admin" : "/")
      },
      onError: (ctx) => {
        setIsLoading(false)
        toast({
            title: "Chyba přihlášení",
            description: ctx.error.message || "Zkontrolujte email a heslo.",
            variant: "destructive"
        })
      }
    })
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (signUpPassword !== signUpConfirmPassword) {
      toast({
          title: "Hesla se neshodují",
          description: "Zadejte prosím hesla znovu a ujistěte se, že jsou stejná.",
          variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    await authClient.signUp.email({
      email: signUpEmail,
      password: signUpPassword,
      name: signUpName,
    }, {
      onSuccess: () => {
        setIsLoading(false)
        toast({
            title: "Účet vytvořen",
            description: "Vítejte v naší pekárně!",
            variant: "success"
        })
        window.location.assign("/")
      },
      onError: (ctx) => {
        setIsLoading(false)
        toast({
            title: "Registrace se nezdařila",
            description: ctx.error.message,
            variant: "destructive"
        })
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-[450px] shadow-lg">
        <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
                <div className="p-3 bg-primary/10 rounded-full">
                    <FaBreadSlice className="text-3xl text-primary" />
                </div>
            </div>
            <CardTitle className="text-2xl font-serif">PEKAŘSTVÍ BÁNOV</CardTitle>
            <CardDescription>
                Přihlaste se nebo si vytvořte nový účet
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Přihlášení</TabsTrigger>
              <TabsTrigger value="register">Registrace</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input
                    id="email-login"
                    type="email"
                    placeholder="vas@email.cz"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-login">Heslo</Label>
                    <Link 
                        href="/zapomenute-heslo" 
                        className="text-xs text-primary hover:underline font-medium"
                    >
                      Zapomenuté heslo?
                    </Link>
                  </div>
                  <Input
                    id="password-login"
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full font-bold">
                  {isLoading && <FaSpinner className="mr-2 h-4 w-4 animate-spin" />}
                  Přihlásit se
                </Button>
                
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 border-t" />
                  <div className="text-xs uppercase text-muted-foreground">
                    nebo
                  </div>
                  <div className="flex-1 border-t" />
                </div>

                <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                >
                    <FaGoogle className="mr-2 h-4 w-4" />
                    Pokračovat přes Google
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-register">Celé jméno</Label>
                  <Input
                    id="name-register"
                    type="text"
                    placeholder="Jan Novák"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-register">Email</Label>
                  <Input
                    id="email-register"
                    type="email"
                    placeholder="novak@seznam.cz"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register">Heslo</Label>
                  <Input
                    id="password-register"
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Potvrzení hesla</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    className={signUpConfirmPassword && signUpPassword !== signUpConfirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full font-bold">
                  {isLoading && <FaSpinner className="mr-2 h-4 w-4 animate-spin" />}
                  Zaregistrovat se
                </Button>

                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 border-t" />
                  <div className="text-xs uppercase text-muted-foreground">
                    nebo
                  </div>
                  <div className="flex-1 border-t" />
                </div>

                <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                >
                    <FaGoogle className="mr-2 h-4 w-4" />
                    Pokračovat přes Google
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Pekařství Bánov. Všechna práva vyhrazena.
        </CardFooter>
      </Card>
    </div>
  )
}