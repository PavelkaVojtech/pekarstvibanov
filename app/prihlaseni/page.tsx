"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FaBreadSlice } from "react-icons/fa"
import { authClient } from "@/lib/auth-client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthenticationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // State pro formuláře
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("") // Pouze pro registraci

  // Funkce pro PŘIHLÁŠENÍ
  const handleSignIn = async () => {
    setIsLoading(true)
    await authClient.signIn.email({
        email,
        password,
    }, {
        onSuccess: () => {
             setIsLoading(false)
             router.push("/")
        },
        onError: (ctx) => {
             setIsLoading(false)
             alert("Chyba přihlášení: " + ctx.error.message)
        }
    })
  }

  // Funkce pro REGISTRACI
  const handleSignUp = async () => {
    setIsLoading(true)
    await authClient.signUp.email({
        email,
        password,
        name,
    }, {
        onSuccess: () => {
             setIsLoading(false)
             router.push("/") 
        },
        onError: (ctx) => {
             setIsLoading(false)
             alert("Chyba registrace: " + ctx.error.message)
        }
    })
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen bg-background transition-colors duration-300">
      
      {/* Levá část - Auth Container */}
      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto w-full max-w-[400px] space-y-6">
          
          {/* Logo */}
          <div className="flex flex-col items-center space-y-2 mb-8">
             <FaBreadSlice className="text-4xl text-primary" />
             <h1 className="text-2xl font-bold font-serif tracking-wider text-foreground">PEKAŘSTVÍ BÁNOV</h1>
          </div>

          {/* TABS KOMPONENTA */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Přihlášení</TabsTrigger>
              <TabsTrigger value="register">Registrace</TabsTrigger>
            </TabsList>

            {/* --- ZÁLOŽKA PŘIHLÁŠENÍ --- */}
            <TabsContent value="login">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                  <CardTitle>Vítejte zpět</CardTitle>
                  <CardDescription>
                    Zadejte své údaje pro přihlášení k účtu.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-0">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input 
                        id="email-login" 
                        type="email" 
                        placeholder="m@priklad.cz" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-login">Heslo</Label>
                    <Input 
                        id="password-login" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSignIn} disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                    {isLoading ? "Pracuji..." : "Přihlásit se"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- ZÁLOŽKA REGISTRACE --- */}
            <TabsContent value="register">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                  <CardTitle>Vytvořit účet</CardTitle>
                  <CardDescription>
                    Zaregistrujte se a získejte přehled o objednávkách.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-0">
                  <div className="space-y-2">
                    <Label htmlFor="name-register">Jméno a příjmení</Label>
                    <Input 
                        id="name-register" 
                        type="text" 
                        placeholder="Jan Novák" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-register">Email</Label>
                    <Input 
                        id="email-register" 
                        type="email" 
                        placeholder="m@priklad.cz" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-register">Heslo</Label>
                    <Input 
                        id="password-register" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSignUp} disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                    {isLoading ? "Vytvářím..." : "Zaregistrovat se"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>

      {/* Pravá část - Obrázek */}
      <div className="hidden bg-muted lg:block relative">
        <Image
          src="/images/HeroSection.webp" 
          alt="Obrázek pekárny"
          fill
          className="object-cover brightness-[0.4] dark:brightness-[0.3] dark:grayscale"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-10 text-white z-10">
            <blockquote className="space-y-2">
                <p className="text-lg font-serif italic drop-shadow-lg">
                &ldquo;Vůně čerstvého chleba je ta nejlepší pozvánka domů.&rdquo;
                </p>
                <footer className="text-sm font-bold text-primary">Pekařství Bánov</footer>
            </blockquote>
        </div>
      </div>

    </div>
  )
}