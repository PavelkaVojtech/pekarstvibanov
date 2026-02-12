"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { MapPin, Settings, LogOut, Save, Plus, Trash2, Loader2, Lock, LayoutDashboard, Eye, RefreshCw, ShoppingBag, Calendar, CreditCard, User, Pencil, AlertCircle, XCircle, Search } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/components/ui/toast"
import { Textarea } from "@/components/ui/textarea"
import { cancelOrder } from "@/app/actions/orders"

const profileFormSchema = z.object({
  name: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  email: z.string().email("Neplatný formát emailu"),
  phone: z.string().optional(),
  isCompany: z.boolean(),
  companyName: z.string().optional(),
  ico: z.string().optional(),
  dic: z.string().optional(),
}).refine((data) => {
  if (data.isCompany) return !!data.companyName && !!data.ico;
  return true;
}, {
  message: "Vyplňte název firmy a IČO",
  path: ["companyName"],
});

const addressFormSchema = z.object({
  street: z.string().min(2, "Ulice je příliš krátká"),
  city: z.string().min(2, "Město je příliš krátké"),
  zipCode: z.string().regex(/^\d{3}\s?\d{2}$/, "PSČ musí být 5 číslic"),
});

type ProfileFormValues = z.input<typeof profileFormSchema>
type AddressFormValues = z.input<typeof addressFormSchema>

type Address = { id: string; street: string; city: string; zipCode: string; }

type UserOrder = {
    id: string; orderNumber: string; status: string; totalPrice: number | string;
    createdAt: string; deliveryMethod: string | null; requestedDeliveryDate: string | null;
    paymentType: string | null; orderType: string | null; recurrence: string | null;
}

