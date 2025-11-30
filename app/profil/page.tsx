"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { User, Package, MapPin, Settings, LogOut, Building2, Save, Plus, Trash2, Home, Loader2, Lock } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/components/ui/toast"

// --- SCHÉMATA ---

const profileFormSchema = z.object({
  name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  phone: z.string().optional(),
  isCompany: z.boolean().default(false),
  companyName: z.string().optional(),
  ico: z.string().optional(),
  dic: z.string().optional(),
}).refine((data) => {
  if (data.isCompany) {
    return !!data.companyName && !!data.ico;
  }
  return true;
}, {
  message: "Vyplňte název firmy a IČO",
  path: ["companyName"],
});

const addressFormSchema = z.object({
  street: z.string().min(2, "Ulice je příliš krátká"),
  city: z.string().min(2, "Město je příliš krátké"),
  zipCode: z.string().regex(/^\d{3}\s?\d{2}$/, "PSČ musí být 5 číslic (např. 12345)"),
});

// Schéma pro heslo
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Zadejte prosím současné heslo"),
  newPassword: z.string().min(8, "Nové heslo musí mít alespoň 8 znaků"),
  confirmPassword: z.string().min(8, "Potvrzení hesla musí mít alespoň 8 znaků"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Hesla se neshodují",
  path: ["confirmPassword"],
});


