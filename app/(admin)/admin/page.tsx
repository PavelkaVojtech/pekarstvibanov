import { StatsCard } from "./dashboard/stats-card"
import { ShoppingBag, Users, TrendingUp, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/db"

// Revalidate každých 60 sekund
export const revalidate = 60

export default async function AdminDashboard() {
  const pendingCount = await prisma.order.count({ where: { status: "PENDING" } })
  const paidOnlineCount = await prisma.order.count({ where: { paymentType: "ONLINE_CARD", isPaid: true } })
  const unpaidOnlineCount = await prisma.order.count({ where: { paymentType: "ONLINE_CARD", isPaid: false, status: { not: "CANCELLED" } } })
  
  // Celkové tržby - sum všech zaplacených objednávek
  const totalRevenueResult = await prisma.order.aggregate({
    where: { status: { not: "CANCELLED" }, isPaid: true },
    _sum: { totalPrice: true }
  })
  const totalRevenue = totalRevenueResult._sum.totalPrice ? Number(totalRevenueResult._sum.totalPrice) : 0

  // Počet unikátních zákazníků
  const uniqueCustomers = await prisma.order.findMany({
    select: { userId: true },
    distinct: ['userId'],
    where: { status: { not: "CANCELLED" } }
  })
  const customerCount = uniqueCustomers.length

  // Průměrná objednávka za posledních 30 dní
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const avgOrderResult = await prisma.order.aggregate({
    where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" } },
    _avg: { totalPrice: true }
  })
  const avgOrder = avgOrderResult._avg.totalPrice ? Math.round(Number(avgOrderResult._avg.totalPrice)) : 0
  
  const recentPending = await prisma.order.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, orderNumber: true, createdAt: true, totalPrice: true, paymentType: true, isPaid: true },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-serif">Přehled pekárny</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard 
            title="Celkové tržby" 
            value={`${new Intl.NumberFormat('cs-CZ').format(totalRevenue)} Kč`} 
            description="Z ukončených objednávek" 
            icon={TrendingUp} 
        />
        <StatsCard 
            title="Nové objednávky" 
          value={pendingCount} 
          description="Čeká na schválení" 
            icon={ShoppingBag} 
        />
        <StatsCard 
            title="Zákazníci" 
            value={customerCount} 
            description="Registrovaných uživatelů" 
            icon={Users} 
        />
        <StatsCard 
            title="Průměrná objednávka" 
            value={`${new Intl.NumberFormat('cs-CZ').format(avgOrder)} Kč`} 
            description="Za posledních 30 dní" 
            icon={DollarSign} 
        />
        <StatsCard 
          title="Online platby" 
          value={paidOnlineCount} 
          description={`${unpaidOnlineCount} čeká na doplacení`} 
          icon={DollarSign} 
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Nedávné objednávky</CardTitle>
            </CardHeader>
            <CardContent>
                {recentPending.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Zatím žádné objednávky.</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Čekají na schválení:</p>
                    <div className="space-y-1">
                      {recentPending.map((o) => (
                        <div key={o.id} className="flex items-center justify-between text-sm">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{o.orderNumber}</span>
                            {o.paymentType === "ONLINE_CARD" && (
                              <span className="text-xs text-muted-foreground">
                                {o.isPaid ? "Online platba zaplacena" : "Online platba čeká na úhradu"}
                              </span>
                            )}
                          </div>
                          <span className="text-muted-foreground">{o.createdAt.toLocaleDateString("cs-CZ")} • {Number(o.totalPrice)} Kč</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}