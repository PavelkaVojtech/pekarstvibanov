import { prisma } from "@/lib/db"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { BadgeProps } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderActions } from "./order-actions"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Calendar, User, CreditCard, Eye, RefreshCw, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderFilters } from "./order-filter"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

function formatRecurrence(recurrence: string | null) {
  if (!recurrence) return ""
  try {
    const data = JSON.parse(recurrence)
    if (data.days && Array.isArray(data.days)) {
      const dayLabels: Record<string, string> = {
        "1": "Po", "2": "Út", "3": "St", "4": "Čt", "5": "Pá", "6": "So", "0": "Ne"
      }
      return data.days.map((d: string) => dayLabels[d] || d).join(", ")
    }
    return recurrence
  } catch { return recurrence }
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; query?: string }>
}) {
  const { status, type, query } = await searchParams

  const where: Prisma.OrderWhereInput = {}
  if (status && status !== "ALL") where.status = status as any
  if (type && type !== "ALL") where.type = type as any
  if (query) {
    where.OR = [
      { orderNumber: { contains: query, mode: "insensitive" } },
      { user: { name: { contains: query, mode: "insensitive" } } },
      { user: { email: { contains: query, mode: "insensitive" } } },
    ]
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    }
  })

  const getPaymentStatusBadge = (paymentType: string, isPaid: boolean) => {
    if (paymentType !== "ONLINE_CARD") return null
    
    return {
      paid: isPaid,
      label: isPaid ? "Zaplaceno" : "Neypláceno",
      color: isPaid ? "text-green-600" : "text-red-600",
      bgColor: isPaid ? "bg-green-50" : "bg-red-50",
    }
  }

  const getStatusColor = (status: string): BadgeProps["variant"] => {
    switch (status) {
      case "PENDING": return "secondary"
      case "CONFIRMED": case "BAKING": return "default"
      case "READY": case "COMPLETED": return "outline"
      case "CANCELLED": return "destructive"
      default: return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "Čeká na schválení"
      case "CONFIRMED": return "Schváleno"
      case "BAKING": return "Ve výrobě"
      case "READY": return "Připraveno"
      case "COMPLETED": return "Dokončeno"
      case "CANCELLED": return "Zrušeno"
      default: return status
    }
  }

  return (
    <div className="space-y-8 w-full p-4 md:p-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-tight text-foreground text-center md:text-left">Správa objednávek</h1>
      </div>

      <OrderFilters />

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed italic text-muted-foreground">
            Nebyly nalezeny žádné objednávky odpovídající filtrům.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:hidden">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden border-l-4 border-l-primary shadow-md">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Link href={`/admin/objednavky/${order.id}`} className="font-bold text-xl hover:text-primary transition-colors">
                          {order.orderNumber}
                        </Link>
                      </div>
                      <Badge variant={getStatusColor(order.status)} className="font-bold">
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-5">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-black">
                          <CreditCard className="h-3 w-3" /> Platba
                        </div>
                        {getPaymentStatusBadge(order.paymentType, order.isPaid) ? (
                          <div className={`flex items-center gap-2 p-2 rounded-lg ${getPaymentStatusBadge(order.paymentType, order.isPaid)?.bgColor}`}>
                            {getPaymentStatusBadge(order.paymentType, order.isPaid)?.paid ? (
                              <CheckCircle2 className={`h-4 w-4 ${getPaymentStatusBadge(order.paymentType, order.isPaid)?.color}`} />
                            ) : (
                              <XCircle className={`h-4 w-4 ${getPaymentStatusBadge(order.paymentType, order.isPaid)?.color}`} />
                            )}
                            <span className={`text-sm font-bold ${getPaymentStatusBadge(order.paymentType, order.isPaid)?.color}`}>
                              {getPaymentStatusBadge(order.paymentType, order.isPaid)?.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Hotovost</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-black">
                          <User className="h-3 w-3" /> Zákazník
                        </div>
                        <div className="font-bold truncate">{order.user.name}</div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-muted-foreground text-[10px] uppercase font-black">
                          <Calendar className="h-3 w-3" /> Datum
                        </div>
                        <div className="font-medium">{order.createdAt.toLocaleDateString('cs-CZ')}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="text-lg font-black text-primary">{Number(order.totalPrice)} Kč</div>
                      {order.type === "RECURRING" && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase">
                          <RefreshCw className="h-3 w-3" /> {formatRecurrence(order.recurrence)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1"><OrderActions orderId={order.id} currentStatus={order.status} /></div>
                        <Button asChild variant="outline" size="icon"><Link href={`/admin/objednavky/${order.id}`}><Eye className="h-5 w-5" /></Link></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="hidden md:block border rounded-xl bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="py-4 pl-6 font-bold">Číslo</TableHead>
                    <TableHead className="py-4 font-bold">Zákazník</TableHead>
                    <TableHead className="py-4 font-bold">Stav</TableHead>
                    <TableHead className="py-4 font-bold">Platba</TableHead>
                    <TableHead className="py-4 font-bold">Typ / Dny</TableHead>
                    <TableHead className="py-4 font-bold">Cena</TableHead>
                    <TableHead className="py-4 pr-6 text-right font-bold">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30">
                      <TableCell className="py-4 pl-6 font-bold">{order.orderNumber}</TableCell>
                      <TableCell className="py-4">
                        <div className="font-bold">{order.user.name}</div>
                        <div className="text-xs text-muted-foreground">{order.user.email}</div>
                      </TableCell>
                      <TableCell><Badge variant={g
                        {getPaymentStatusBadge(order.paymentType, order.isPaid) ? (
                          <div className={`flex items-center gap-2 ${getPaymentStatusBadge(order.paymentType, order.isPaid)?.color}`}>
                            {getPaymentStatusBadge(order.paymentType, order.isPaid)?.paid ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span className="text-sm font-bold">{getPaymentStatusBadge(order.paymentType, order.isPaid)?.label}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Hotovost</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">etStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge></TableCell>
                      <TableCell className="py-4">
                        <div className="text-xs">{order.type === "RECURRING" ? "Pravidelná" : "Jednorázová"}</div>
                        {order.type === "RECURRING" && (
                          <div className="text-[10px] text-primary font-bold uppercase flex items-center gap-1 mt-1">
                            <RefreshCw className="h-2.5 w-2.5" /> {formatRecurrence(order.recurrence)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-black">{Number(order.totalPrice)} Kč</TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button asChild variant="ghost" size="sm"><Link href={`/admin/objednavky/${order.id}`}><Eye className="h-4 w-4 mr-1" /> Detail</Link></Button>
                           <OrderActions orderId={order.id} currentStatus={order.status} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}