type ProductOption = { id: string; name: string; price: string; }
type EditableOrderItem = { productId: string; name: string; price: number; quantity: number; }
type EditableOrder = { id: string; orderNumber: string; status: string; items: EditableOrderItem[]; }

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const { toast } = useToast()
  const ordersFetchedRef = useRef(false)

  const [addresses, setAddresses] = useState<Address[]>([])
  const [orders, setOrders] = useState<UserOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [aresLoading, setAresLoading] = useState(false)

  const [isEditOrderDialogOpen, setIsEditOrderDialogOpen] = useState(false)
  const [editOrderLoading, setEditOrderLoading] = useState(false)
  const [editOrderSaving, setEditOrderSaving] = useState(false)
  const [editingOrder, setEditingOrder] = useState<EditableOrder | null>(null)
  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [addProductId, setAddProductId] = useState("")
  const [addQuantity, setAddQuantity] = useState(1)
  
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: "", email: "", phone: "", isCompany: false, companyName: "", ico: "", dic: "" },
  })

  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: { street: "", city: "", zipCode: "" },
  })

  useEffect(() => {
    if (!isPending && session?.user) {
        fetch("/api/profile").then(res => res.json()).then(userData => {
            profileForm.reset({
                name: userData.name || "",
                email: userData.email || session.user.email || "",
                phone: userData.phone || "",
                isCompany: !!(userData.companyName || userData.ico),
                companyName: userData.companyName || "",
                ico: userData.ico || "",
                dic: userData.dic || "",
            });
        });
        fetchAddresses();
        if (!ordersFetchedRef.current) {
            ordersFetchedRef.current = true;
            fetchOrders();
        }
    }
  }, [session, isPending]);

  const fetchAddresses = async () => {
      const res = await fetch("/api/address");
      if (res.ok) setAddresses(await res.json());
  }

  const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const res = await fetch("/api/orders");
            if (res.ok) setOrders(await res.json());
        } finally { setOrdersLoading(false); }
    }

    const handleAresFetch = async () => {
        const ico = profileForm.getValues("ico");
        if (!ico || ico.length !== 8) {
            toast.error("Neplatné IČO", "IČO musí mít 8 číslic.");
            return;
        }

        setAresLoading(true);
        try {
            const res = await fetch(`/api/ares/${ico}`);
            const data = await res.json();

            if (data.error) {
                toast.error("Chyba", data.error);
            } else {
                profileForm.setValue("companyName", data.companyName);
                if (data.dic) profileForm.setValue("dic", data.dic);
                toast.success("Údaje načteny", "Informace o firmě byly úspěšně načteny z registru ARES.");
            }
        } catch (error) {
            toast.error("Chyba", "Nepodařilo se spojit s registrem ARES.");
        } finally {
            setAresLoading(false);
        }
    }

    const openEditOrder = async (orderId: string) => {
        setIsEditOrderDialogOpen(true);
        setEditOrderLoading(true);
        try {
            const [oRes, pRes] = await Promise.all([fetch(`/api/orders/${orderId}`), fetch("/api/products")]);
            const oData = await oRes.json();
            setEditingOrder({
                id: oData.id, orderNumber: oData.orderNumber, status: oData.status,
                items: oData.items.map((i: any) => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: Number(i.price) }))
            });
            setProductOptions(await pRes.json());
        } finally { setEditOrderLoading(false); }
    }

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm("Opravdu chcete tuto objednávku zrušit?")) return;
        try {
            const result = await cancelOrder(orderId);
            if (result.success) {
                toast.success("Zrušeno", "Objednávka byla úspěšně zrušena.");
                fetchOrders();
            }
        } catch (error: any) {
            toast.error("Chyba", error.message);
        }
    }

    const saveEditOrder = async () => {
        if (!editingOrder) return;
        setEditOrderSaving(true);
        try {
            const res = await fetch(`/api/orders/${editingOrder.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: editingOrder.items.map(i => ({ productId: i.productId, quantity: i.quantity })) }),
            });
            if (res.ok) { toast.success("Uloženo", "Objednávka byla upravena."); setIsEditOrderDialogOpen(false); fetchOrders(); }
        } finally { setEditOrderSaving(false); }
    }

    const statusVariant = (status: string) => {
        switch (status) {
            case "PENDING": return "secondary";
            case "CONFIRMED": case "BAKING": case "READY": return "default";
            case "COMPLETED": return "outline";
            case "CANCELLED": return "destructive";
            default: return "secondary";
        }
    }

    const statusLabel = (status: string) => {
        switch (status) {
            case "PENDING": return "Čeká na schválení";
            case "CONFIRMED": return "Schváleno";
            case "BAKING": return "Ve výrobě";
            case "READY": return "Připraveno";
            case "COMPLETED": return "Dokončeno";
            case "CANCELLED": return "Zrušeno";
            default: return status;
        }
    }

    const formatRecurrence = (recurrence: string | null) => {
        if (!recurrence) return "";
        try {
            const data = JSON.parse(recurrence);
            if (data.days) {
                const labels: any = { "1": "Po", "2": "Út", "3": "St", "4": "Čt", "5": "Pá", "6": "So", "0": "Ne" };
                return data.days.map((d: string) => labels[d]).join(", ");
            }
        } catch { return ""; }
    }

    const handleLogout = async () => {
        await authClient.signOut();
        window.location.assign("/");
    }

  if (isPending) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (!session) { router.push("/prihlaseni"); return null; }

  return (
    <div className="container mx-auto max-w-6xl py-10 px-4">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black font-serif tracking-tight text-foreground">Můj profil</h1>
          <p className="text-muted-foreground text-base italic">Vítejte zpět, {session.user.name}</p>
        </div>
        <div className="flex gap-2">
            {session.user.role === "ADMIN" && (
                <Button asChild variant="outline" className="font-bold border-primary text-primary hover:bg-primary/10">
                    <Link href="/admin"><LayoutDashboard className="mr-2 h-4 w-4" /> Administrace</Link>
                </Button>
            )}
            <Button variant="ghost" className="text-destructive font-bold hover:bg-destructive/10" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Odhlásit se
            </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex bg-muted p-1 rounded-xl">
          <TabsTrigger value="profile" className="font-bold uppercase text-[10px] md:text-xs tracking-widest">Profil</TabsTrigger>
          <TabsTrigger value="addresses" className="font-bold uppercase text-[10px] md:text-xs tracking-widest">Adresy</TabsTrigger>
          <TabsTrigger value="orders" className="font-bold uppercase text-[10px] md:text-xs tracking-widest">Objednávky</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-lg border-none overflow-hidden rounded-2xl">
            <CardHeader className="bg-muted/30 border-b p-6 md:p-8">
              <CardTitle className="text-2xl font-serif">Osobní údaje</CardTitle>
              <CardDescription>Správa vašeho účtu a fakturačních údajů.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(async (v) => {
                    const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
                    if (res.ok) toast.success("Uloženo", "Profil byl aktualizován.");
                })} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField control={profileForm.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary">Celé jméno</FormLabel><FormControl><Input {...field} className="h-12" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={profileForm.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary">Email</FormLabel><FormControl><Input {...field} disabled className="h-12 bg-muted/50" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={profileForm.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary">Telefon</FormLabel><FormControl><Input {...field} className="h-12" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <Separator className="bg-muted" />
                  <FormField control={profileForm.control} name="isCompany" render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0 bg-primary/5 p-4 rounded-xl border border-primary/10">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <FormLabel className="font-black uppercase text-xs cursor-pointer tracking-wider">Nakupuji na firmu / IČO</FormLabel>
                    </FormItem>
                  )} />
                  {profileForm.watch("isCompany") && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-2">
                      <FormField control={profileForm.control} name="ico" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary">IČO</FormLabel>
                            <div className="flex gap-2">
                                <FormControl><Input {...field} className="h-12" placeholder="12345678" /></FormControl>
                                <Button type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0" onClick={handleAresFetch} disabled={aresLoading}>
                                    {aresLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                                </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={profileForm.control} name="companyName" render={({ field }) => (
                        <FormItem><FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary">Název firmy</FormLabel><FormControl><Input {...field} className="h-12" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={profileForm.control} name="dic" render={({ field }) => (
                        <FormItem><FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary">DIČ</FormLabel><FormControl><Input {...field} className="h-12" /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  )}
                  <Button type="submit" className="font-black h-14 px-12 text-lg shadow-xl hover:scale-105 transition-transform"><Save className="mr-3 h-5 w-5" /> ULOŽIT ZMĚNY</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button onClick={() => { setEditingAddress(null); addressForm.reset({ street: "", city: "", zipCode: "" }); setIsAddressDialogOpen(true); }} className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-primary/20 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group">
                <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary mb-4 transition-transform group-hover:scale-110" />
                <span className="font-black uppercase text-xs tracking-widest text-muted-foreground group-hover:text-primary">Přidat adresu</span>
            </button>
            {addresses.map((addr) => (
              <Card key={addr.id} className="shadow-md hover:shadow-xl transition-all border-none rounded-2xl overflow-hidden group">
                <CardHeader className="bg-muted/30 p-5 border-b flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-primary"><MapPin className="h-4 w-4" /> Uložená adresa</div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingAddress(addr); addressForm.reset(addr); setIsAddressDialogOpen(true); }}><Settings className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleteTargetId(addr.id); setIsDeleteConfirmOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-1">
                  <div className="font-black text-xl">{addr.street}</div>
                  <div className="text-muted-foreground font-medium">{addr.zipCode} {addr.city}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-start gap-3">
             <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
             <p className="text-sm text-primary font-medium">Objednávku můžete upravit nebo zrušit pouze dokud nebyla schválena pekárnou (stav "Čeká na schválení").</p>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed italic text-muted-foreground">Zatím jste neudělali žádnou objednávku.</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:hidden">
                {orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden border-l-4 border-l-primary shadow-lg rounded-2xl">
                    <CardHeader className="p-5 pb-3 flex flex-row justify-between items-start">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Objednávka</div>
                        <div className="font-black text-xl text-primary">{order.orderNumber}</div>
                      </div>
                      <Badge variant={statusVariant(order.status)} className="font-black uppercase text-[10px]">{statusLabel(order.status)}</Badge>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm border-y border-muted py-4">
                            <div className="space-y-1">
                                <div className="text-[10px] font-black uppercase text-muted-foreground">Datum</div>
                                <div className="font-bold flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString('cs-CZ')}</div>
                            </div>
                            <div className="space-y-1 text-right">
                                <div className="text-[10px] font-black uppercase text-muted-foreground">Typ</div>
                                <div className="font-bold">{order.orderType === "RECURRING" ? "Pravidelná" : "Jednorázová"}</div>
                            </div>
                        </div>
                        {order.orderType === "RECURRING" && (
                            <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 flex items-center gap-2 text-[10px] font-black text-primary uppercase">
                                <RefreshCw className="h-3 w-3" /> {formatRecurrence(order.recurrence)}
                            </div>
                        )}
                        <div className="flex flex-col gap-3">
                            <div className="text-2xl font-black text-foreground">{Number(order.totalPrice)} Kč</div>
                            {order.status === "PENDING" && (
                                <div className="flex gap-2 w-full">
                                    <Button variant="outline" className="flex-1 font-black uppercase text-[10px] tracking-widest h-10" onClick={() => openEditOrder(order.id)}>Upravit</Button>
                                    <Button variant="destructive" className="flex-1 font-black uppercase text-[10px] tracking-widest h-10" onClick={() => handleCancelOrder(order.id)}>Zrušit</Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="hidden md:block border-none shadow-xl rounded-2xl bg-card overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="py-5 pl-8 font-black uppercase text-[10px] tracking-widest text-primary">Číslo a Stav</TableHead>
                      <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest">Datum</TableHead>
                      <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest">Typ / Dny</TableHead>
                      <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest">Cena</TableHead>
                      <TableHead className="py-5 pr-8 text-right font-black uppercase text-[10px] tracking-widest">Akce</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="py-5 pl-8">
                            <div className="flex flex-col gap-1.5">
                                <span className="font-black text-foreground">{order.orderNumber}</span>
                                <Badge variant={statusVariant(order.status)} className="w-fit font-black uppercase text-[9px] px-2 py-0">{statusLabel(order.status)}</Badge>
                            </div>
                        </TableCell>
                        <TableCell className="py-5 font-bold text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('cs-CZ')}</TableCell>
                        <TableCell className="py-5">
                          <div className="text-[10px] font-black uppercase">{order.orderType === "RECURRING" ? "Pravidelná" : "Jednorázová"}</div>
                          {order.orderType === "RECURRING" && (
                            <div className="text-[10px] text-primary font-black flex items-center gap-1 mt-1 uppercase">
                              <RefreshCw className="h-3 w-3" /> {formatRecurrence(order.recurrence)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-5 font-black text-lg">{Number(order.totalPrice)} Kč</TableCell>
                        <TableCell className="py-5 pr-8 text-right">
                           {order.status === "PENDING" ? (
                             <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" className="font-black uppercase text-[10px] tracking-widest h-9 px-4 hover:bg-primary hover:text-white" onClick={() => openEditOrder(order.id)}><Pencil className="h-3 w-3 mr-2" /> Upravit</Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => handleCancelOrder(order.id)} title="Zrušit objednávku"><XCircle className="h-5 w-5" /></Button>
                             </div>
                           ) : (
                               <span className="text-[10px] font-black uppercase text-muted-foreground/40 italic">Zpracovává se</span>
                           )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader><DialogTitle className="font-black text-2xl uppercase font-serif tracking-tight">{editingAddress ? "Upravit adresu" : "Přidat adresu"}</DialogTitle></DialogHeader>
          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(async (v) => {
                const method = editingAddress ? "PUT" : "POST";
                const url = editingAddress ? `/api/address?id=${editingAddress.id}` : "/api/address";
                const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
                if (res.ok) { toast.success("Uloženo"); setIsAddressDialogOpen(false); fetchAddresses(); }
            })} className="space-y-6 pt-4">
              <FormField control={addressForm.control} name="street" render={({ field }) => (
                <FormItem><FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary">Ulice a číslo</FormLabel><FormControl><Input {...field} className="h-12" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-6">
                <FormField control={addressForm.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary">Město</FormLabel><FormControl><Input {...field} className="h-12" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={addressForm.control} name="zipCode" render={({ field }) => (
                  <FormItem><FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary">PSČ</FormLabel><FormControl><Input {...field} className="h-12" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full font-black h-14 uppercase tracking-widest text-lg shadow-lg">ULOŽIT ADRESU</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOrderDialogOpen} onOpenChange={setIsEditOrderDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90dvh] overflow-y-auto rounded-3xl p-0">
          <div className="p-6 md:p-8 bg-muted/30 border-b">
            <DialogHeader>
                <DialogTitle className="font-black text-2xl font-serif">Úprava objednávky</DialogTitle>
                <DialogDescription className="italic">Lze upravit pouze dokud není potvrzena personálem.</DialogDescription>
            </DialogHeader>
          </div>
          {editOrderLoading ? <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div> : editingOrder && (
            <div className="p-6 md:p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="font-black uppercase text-[10px] tracking-widest text-primary border-b pb-2">Položky v košíku</h3>
                {editingOrder.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-4 py-3 border-b last:border-0 border-muted">
                    <div className="flex-1 min-w-0"><p className="font-black text-sm truncate">{item.name}</p><p className="text-xs text-muted-foreground font-bold">{item.price} Kč / ks</p></div>
                    <div className="flex items-center gap-3">
                        <Input type="number" min="1" className="w-16 h-10 font-black text-center" value={item.quantity} onChange={(e) => { const v = parseInt(e.target.value); if (v > 0) { const next = [...editingOrder.items]; const idx = next.findIndex(x => x.productId === item.productId); next[idx].quantity = v; setEditingOrder({...editingOrder, items: next}); } }} />
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10" onClick={() => setEditingOrder({...editingOrder, items: editingOrder.items.filter(x => x.productId !== item.productId)})}><Trash2 className="h-5 w-5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 border rounded-2xl bg-primary/5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Přidat produkt</Label>
                  <Select value={addProductId} onValueChange={setAddProductId}>
                    <SelectTrigger className="h-12 bg-background font-bold"><SelectValue placeholder="Vyberte produkt" /></SelectTrigger>
                    <SelectContent>{productOptions.map(p => <SelectItem key={p.id} value={p.id} className="font-bold">{p.name} ({p.price} Kč)</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Množství</Label>
                  <div className="flex gap-2">
                    <Input type="number" min="1" value={addQuantity} onChange={(e) => setAddQuantity(parseInt(e.target.value))} className="h-12 bg-background font-black text-center" />
                    <Button type="button" className="h-12 w-12" onClick={() => { if (!addProductId) return; const p = productOptions.find(x => x.id === addProductId); if (!p) return; const items = [...editingOrder.items]; const existingIdx = items.findIndex(x => x.productId === addProductId); if (existingIdx > -1) { items[existingIdx].quantity += addQuantity; } else { items.push({ productId: p.id, name: p.name, price: Number(p.price), quantity: addQuantity }); } setEditingOrder({...editingOrder, items}); setAddProductId(""); setAddQuantity(1); }}><Plus className="h-5 w-5" /></Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-6 bg-muted rounded-2xl">
                <span className="font-black uppercase text-xs tracking-widest">Celková cena:</span>
                <span className="text-2xl font-black text-primary">{editingOrder.items.reduce((acc, i) => acc + i.price * i.quantity, 0)} Kč</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1 h-14 font-black uppercase tracking-widest" onClick={() => setIsEditOrderDialogOpen(false)}>Zrušit</Button>
                <Button className="flex-1 h-14 font-black uppercase tracking-widest shadow-xl" disabled={editOrderSaving} onClick={saveEditOrder}>{editOrderSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-3 h-5 w-5" />} Uložit úpravy</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}