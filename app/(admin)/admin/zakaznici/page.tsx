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
import { Loader2, Search, Info, MapPin, Phone, Building2, User, Mail, Calendar } from "lucide-react"

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
    const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null)

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            try {
                const data = await getUsers(query)
                // Type assertion is safe here as the server action returns data matching our structure
                // Dates are serialized but next.js handles it, though strictly they might come as strings in some setups
                // We'll treat them as Dates or strings that can be put into Date ctor
                setUsers(data as unknown as UserWithDetails[])
            } catch (error) {
                console.error("Failed to fetch users", error)
                // Toast removed from here to prevent infinite loop if toast reference changes
            } finally {
                setLoading(false)
            }
        }

        const timeoutId = setTimeout(fetchUsers, 300)
        return () => clearTimeout(timeoutId)
    }, [query]) // Removed toast from dependencies to prevent infinite loop

    const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN" | "EMPLOYEE") => {
        const previousUsers = [...users]
        
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))

        try {
            await updateUserRole(userId, newRole)
             toast.success("Role změněna", `Role uživatele byla aktualizována.`)
        } catch (error) {
             setUsers(previousUsers)
            toast.error("Chyba", "Nepodařilo se změnit roli.")
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-7xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold font-serif tracking-tight">Správa zákazníků</h1>
                <p className="text-muted-foreground">Přehled registrovaných uživatelů a správa jejich rolí.</p>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Vyhledat jméno nebo email..."
                    className="pl-9 bg-background"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Jméno</TableHead>
                            <TableHead>Firma</TableHead>
                            <TableHead className="text-center">Objednávky</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Datum registrace</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-5 w-5 animate-spin" /> Načítám...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    Nebyli nalezeni žádní uživatelé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="font-semibold">{user.name}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        {user.companyName ? (
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.companyName}</span>
                                                <span className="text-xs text-muted-foreground">IČO: {user.ico}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                         <span className="inline-flex items-center justify-center bg-secondary text-secondary-foreground font-bold rounded-full h-6 w-8 text-xs">
                                            {user._count.orders}
                                         </span>
                                    </TableCell>
                                    <TableCell>
                                        <Select 
                                            defaultValue={user.role} 
                                            onValueChange={(val) => handleRoleChange(user.id, val as any)}
                                        >
                                            <SelectTrigger className="w-[140px] h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USER">Zákazník</SelectItem>
                                                <SelectItem value="EMPLOYEE">Zaměstnanec</SelectItem>
                                                <SelectItem value="ADMIN">Administrátor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap text-muted-foreground text-sm">
                                        {new Date(user.createdAt).toLocaleDateString("cs-CZ")}
                                    </TableCell>
                                    <TableCell>
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}>
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent className="overflow-y-auto">
                                                <SheetHeader>
                                                    <SheetTitle>Detail zákazníka</SheetTitle>
                                                    <SheetDescription>
                                                        Kompletní informace o uživateli {user.name}
                                                    </SheetDescription>
                                                </SheetHeader>
                                                
                                                <div className="space-y-6 py-6">
                                                    {/* Osobní údaje */}
                                                    <div className="space-y-3">
                                                        <h3 className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                                            <User className="h-4 w-4" /> Osobní údaje
                                                        </h3>
                                                        <div className="grid gap-2 text-sm">
                                                            <div className="flex justify-between py-1 border-b">
                                                                <span className="text-muted-foreground">Jméno:</span>
                                                                <span className="font-medium text-right">{user.name}</span>
                                                            </div>
                                                            <div className="flex justify-between py-1 border-b">
                                                                <span className="text-muted-foreground flex items-center gap-2"><Mail className="h-3 w-3" /> Email:</span>
                                                                <span className="font-medium text-right break-all">{user.email}</span>
                                                            </div>
                                                            <div className="flex justify-between py-1 border-b">
                                                                <span className="text-muted-foreground flex items-center gap-2"><Phone className="h-3 w-3" /> Telefon:</span>
                                                                <span className="font-medium text-right">{user.phone || "—"}</span>
                                                            </div>
                                                            <div className="flex justify-between py-1 border-b">
                                                                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-3 w-3" /> Registrace:</span>
                                                                <span className="font-medium text-right">{new Date(user.createdAt).toLocaleDateString("cs-CZ")}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Firemní údaje */}
                                                    <div className="space-y-3">
                                                        <h3 className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                                            <Building2 className="h-4 w-4" /> Firemní údaje
                                                        </h3>
                                                        {user.companyName ? (
                                                            <div className="grid gap-2 text-sm">
                                                                <div className="flex justify-between py-1 border-b">
                                                                    <span className="text-muted-foreground">Název:</span>
                                                                    <span className="font-medium text-right">{user.companyName}</span>
                                                                </div>
                                                                <div className="flex justify-between py-1 border-b">
                                                                    <span className="text-muted-foreground">IČO:</span>
                                                                    <span className="font-medium text-right">{user.ico}</span>
                                                                </div>
                                                                <div className="flex justify-between py-1 border-b">
                                                                    <span className="text-muted-foreground">DIČ:</span>
                                                                    <span className="font-medium text-right">{user.dic || "—"}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-muted-foreground italic bg-muted/40 p-3 rounded-md">
                                                                Uživatel nemá vyplněné firemní údaje.
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Adresy */}
                                                    <div className="space-y-3">
                                                        <h3 className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                                            <MapPin className="h-4 w-4" /> Uložené adresy
                                                        </h3>
                                                        {user.addresses && user.addresses.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {user.addresses.map((addr, i) => (
                                                                    <div key={addr.id} className="text-sm border rounded-md p-3 bg-background">
                                                                        <div className="font-medium mb-1">Adresa {i + 1}</div>
                                                                        <div className="text-muted-foreground">{addr.street}</div>
                                                                        <div className="text-muted-foreground">{addr.zipCode} {addr.city}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-muted-foreground italic bg-muted/40 p-3 rounded-md">
                                                                Žádné uložené adresy.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
