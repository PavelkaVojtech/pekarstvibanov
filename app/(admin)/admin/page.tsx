import { StatsCard } from "./dashboard/stats-card"
import { ShoppingBag, Users, TrendingUp, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/db"

export default async function AdminDashboard() {
  const pendingCount = await prisma.order.count({ where: { status: "PENDING" } })
  const recentPending = await prisma.order.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, orderNumber: true, createdAt: true, totalPrice: true },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-serif">Přehled pekárny</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
            title="Celkové tržby" 
            value="0 Kč" 
            description="+0% od minulého měsíce" 
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
            value="0" 
            description="Registrovaných uživatelů" 
            icon={Users} 
        />
        <StatsCard 
            title="Průměrná objednávka" 
            value="0 Kč" 
            description="Za posledních 30 dní" 
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
                          <span className="font-medium">{o.orderNumber}</span>
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