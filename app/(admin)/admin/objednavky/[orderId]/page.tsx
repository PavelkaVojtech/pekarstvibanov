import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import type { BadgeProps } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderActions } from "../order-actions"

export const dynamic = "force-dynamic"

function getStatusColor(status: string): BadgeProps["variant"] {
  switch (status) {
    case "PENDING":
      return "secondary"
    case "CONFIRMED":
      return "default"
    case "BAKING":
      return "default"
    case "READY":
      return "outline"
    case "COMPLETED":
      return "outline"
    case "CANCELLED":
      return "destructive"
    default:
      return "secondary"
  }
}

function getStatusLabel(status: string) {
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

function getDeliveryLabel(method: string) {
  switch (method) {
    case "DELIVERY": return "Doručení"
    case "PICKUP": return "Osobní odběr"
    default: return method
  }
}

function getPaymentLabel(type: string) {
  switch (type) {
    case "CASH_ON_DELIVERY": return "Hotově / na místě"
    case "ONLINE_CARD": return "Online kartou"
    case "INVOICE": return "Faktura"
    default: return type
  }
}

function getOrderTypeLabel(type: string) {
  switch (type) {
    case "ONE_TIME": return "Jednorázová"
    case "RECURRING": return "Pravidelná"
    default: return type
  }
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "-"
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleString("cs-CZ")
}

function TimelineRow({ label, value }: { label: string; value: Date | null | undefined }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{formatDateTime(value)}</span>
    </div>
  )
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  })

  if (!order) notFound()

  const orderWithMilestones = order as typeof order & {
    confirmedAt: Date | null
    bakingAt: Date | null
    readyAt: Date | null
    completedAt: Date | null
    cancelledAt: Date | null
  }

  const items = order.items.map((item) => {
    const unit = Number(item.price)
    const lineTotal = unit * item.quantity
    return {
      id: item.id,
      name: item.product?.name ?? "(smazaný produkt)",
      quantity: item.quantity,
      unit,
      lineTotal,
    }
  })

  const hasSnapshotAddress = Boolean(order.deliveryStreet || order.deliveryCity || order.deliveryZip)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/objednavky" className="text-sm text-muted-foreground hover:underline">
            ← Zpět na objednávky
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold">Objednávka {order.orderNumber}</h1>
            <Badge variant={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
          </div>
        </div>

        <div className="shrink-0">
          <OrderActions orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Základní informace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Vytvořeno</span>
              <span className="font-medium">{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Schváleno</span>
              <span className="font-medium">{formatDateTime(orderWithMilestones.confirmedAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Požadovaný den</span>
              <span className="font-medium">{formatDateTime(order.requestedDeliveryDate)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Doručení</span>
              <span className="font-medium">{getDeliveryLabel(order.deliveryMethod)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Platba</span>
              <span className="font-medium">{getPaymentLabel(order.paymentType)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Typ</span>
              <span className="font-medium">{getOrderTypeLabel(order.type)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Opakování</span>
              <span className="font-medium">{order.type === "RECURRING" ? (order.recurrence || "Neuvedeno") : "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Poznámka</span>
              <span className="font-medium">{order.note || "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Časová osa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <TimelineRow label="Vytvořeno" value={order.createdAt} />
            <TimelineRow label="Schváleno" value={orderWithMilestones.confirmedAt} />
            <TimelineRow label="Ve výrobě" value={orderWithMilestones.bakingAt} />
            <TimelineRow label="Připraveno" value={orderWithMilestones.readyAt} />
            <TimelineRow label="Dokončeno" value={orderWithMilestones.completedAt} />
            <TimelineRow label="Zrušeno" value={orderWithMilestones.cancelledAt} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zákazník a adresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Jméno</span>
              <span className="font-medium">{order.user.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{order.user.email}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Telefon</span>
              <span className="font-medium">{order.user.phone || "-"}</span>
            </div>

            {hasSnapshotAddress && (
              <>
                <div className="pt-2 border-t" />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Ulice</span>
                  <span className="font-medium">{order.deliveryStreet || "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Město</span>
                  <span className="font-medium">{order.deliveryCity || "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">PSČ</span>
                  <span className="font-medium">{order.deliveryZip || "-"}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Položky</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produkt</TableHead>
                  <TableHead className="text-right">Ks</TableHead>
                  <TableHead className="text-right">Cena/ks</TableHead>
                  <TableHead className="text-right">Celkem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell className="text-right">{i.quantity}</TableCell>
                    <TableCell className="text-right">{i.unit} Kč</TableCell>
                    <TableCell className="text-right">{i.lineTotal} Kč</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">
                    Celkem
                  </TableCell>
                  <TableCell className="text-right font-bold">{Number(order.totalPrice)} Kč</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
