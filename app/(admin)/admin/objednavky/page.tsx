import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderActions } from "./order-actions"

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: true } }
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "secondary"
      case "CONFIRMED": return "default"
      case "COMPLETED": return "outline"
      case "CANCELLED": return "destructive"
      default: return "secondary"
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
              <TableHead>Cena</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>
                  <div>{order.user.name}</div>
                  <div className="text-xs text-muted-foreground">{order.user.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(order.status) as any}>
                    {order.status}
                  </Badge>
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