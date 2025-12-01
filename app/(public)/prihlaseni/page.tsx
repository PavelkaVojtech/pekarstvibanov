"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaBreadSlice, FaSignInAlt, FaUserPlus } from "react-icons/fa"
import { authClient } from "@/lib/auth-client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Card, ... } nejsou potřeba, používáš divy stylované jako karty, což je OK
import { useToast } from "@/components/ui/toast" // <--- 1. Import toastu

export default function AuthenticationPage() {
  const router = useRouter()
  const { toast } = useToast() // <--- 2. Inicializace toastu
  const [isLoading, setIsLoading] = useState(false)

  // --- STATE PRO PŘIHLÁŠENÍ ---
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")

  // --- STATE PRO REGISTRACI ---
  const [signUpName, setSignUpName] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("")

  // Funkce pro PŘIHLÁŠENÍ
  const handleSignIn = async () => {
    setIsLoading(true)
    await authClient.signIn.email({
        email: signInEmail,
        password: signInPassword,
    }, {
        onSuccess: (ctx) => {
             setIsLoading(false)
             toast.success("Vítejte zpět!", "Přihlášení proběhlo úspěšně.")
             
             // --- NOVÁ LOGIKA PŘESMĚROVÁNÍ ---
             // Díky našemu nastavení už TypeScript ví o 'role', 
             // ale pro jistotu to můžeme přetypovat, kdyby editor zlobil.
             const role = (ctx.data.user as any).role;

             if (role === "ADMIN") {
                 router.push("/admin") // Admin jde do administrace
             } else {
                 router.push("/")      // Zákazník jde na domovskou stránku
             }
             
             router.refresh() // Obnovíme data, aby se načetla nová session v layoutu
        },
        onError: (ctx) => {
             setIsLoading(false)
             toast.error("Chyba přihlášení", ctx.error.message || "Zkontrolujte email a heslo.")
        }
    })
  }

  // Funkce pro REGISTRACI
  const handleSignUp = async () => {
    // 1. Validace shody hesel
    if (signUpPassword !== signUpConfirmPassword) {
        // <--- 3. Nahrazení alertu toastem
        toast.error("Hesla se neshodují", "Zadejte prosím hesla znovu a ujistěte se, že jsou stejná.")
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
             toast.success("Účet vytvořen", "Vítejte v naší pekárně!")
             router.push("/") 
        },
        onError: (ctx) => {
             setIsLoading(false)
             // <--- 3. Nahrazení alertu toastem
             toast.error("Registrace se nezdařila", ctx.error.message)
        }
    })
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col">
      
      {/* Volitelné: Malá hlavička */}
      <div className="py-6 flex justify-center items-center gap-2">
         <FaBreadSlice className="text-3xl text-primary" />
         <span className="text-xl font-bold font-serif tracking-wider">PEKAŘSTVÍ BÁNOV</span>
      </div>

      <div className="flex-1 container mx-auto px-4 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl my-8">
          
          {/* --- LEVÁ PŮLKA: PŘIHLÁŠENÍ --- */}
          <div className="flex flex-col justify-center p-6 lg:p-10 rounded-2xl bg-card border border-border shadow-sm">
            <div className="mx-auto w-full max-w-sm space-y-6">
                <div className="flex flex-col space-y-2 text-center">
                  <div className="mx-auto p-3 bg-primary/10 rounded-full mb-2">
                    <FaSignInAlt className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Přihlášení</h2>
                  <p className="text-muted-foreground">
                    Vítejte zpět! Zadejte své údaje.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input 
                        id="email-login" 
                        type="email" 
                        placeholder="vas@email.cz" 
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password-login">Heslo</Label>
                        <a href="#" className="text-xs text-primary hover:underline font-medium">Zapomenuté heslo?</a>
                    </div>
                    <Input 
                        id="password-login" 
                        type="password" 
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="bg-background"
                    />
                  </div>
                  <Button onClick={handleSignIn} disabled={isLoading} className="w-full font-bold h-11">
                    {isLoading ? "Ověřuji..." : "Přihlásit se"}
                  </Button>
                </div>
            </div>
          </div>

          {/* Oddělovač pro mobil */}
          <div className="lg:hidden relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Nebo
              </span>
            </div>
          </div>

          {/* --- PRAVÁ PŮLKA: REGISTRACE --- */}
          <div className="flex flex-col justify-center p-6 lg:p-10 rounded-2xl bg-muted/30 border border-border border-dashed">
            <div className="mx-auto w-full max-w-sm space-y-6">
                <div className="flex flex-col space-y-2 text-center">
                  <div className="mx-auto p-3 bg-muted rounded-full mb-2">
                    <FaUserPlus className="h-6 w-6 text-foreground/70" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Nová registrace</h2>
                  <p className="text-muted-foreground">
                    Ještě u nás nemáte účet? Zaregistrujte se.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name-register">Celé jméno</Label>
                    <Input 
                        id="name-register" 
                        type="text" 
                        placeholder="Jan Novák" 
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        className="bg-background"
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
                        className="bg-background"
                    />
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="password-register">Heslo</Label>
                        <Input 
                            id="password-register" 
                            type="password" 
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Potvrzení hesla</Label>
                        <Input 
                            id="confirm-password" 
                            type="password" 
                            value={signUpConfirmPassword}
                            onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                            className={`bg-background ${signUpConfirmPassword && signUpPassword !== signUpConfirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                      </div>
                  </div>

                  <Button onClick={handleSignUp} disabled={isLoading} variant="secondary" className="w-full font-bold h-11 border border-primary/20 hover:bg-primary/10 hover:text-primary">
                    {isLoading ? "Vytvářím účet..." : "Zaregistrovat se"}
                  </Button>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}