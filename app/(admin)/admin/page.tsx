import { StatsCard } from "./dashboard/stats-card"
import { ShoppingBag, Users, TrendingUp, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboard() {
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
            value="0" 
            description="Čeká na vyřízení" 
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
      
      {/* Sekce pro grafy nebo tabulky - zatím placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Nedávné objednávky</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Zatím žádné objednávky.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}