type Address = {
    id: string;
    street: string;
    city: string;
    zipCode: string;
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const { toast } = useToast()
  
  const [addresses, setAddresses] = useState<Address[]>([])
  
  // Dialogy states
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // 1. Profilový formulář
  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      isCompany: false,
      companyName: "",
      ico: "",
      dic: "",
    },
  })

  // 2. Adresní formulář
  const addressForm = useForm({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      street: "",
      city: "",
      zipCode: "",
    },
  })

  // 3. Formulář hesla
  const passwordForm = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Načtení dat
  useEffect(() => {
    const loadData = async () => {
        if (!session?.user) return;

        try {
            const profileRes = await fetch("/api/profile");
            
            if (profileRes.ok) {
                const userData = await profileRes.json();
                const hasCompanyData = !!(userData.companyName || userData.ico);

                profileForm.reset({
                    name: userData.name || "",
                    phone: userData.phone || "",
                    isCompany: hasCompanyData,
                    companyName: userData.companyName || "",
                    ico: userData.ico || "",
                    dic: userData.dic || "",
                });
            }
        } catch (error) {
            console.error("Nepodařilo se načíst profil", error);
        }
        fetchAddresses();
    };

    loadData();
  }, [session, profileForm])

  const fetchAddresses = async () => {
      const res = await fetch("/api/address");
      if (res.ok) {
          const data = await res.json();
          setAddresses(data);
      }
  }

  // --- HANDLERS ---

  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
        const res = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Chyba při ukládání");
        }

        toast.success("Profil aktualizován");
        router.refresh(); 
    } catch (e: any) {
        toast.error(e.message || "Nastala chyba při ukládání profilu.");
    }
  }

  const onAddressSubmit = async (values: z.infer<typeof addressFormSchema>) => {
      const normalizedZip = values.zipCode.replace(/\s+/g, "")
      const payload = { ...values, zipCode: normalizedZip }

      try {
        let res;
        if (editingAddress) {
            res = await fetch(`/api/address?id=${editingAddress.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch("/api/address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }

        if (res.ok) {
            toast.success(editingAddress ? "Adresa upravena" : "Adresa přidána");
            setIsAddressDialogOpen(false);
            fetchAddresses();
            addressForm.reset();
            setEditingAddress(null);
        } else {
            const err = await res.json();
            toast.error(err.error || "Chyba při ukládání");
        }
      } catch (e) {
          toast.error("Chyba serveru");
      }
  }

  // --- Handler pro změnu hesla (BEZ OŠKLIVÉHO ALERTU) ---
  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    await authClient.changePassword({
        newPassword: values.newPassword,
        currentPassword: values.currentPassword,
        revokeOtherSessions: true, 
    }, {
        onSuccess: () => {
             toast.success("Heslo změněno", "Vaše heslo bylo úspěšně aktualizováno.");
             setIsPasswordDialogOpen(false);
             passwordForm.reset();
        },
        onError: (ctx) => {
             // Zde je kouzlo: Místo alertu nastavíme chybu přímo do formuláře
             const message = ctx.error.message?.toLowerCase() || "";

             // Pokud chyba obsahuje slovo "password" nebo "invalid", je to pravděpodobně špatné heslo
             if (message.includes("password") || message.includes("invalid") || message.includes("incorrect")) {
                 passwordForm.setError("currentPassword", { 
                     type: "manual", 
                     message: "Zadané heslo není správné." 
                 });
             } else {
                 // Ostatní chyby (server, síť) zobrazíme v toastu
                 toast.error("Chyba", "Změna hesla se nezdařila. Zkuste to prosím znovu.");
             }
        }
    });
  }

  const handleDeleteAddress = async (id: string) => {
      setDeleteTargetId(id)
      setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return
    const res = await fetch(`/api/address?id=${deleteTargetId}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Adresa smazána")
      fetchAddresses()
    } else {
      toast.error("Chyba při mazání adresy")
    }
    setIsDeleteConfirmOpen(false)
    setDeleteTargetId(null)
  }

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
        },
      },
    })
  }

  const openAddressDialog = (addr?: Address) => {
      if (addr) {
          setEditingAddress(addr);
          addressForm.reset({
              street: addr.street,
              city: addr.city,
              zipCode: addr.zipCode
          });
      } else {
          setEditingAddress(null);
          addressForm.reset({
              street: "",
              city: "",
              zipCode: ""
          });
      }
      setIsAddressDialogOpen(true);
  }

  if (isPending || !session) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>

  return (
    <div className="min-h-screen bg-muted/30 py-10 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* --- LEVÝ SIDEBAR --- */}
          <div className="w-full md:w-64 shrink-0 space-y-6">
            <Card>
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary text-2xl font-bold mb-2">
                        {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <CardTitle className="text-lg">{session.user.name}</CardTitle>
                    <CardDescription className="truncate">{session.user.email}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="destructive" className="w-full" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Odhlásit se
                    </Button>
                </CardFooter>
            </Card>
          </div>

          {/* --- PRAVÁ ČÁST --- */}
          <div className="flex-1">
            <Tabs defaultValue="info" className="w-full space-y-6">
              
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-card border border-border">
                <TabsTrigger value="info">Údaje</TabsTrigger>
                <TabsTrigger value="orders">Objednávky</TabsTrigger>
                <TabsTrigger value="settings">Nastavení</TabsTrigger>
              </TabsList>

              {/* 1. ÚDAJE */}
              <TabsContent value="info">
                <Form {...(profileForm as any)}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit as any)} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Osobní údaje</CardTitle>
                                <CardDescription>Kontaktní informace pro vaše objednávky.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={profileForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Celé jméno</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input value={session.user.email} disabled className="bg-muted" />
                                    </div>
                                    <FormField
                                        control={profileForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Telefon</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+420 777 888 999" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-primary" /> Firemní údaje
                                        </CardTitle>
                                        <CardDescription>Vyplňte pouze pokud nakupujete na firmu.</CardDescription>
                                    </div>
                                    <FormField
                                        control={profileForm.control}
                                        name="isCompany"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Nakupuji na IČO</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardHeader>
                            
                            {profileForm.watch("isCompany") && (
                                <CardContent className="space-y-4 animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={profileForm.control}
                                            name="companyName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Název firmy</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
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
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="dic"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>DIČ (volitelné)</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            )}
                            
                            <CardFooter className="border-t pt-6 flex justify-end">
                                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                                    <Save className="mr-2 h-4 w-4" /> 
                                    {profileForm.formState.isSubmitting ? "Ukládám..." : "Uložit změny"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
              </TabsContent>

              {/* 2. OBJEDNÁVKY */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Historie objednávek</CardTitle>
                    <CardDescription>Zde uvidíte své minulé nákupy.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 text-muted-foreground">
                        <Package className="h-16 w-16 opacity-20" />
                        <p>Zatím zde nemáte žádné objednávky.</p>
                        <Button variant="outline" onClick={() => router.push("/produkty")}>
                            Jít nakupovat
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 3. NASTAVENÍ */}
              <TabsContent value="settings" className="space-y-6">
                {/* ADRESY */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" /> Moje adresy
                            </CardTitle>
                            <CardDescription>Uložená místa pro doručení.</CardDescription>
                        </div>
                        
                        <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => openAddressDialog()}><Plus className="h-4 w-4 mr-2"/> Přidat adresu</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{editingAddress ? 'Upravit adresu' : 'Nová adresa'}</DialogTitle>
                              <DialogDescription>Zadejte adresu pro doručování pečiva.</DialogDescription>
                            </DialogHeader>
                            
                            <Form {...(addressForm as any)}>
                                <form onSubmit={addressForm.handleSubmit(onAddressSubmit as any)} className="space-y-4 py-4">
                                    <FormField
                                        control={addressForm.control}
                                        name="street"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ulice a číslo</FormLabel>
                                                <FormControl><Input {...field} placeholder="Např. Hlavní 52" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={addressForm.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Město</FormLabel>
                                                    <FormControl><Input {...field} placeholder="Bánov" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={addressForm.control}
                                            name="zipCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PSČ</FormLabel>
                                                    <FormControl><Input {...field} placeholder="687 54" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="w-full sm:w-auto">
                                            {editingAddress ? 'Uložit změny' : 'Uložit adresu'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                          </DialogContent>
                        </Dialog>

                    </CardHeader>
                    <CardContent className="space-y-4">
                        {addresses.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">Nemáte uloženou žádnou adresu.</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {addresses.map((addr) => (
                                    <div key={addr.id} className="flex items-start justify-between p-4 border rounded-lg bg-background">
                                        <div className="flex gap-3">
                                            <div className="mt-1"><Home className="h-4 w-4 text-muted-foreground" /></div>
                                            <div>
                                                <p className="font-medium">{addr.street}</p>
                                                <p className="text-sm text-muted-foreground">{addr.zipCode} {addr.city}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button variant="ghost" size="icon" onClick={() => openAddressDialog(addr)}>
                                            <Save className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAddress(addr.id)}>
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ZMĚNA HESLA - DIALOG */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" /> Zabezpečení
                            </CardTitle>
                            <CardDescription>Změna hesla k vašemu účtu.</CardDescription>
                        </div>
                        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary">Změnit heslo</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Změna hesla</DialogTitle>
                                    <DialogDescription>
                                        Pro změnu hesla zadejte své současné heslo a poté nové heslo.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...(passwordForm as any)}>
                                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit as any)} className="space-y-4 py-4">
                                        <FormField
                                            control={passwordForm.control}
                                            name="currentPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Současné heslo</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" {...field} />
                                                    </FormControl>
                                                    {/* Zde se zobrazí chybová hláška "Zadané heslo není správné" */}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid gap-4 pt-2">
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
                                                      <FormLabel>Potvrzení nového hesla</FormLabel>
                                                      <FormControl>
                                                          <Input type="password" {...field} />
                                                      </FormControl>
                                                      <FormMessage />
                                                  </FormItem>
                                              )}
                                          />
                                        </div>
                                        
                                        <DialogFooter>
                                            <Button type="submit" className="w-full sm:w-auto font-bold" disabled={passwordForm.formState.isSubmitting}>
                                                {passwordForm.formState.isSubmitting ? "Měním..." : "Změnit heslo"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    {/* Obsah karty jen pro info, že je účet zabezpečen */}
                    <CardContent className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-green-600" />
                          <span>Váš účet je chráněn heslem.</span>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Potvrdit smazání</DialogTitle>
                      <DialogDescription>Opravdu chcete smazat tuto adresu? Tuto akci nelze vrátit.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setIsDeleteConfirmOpen(false)}>Zrušit</Button>
                      <Button className="ml-2" variant="destructive" onClick={confirmDelete}>Smazat</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}