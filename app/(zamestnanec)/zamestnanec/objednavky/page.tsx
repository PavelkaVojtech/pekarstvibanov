import { prisma } from "@/lib/db"
import { EmployeeOrdersTable } from "@/components/employee/orders-table"

export const dynamic = "force-dynamic"

export default async function EmployeeOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { requestedDeliveryDate: "asc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: true } }
    }
  })

  // Konvertuj Decimal na číslo pro client
  const serializedOrders = orders.map(order => ({
    ...order,
    totalPrice: order.totalPrice.toNumber(),
    items: order.items.map(item => ({
      ...item,
      price: item.price.toNumber()
    }))
  }))

  return <EmployeeOrdersTable orders={serializedOrders} />
}
