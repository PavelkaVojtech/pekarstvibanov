"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link" // Přidán import pro Link
import { authClient } from "@/lib/auth-client"
import { User, Package, MapPin, Settings, LogOut, Building2, Save, Plus, Trash2, Home, Loader2, Lock, List, LogIn } from "lucide-react" // Přidán import ikon List a LogIn
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
import { cancelOrder } from "@/app/actions/orders"

// ... (Zbytek tvých schémat a typů zůstává stejný - profileFormSchema, addressFormSchema, atd.) ...
const profileFormSchema = z.object({
  name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  phone: z.string().optional(),
    isCompany: z.boolean(),
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

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Zadejte prosím současné heslo"),
  newPassword: z.string().min(8, "Nové heslo musí mít alespoň 8 znaků"),
  confirmPassword: z.string().min(8, "Potvrzení hesla musí mít alespoň 8 znaků"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Hesla se neshodují",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.input<typeof profileFormSchema>
type AddressFormValues = z.input<typeof addressFormSchema>
type PasswordFormValues = z.input<typeof passwordFormSchema>

type Address = {
    id: string;
    street: string;
    city: string;
    zipCode: string;
}

type UserOrder = {
    id: string
    orderNumber: string
    status: string
    totalPrice: number | string
    createdAt: string
    deliveryMethod: string | null
    requestedDeliveryDate: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const { toast } = useToast()
  
  const [addresses, setAddresses] = useState<Address[]>([])
    const [orders, setOrders] = useState<UserOrder[]>([])
    const [ordersLoading, setOrdersLoading] = useState(false)
  
  // Dialogy states
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // Formuláře (hooks)
    const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: "", phone: "", isCompany: false, companyName: "", ico: "", dic: "" },
  })

    const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { street: "", city: "", zipCode: "" },
  })

    const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  // Načítání dat (pouze pokud je session)
  useEffect(() => {
    const loadData = async () => {
        // Pokud není uživatel, nic nenačítáme
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
            // Načtení adres voláme taky jen když je uživatel
            fetchAddresses();
        } catch (error) {
            console.error("Nepodařilo se načíst profil", error);
        }
    };

    if (!isPending) {
        loadData();
    }
  }, [session, isPending, profileForm]) // Přidáno isPending do závislostí

  const fetchAddresses = async () => {
      const res = await fetch("/api/address");
      if (res.ok) {
                    const data: unknown = await res.json();

                    if (Array.isArray(data)) {
                        setAddresses(
                            data
                                .map((row) => {
                                    if (!row || typeof row !== "object") return null
                                    const record = row as Record<string, unknown>
                                    const id = record.id
                                    const street = record.street
                                    const city = record.city
                                    const zipCode = record.zipCode

                                    if (
                                        typeof id !== "string" ||
                                        typeof street !== "string" ||
                                        typeof city !== "string" ||
                                        typeof zipCode !== "string"
                                    ) {
                                        return null
                                    }

                                    return { id, street, city, zipCode } satisfies Address
                                })
                                .filter((a): a is Address => Boolean(a))
                        )
                    }
      }
  }

    const fetchOrders = async () => {
        setOrdersLoading(true)
        try {
            const res = await fetch("/api/orders")
            if (!res.ok) {
                setOrders([])
                return
            }
            const data: unknown = await res.json()
            if (Array.isArray(data)) {
                setOrders(
                    data
                        .map((row) => {
                            if (!row || typeof row !== "object") return null
                            const record = row as Record<string, unknown>
                            const id = record.id
                            const orderNumber = record.orderNumber
                            const status = record.status
                            const totalPrice = record.totalPrice
                            const createdAt = record.createdAt
                            const deliveryMethod = record.deliveryMethod
                            const requestedDeliveryDate = record.requestedDeliveryDate
                            if (typeof id !== "string" || typeof orderNumber !== "string" || typeof status !== "string" || typeof createdAt !== "string") {
                                return null
                            }
                            return {
                                id,
                                orderNumber,
                                status,
                                totalPrice: typeof totalPrice === "number" || typeof totalPrice === "string" ? totalPrice : "0",
                                createdAt,
                                deliveryMethod: typeof deliveryMethod === "string" ? deliveryMethod : null,
                                requestedDeliveryDate: typeof requestedDeliveryDate === "string" ? requestedDeliveryDate : null,
                            } satisfies UserOrder
                        })
                        .filter((o): o is UserOrder => o !== null)
                )
            }
        } catch {
            setOrders([])
        } finally {
            setOrdersLoading(false)
        }
    }

    const statusVariant = (status: string) => {
        switch (status) {
            case "PENDING":
                return "secondary" as const
            case "CONFIRMED":
            case "READY":
                return "default" as const
            case "COMPLETED":
                return "outline" as const
            case "CANCELLED":
                return "destructive" as const
            default:
                return "secondary" as const
        }
    }

    const onProfileSubmit = async (values: ProfileFormValues) => {
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
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

    const onAddressSubmit = async (values: AddressFormValues) => {
        try {
            const isEdit = Boolean(editingAddress)
            const url = isEdit ? `/api/address?id=${encodeURIComponent(editingAddress!.id)}` : "/api/address"
            const method = isEdit ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            const data: unknown = await res.json().catch(() => null)
            if (!res.ok) {
                const message = (() => {
                    if (!data || typeof data !== "object") return "Nepodařilo se uložit adresu."
                    const record = data as Record<string, unknown>
                    return typeof record.error === "string" ? record.error : "Nepodařilo se uložit adresu."
                })()
                throw new Error(message)
            }

            toast.success("Uloženo", isEdit ? "Adresa byla upravena." : "Adresa byla přidána.")
            setIsAddressDialogOpen(false)
            setEditingAddress(null)
            await fetchAddresses()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Chyba při ukládání adresy."
            toast.error("Chyba", message)
        }
    }

    const onPasswordSubmit = async (_values: PasswordFormValues) => {
        toast.error("Zatím nepodporováno", "Změna hesla není v projektu zatím implementovaná.")
    }
  const handleDeleteAddress = async (id: string) => { setDeleteTargetId(id); setIsDeleteConfirmOpen(true); }
    const confirmDelete = async () => {
        if (!deleteTargetId) return
        try {
            const res = await fetch(`/api/address?id=${encodeURIComponent(deleteTargetId)}`, { method: "DELETE" })
            const data: unknown = await res.json().catch(() => null)
            if (!res.ok) {
                const message = (() => {
                    if (!data || typeof data !== "object") return "Nepodařilo se smazat adresu."
                    const record = data as Record<string, unknown>
                    return typeof record.error === "string" ? record.error : "Nepodařilo se smazat adresu."
                })()
                throw new Error(message)
            }
            toast.success("Smazáno", "Adresa byla odstraněna.")
            setIsDeleteConfirmOpen(false)
            setDeleteTargetId(null)
            await fetchAddresses()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Chyba při mazání adresy."
            toast.error("Chyba", message)
        }
    }

    const openAddressDialog = (addr?: Address) => {
        setEditingAddress(addr ?? null)
        addressForm.reset({
            street: addr?.street ?? "",
            city: addr?.city ?? "",
            zipCode: addr?.zipCode ?? "",
        })
        setIsAddressDialogOpen(true)
    }
  const handleLogout = async () => {
        try {
            await authClient.signOut()
        } finally {
            window.location.assign("/")
        }
  }


  // --- 1. STAV: NAČÍTÁNÍ ---
  if (isPending) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
    )
  }

  // --- 2. STAV: NEPŘIHLÁŠENÝ UŽIVATEL (ALZA STYLE) ---
  if (!session) {
    return (
        <div className="min-h-screen bg-background py-16 px-4 transition-colors duration-300">
            <div className="container mx-auto max-w-5xl text-center space-y-12">
                
                <h1 className="text-4xl font-serif font-bold text-foreground">Můj Účet</h1>
                
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-xl font-medium text-foreground">
                            <Link href="/prihlaseni" className="text-primary hover:underline font-bold">Přihlaste se</Link> a získáte
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Karta 1 */}
                        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="flex flex-col items-center pt-8 px-4 text-center space-y-4">
                                <Settings className="h-12 w-12 text-primary mb-2" />
                                <p className="text-muted-foreground">Kompletní nastavení uživatelského účtu</p>
                            </CardContent>
                        </Card>

                        {/* Karta 2 */}
                        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="flex flex-col items-center pt-8 px-4 text-center space-y-4">
                                <MapPin className="h-12 w-12 text-primary mb-2" />
                                <p className="text-muted-foreground">Možnost přidávat další doručovací adresy, účty, osoby</p>
                            </CardContent>
                        </Card>

                        {/* Karta 3 */}
                        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="flex flex-col items-center pt-8 px-4 text-center space-y-4">
                                <List className="h-12 w-12 text-primary mb-2" />
                                <p className="text-muted-foreground">Přehled historie všech vašich objednávek a faktur</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="pt-4">
                        <Button asChild size="lg" className="text-lg font-bold px-10 py-6 rounded-full shadow-lg hover:scale-105 transition-transform">
                            <Link href="/prihlaseni">
                                Přihlásit se <LogIn className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Nemáte účet? <Link href="/prihlaseni" className="text-primary hover:underline">Zaregistrujte se</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
  }

  // --- 3. STAV: PŘIHLÁŠENÝ UŽIVATEL (TVŮJ PŮVODNÍ KÓD) ---
  return (
    <div className="min-h-screen bg-muted/30 py-10 transition-colors duration-300">
      {/* ... Zde pokračuje zbytek tvého původního kódu (SideBar, Tabs, Formuláře) ... */}
      {/* Jen pro jistotu, kopíruji strukturu, abys věděl, kam to patří */}
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
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

            {/* Obsah */}
            <div className="flex-1">
                <Tabs defaultValue="info" className="w-full space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-card border border-border">
                        <TabsTrigger value="info">Údaje</TabsTrigger>
                        <TabsTrigger value="orders">Objednávky</TabsTrigger>
                        <TabsTrigger value="settings">Nastavení</TabsTrigger>
                    </TabsList>

                    {/* Zde vlož celý obsah TabsContent (info, orders, settings) z tvého původního souboru */}
                    <TabsContent value="info">
                            <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
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

                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>Historie objednávek</CardTitle>
                                                                <CardDescription>Zde uvidíte své objednávky a jejich stav.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                                                {ordersLoading ? (
                                                                    <div className="flex items-center justify-center py-10 text-muted-foreground">
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Načítám objednávky…
                                                                    </div>
                                                                ) : orders.length === 0 ? (
                                                                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 text-muted-foreground">
                                                                            <Package className="h-16 w-16 opacity-20" />
                                                                            <p>Zatím zde nemáte žádné objednávky.</p>
                                                                            <Button variant="outline" onClick={() => router.push("/produkty")}>
                                                                                    Jít nakupovat
                                                                            </Button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="border rounded-md overflow-hidden">
                                                                        <Table>
                                                                            <TableHeader>
                                                                                <TableRow>
                                                                                    <TableHead>Číslo</TableHead>
                                                                                    <TableHead>Stav</TableHead>
                                                                                    <TableHead>Typ</TableHead>
                                                                                    <TableHead>Na den</TableHead>
                                                                                    <TableHead className="text-right">Cena</TableHead>
                                                                                    <TableHead className="text-right">Akce</TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>
                                                                            <TableBody>
                                                                                {orders.map((o) => {
                                                                                    const created = new Date(o.createdAt)
                                                                                    const requested = o.requestedDeliveryDate ? new Date(o.requestedDeliveryDate) : null
                                                                                    return (
                                                                                        <TableRow key={o.id}>
                                                                                            <TableCell className="font-medium">{o.orderNumber}</TableCell>
                                                                                            <TableCell>
                                                                                                <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                                                                                            </TableCell>
                                                                                            <TableCell className="text-sm text-muted-foreground">
                                                                                                {o.deliveryMethod === "PICKUP" ? "Odběr" : "Doručení"}
                                                                                            </TableCell>
                                                                                            <TableCell className="text-sm">
                                                                                                {requested ? requested.toLocaleDateString("cs-CZ") : created.toLocaleDateString("cs-CZ")}
                                                                                            </TableCell>
                                                                                            <TableCell className="text-right">{Number(o.totalPrice)} Kč</TableCell>
                                                                                            <TableCell className="text-right">
                                                                                                {o.status === "PENDING" ? (
                                                                                                    <Button
                                                                                                        size="sm"
                                                                                                        variant="destructive"
                                                                                                        onClick={async () => {
                                                                                                            try {
                                                                                                                await cancelOrder(o.id)
                                                                                                                toast.success("Zrušeno", "Objednávka byla zrušena.")
                                                                                                                await fetchOrders()
                                                                                                            } catch {
                                                                                                                toast.error("Chyba", "Objednávku se nepodařilo zrušit.")
                                                                                                            }
                                                                                                        }}
                                                                                                    >
                                                                                                        Zrušit
                                                                                                    </Button>
                                                                                                ) : (
                                                                                                    <span className="text-sm text-muted-foreground">—</span>
                                                                                                )}
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    )
                                                                                })}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </div>
                                                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        {/* Zde tvůj obsah pro settings (adresy, heslo) z původního souboru */}
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
                                    
                                    <Form {...addressForm}>
                                        <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4 py-4">
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
                                        <Form {...passwordForm}>
                                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 py-4">
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