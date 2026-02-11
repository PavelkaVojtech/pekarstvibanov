"use client"

import { useState, useEffect } from "react"
import { getUsers, updateUserRole } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useToast } from "@/components/ui/toast"
import { Loader2, Search, Info, MapPin, Phone, Building2, User, Mail, Calendar, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

type Address = {
    id: string
    userId: string
    type: string
    street: string
    city: string
    zipCode: string
}

type UserWithDetails = {
    id: string
    name: string
    email: string
    phone: string | null
    role: "USER" | "ADMIN" | "EMPLOYEE"
    createdAt: Date
    companyName: string | null
    ico: string | null
    dic: string | null
    _count: {
        orders: number
    }
    addresses: Address[]
}

export default function CustomersPage() {
    const { toast } = useToast()
    const [query, setQuery] = useState("")
    const [users, setUsers] = useState<UserWithDetails[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            try {
                const data = await getUsers(query)
                setUsers(data as unknown as UserWithDetails[])
            } catch (error) {
                console.error("Failed to fetch users", error)
            } finally {
                setLoading(false)
            }
        }

        const timeoutId = setTimeout(fetchUsers, 300)
        return () => clearTimeout(timeoutId)
    }, [query])

    const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN" | "EMPLOYEE") => {
        const previousUsers = [...users]
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))

        try {
            await updateUserRole(userId, newRole)
            toast.success("Role změněna", `Role uživatele byla aktualizována.`)
        } catch {
            setUsers(previousUsers)
            toast.error("Chyba", "Nepodařilo se změnit roli.")
        }
    }

    const UserDetailsSheet = ({ user }: { user: UserWithDetails }) => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="w-full md:w-auto gap-2">
                    <Info className="h-4 w-4" /> <span className="md:hidden">Detail zákazníka</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto w-full sm:max-w-md p-6">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl">Detail zákazníka</SheetTitle>
                    <SheetDescription>
                        Kompletní informace o uživateli {user.name}
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                            <User className="h-4 w-4" /> Osobní údaje
                        </h3>
                        <div className="grid gap-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-muted">
                                <span className="text-muted-foreground">Jméno:</span>
                                <span className="font-semibold">{user.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-muted">
                                <span className="text-muted-foreground flex items-center gap-2"><Mail className="h-3 w-3" /> Email:</span>
                                <span className="font-semibold text-right break-all ml-4">{user.email}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-muted">
                                <span className="text-muted-foreground flex items-center gap-2"><Phone className="h-3 w-3" /> Telefon:</span>
                                <span className="font-semibold">{user.phone || "—"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-muted">
                                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-3 w-3" /> Registrace:</span>
                                <span className="font-semibold">{new Date(user.createdAt).toLocaleDateString("cs-CZ")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                            <Building2 className="h-4 w-4" /> Firemní údaje
                        </h3>
                        {user.companyName ? (
                            <div className="grid gap-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-muted">
                                    <span className="text-muted-foreground">Název:</span>
                                    <span className="font-semibold text-right">{user.companyName}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-muted">
                                    <span className="text-muted-foreground">IČO:</span>
                                    <span className="font-semibold">{user.ico}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-muted">
                                    <span className="text-muted-foreground">DIČ:</span>
                                    <span className="font-semibold">{user.dic || "—"}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground italic bg-muted/50 p-4 rounded-lg">
                                Uživatel nemá vyplněné firemní údaje.
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Uložené adresy
                        </h3>
                        {user.addresses && user.addresses.length > 0 ? (
                            <div className="space-y-3">
                                {user.addresses.map((addr, i) => (
                                    <div key={addr.id} className="text-sm border rounded-lg p-4 bg-muted/30">
                                        <div className="font-bold text-primary mb-1">Adresa {i + 1}</div>
                                        <div className="font-medium">{addr.street}</div>
                                        <div className="text-muted-foreground">{addr.zipCode} {addr.city}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground italic bg-muted/50 p-4 rounded-lg">
                                Žádné uložené adresy.
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )

    return (
        <div className="space-y-8 w-full">
            <div className="flex flex-col gap-3">
                <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-tight text-foreground">Správa zákazníků</h1>
                <p className="text-muted-foreground text-base md:text-lg max-w-2xl">Přehled registrovaných uživatelů a správa jejich rolí v systému.</p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Vyhledat jméno nebo email..."
                    className="pl-10 h-11 bg-background shadow-sm"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center h-80 gap-4 text-muted-foreground bg-card border rounded-xl shadow-sm">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="font-semibold text-lg">Načítám zákazníky...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="flex justify-center items-center h-80 text-muted-foreground bg-card border rounded-xl shadow-sm italic text-lg">
                    Nebyli nalezeni žádní uživatelé.
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:hidden">
                        {users.map((user) => (
                            <Card key={user.id} className="overflow-hidden border-l-4 border-l-primary shadow-md">
                                <CardHeader className="p-5 pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="font-bold text-xl">{user.name}</div>
                                            <div className="text-sm text-muted-foreground break-all">{user.email}</div>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold">
                                            <ShoppingCart className="h-3.5 w-3.5" /> {user._count.orders}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5 pt-0 space-y-5">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-1.5">
                                            <div className="text-muted-foreground text-[10px] uppercase font-black tracking-widest">Role uživatele</div>
                                            <Select 
                                                defaultValue={user.role} 
                                                onValueChange={(val) => handleRoleChange(user.id, val as "USER" | "ADMIN" | "EMPLOYEE")}
                                            >
                                                <SelectTrigger className="h-10">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USER">Zákazník</SelectItem>
                                                    <SelectItem value="EMPLOYEE">Zaměstnanec</SelectItem>
                                                    <SelectItem value="ADMIN">Administrátor</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="text-right space-y-1.5">
                                            <div className="text-muted-foreground text-[10px] uppercase font-black tracking-widest">Registrace</div>
                                            <div className="font-medium pt-2">{new Date(user.createdAt).toLocaleDateString("cs-CZ")}</div>
                                        </div>
                                    </div>
                                    
                                    {user.companyName && (
                                        <div className="bg-muted p-3 rounded-lg text-xs border border-muted-foreground/10">
                                            <div className="font-bold text-foreground mb-0.5">{user.companyName}</div>
                                            <div className="text-muted-foreground">IČO: {user.ico}</div>
                                        </div>
                                    )}

                                    <UserDetailsSheet user={user} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="hidden md:block border rounded-xl bg-card shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="py-4 pl-6 font-bold">Jméno a kontakt</TableHead>
                                    <TableHead className="py-4 font-bold">Firma</TableHead>
                                    <TableHead className="py-4 text-center font-bold">Objednávky</TableHead>
                                    <TableHead className="py-4 font-bold">Role</TableHead>
                                    <TableHead className="py-4 text-right font-bold">Datum registrace</TableHead>
                                    <TableHead className="py-4 pr-6 w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="py-4 pl-6">
                                            <div className="font-bold text-foreground">{user.name}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {user.companyName ? (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">{user.companyName}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">IČO: {user.ico}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground/50 text-xs italic">Bez firmy</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-black rounded-full h-7 w-10 text-xs">
                                                {user._count.orders}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Select 
                                                defaultValue={user.role} 
                                                onValueChange={(val) => handleRoleChange(user.id, val as "USER" | "ADMIN" | "EMPLOYEE")}
                                            >
                                                <SelectTrigger className="w-[145px] h-9 shadow-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USER">Zákazník</SelectItem>
                                                    <SelectItem value="EMPLOYEE">Zaměstnanec</SelectItem>
                                                    <SelectItem value="ADMIN">Administrátor</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="py-4 text-right whitespace-nowrap text-muted-foreground font-medium text-sm">
                                            {new Date(user.createdAt).toLocaleDateString("cs-CZ")}
                                        </TableCell>
                                        <TableCell className="py-4 pr-6">
                                            <UserDetailsSheet user={user} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    )
}