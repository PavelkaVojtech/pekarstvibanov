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
import { OrderActions } from "@/app/(admin)/admin/objednavky/order-actions"

export const dynamic = "force-dynamic"

export default async function EmployeeOrdersPage() {
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
      case "CASH_ON_DELIVERY": return "Hotově / na místě"
      case "ONLINE_CARD": return "Online kartou"
      case "INVOICE": return "Faktura"
      default: return type
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Správa objednávek</h1>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Číslo</TableHead>
              <TableHead>Zákazník</TableHead>
              <TableHead>Stav</TableHead>
              <TableHead>Platba</TableHead>
              <TableHead>Cena</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: (typeof orders)[number]) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <Link href={`/zamestnanec/objednavky/${order.id}`} className="hover:underline">
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  <div>{order.user.name}</div>
                  <div className="text-xs text-muted-foreground">{order.user.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getPaymentLabel(order.paymentType)}
                </TableCell>
                <TableCell>{Number(order.totalPrice)} Kč</TableCell>
                <TableCell>{order.createdAt.toLocaleDateString('cs-CZ')}</TableCell>
                <TableCell>
                  <OrderActions orderId={order.id} currentStatus={order.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
