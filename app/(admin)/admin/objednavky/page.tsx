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
import { Calendar, User, CreditCard, ShoppingBag, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: true } }
    }
  })

  const getStatusColor = (status: string): BadgeProps["variant"] => {
    switch (status) {
      case "PENDING": return "secondary"
      case "CONFIRMED": return "default"
      case "BAKING": return "default"
      case "READY": return "outline"
      case "COMPLETED": return "outline"
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

  const getPaymentLabel = (type: string) => {
    switch (type) {
      case "CASH_ON_DELIVERY": return "Hotově"
      case "ONLINE_CARD": return "Karta"
      case "INVOICE": return "Faktura"
      default: return type
    }
  }

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-tight text-foreground">Správa objednávek</h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl">Kompletní přehled a správa stavů zákaznických objednávek.</p>
      </div>

      <div className="space-y-6">
        {/* MOBILNÍ ZOBRAZENÍ (KARTY) */}
        <div className="grid grid-cols-1 gap-6 md:hidden">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden border-l-4 border-l-primary shadow-md">
              <CardHeader className="p-5 pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Objednávka</div>
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
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-black tracking-widest">
                      <User className="h-3 w-3" /> Zákazník
                    </div>
                    <div className="font-bold truncate">{order.user.name}</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-muted-foreground text-[10px] uppercase font-black tracking-widest">
                      <Calendar className="h-3 w-3" /> Datum
                    </div>
                    <div className="font-medium">{order.createdAt.toLocaleDateString('cs-CZ')}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-muted-foreground/10">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="font-medium">{getPaymentLabel(order.paymentType)}</span>
                  </div>
                  <div className="text-lg font-black text-primary">
                    {Number(order.totalPrice)} Kč
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1">
                    <OrderActions orderId={order.id} currentStatus={order.status} />
                  </div>
                  <Button asChild variant="outline" size="icon" className="shrink-0 h-10 w-10">
                    <Link href={`/admin/objednavky/${order.id}`}>
                      <Eye className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* DESKTOP ZOBRAZENÍ (TABULKA) */}
        <div className="hidden md:block border rounded-xl bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="py-4 pl-6 font-bold">Číslo</TableHead>
                <TableHead className="py-4 font-bold">Zákazník</TableHead>
                <TableHead className="py-4 font-bold">Stav</TableHead>
                <TableHead className="py-4 font-bold">Platba</TableHead>
                <TableHead className="py-4 font-bold">Cena</TableHead>
                <TableHead className="py-4 font-bold">Datum</TableHead>
                <TableHead className="py-4 pr-6 text-right font-bold">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4 pl-6">
                    <Link href={`/admin/objednavky/${order.id}`} className="font-bold text-primary hover:underline">
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-bold text-foreground">{order.user.name}</div>
                    <div className="text-xs text-muted-foreground">{order.user.email}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant={getStatusColor(order.status)} className="font-bold">
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-sm font-medium text-muted-foreground">
                    {getPaymentLabel(order.paymentType)}
                  </TableCell>
                  <TableCell className="py-4 font-black text-foreground">
                    {Number(order.totalPrice)} Kč
                  </TableCell>
                  <TableCell className="py-4 text-muted-foreground font-medium text-sm">
                    {order.createdAt.toLocaleDateString('cs-CZ')}
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button asChild variant="ghost" size="sm" className="h-8 px-2 hover:text-primary">
                          <Link href={`/admin/objednavky/${order.id}`} className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4" /> Detail
                          </Link>
                       </Button>
                       <OrderActions orderId={order.id} currentStatus={order.status} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}