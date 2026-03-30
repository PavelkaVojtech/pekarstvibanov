'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createClosureDay, deleteClosureDay, getAllClosureDays, updateClosureDay } from '@/app/actions/closed-days'
import { Loader2, Plus, Trash2, Edit2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

type ClosureDay = {
  id: string
  date: Date | string
  type: 'CLOSED' | 'MODIFIED'
  altOpeningHours?: string | null
  note?: string | null
}

export function ClosedDaysManager() {
  const [closureDays, setClosureDays] = useState<ClosureDay[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Vypočítej dnes - bude se používat pro min datum
  const today = new Date()
  const minDateStr = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0')

  const [formData, setFormData] = useState<{
    date: string
    type: 'CLOSED' | 'MODIFIED'
    openingTime: string
    closingTime: string
    note: string
  }>({
    date: '',
    type: 'CLOSED',
    openingTime: '07:00',
    closingTime: '15:30',
    note: '',
  })

  const { toast } = useToast()

  // Načtení dat
  useEffect(() => {
    loadClosureDays()
  }, [])

  const loadClosureDays = async () => {
    setLoading(true)
    try {
      const result = await getAllClosureDays()
      if (result.success) {
        setClosureDays(result.data)
      } else {
        toast({
          title: 'Chyba',
          description: result.error || 'Nepodařilo se načíst zavřené dny',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Chyba při načítání dat',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetForm = () => {
    // Nastav minimální datum na dnes
    const today = new Date()
    const minDate = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0')
    
    setFormData({
      date: minDate,
      type: 'CLOSED',
      openingTime: '07:00',
      closingTime: '15:30',
      note: '',
    })
    setEditingId(null)
  }

  const handleEdit = (day: ClosureDay) => {
    const dateStr = typeof day.date === 'string' ? day.date : day.date.toISOString().split('T')[0]
    
    let openingTime = '07:00'
    let closingTime = '15:30'
    
    // Pokud existují alternativní doby, parsuj je (formát: "07:00 - 15:30")
    if (day.altOpeningHours && typeof day.altOpeningHours === 'string') {
      const parts = day.altOpeningHours.split('-').map((p) => p.trim())
      if (parts.length === 2) {
        openingTime = parts[0]
        closingTime = parts[1]
      }
    }
    
    setFormData({
      date: dateStr,
      type: day.type,
      openingTime,
      closingTime,
      note: day.note || '',
    })
    setEditingId(day.id)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.date || !formData.type) {
      toast({
        title: 'Chyba',
        description: 'Vyplňte všechna povinná pole (datum, typ)',
        variant: 'destructive',
      })
      return
    }

    // Validace - nelze vybrat minulý den
    const today = new Date()
    const todayDateStr = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0')
    
    if (formData.date < todayDateStr) {
      toast({
        title: 'Chyba',
        description: 'Nelze vybrat minulý den. Vyberte dnes nebo později.',
        variant: 'destructive',
      })
      return
    }

    // Validace - pokud je MODIFIED, musí být vyplněny časy
    if (formData.type === 'MODIFIED' && (!formData.openingTime || !formData.closingTime)) {
      toast({
        title: 'Chyba',
        description: 'Vyplňte otevírací doby (Od a Do)',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      // Konvertuj časy na formát pro MODIFIED typ
      let altOpeningHours = ''
      if (formData.type === 'MODIFIED') {
        altOpeningHours = `${formData.openingTime} - ${formData.closingTime}`
      }

      const payload = {
        date: formData.date,
        type: formData.type,
        altOpeningHours,
        note: formData.note,
      }

      let result
      if (editingId) {
        result = await updateClosureDay(editingId, payload)
      } else {
        result = await createClosureDay(payload)
      }

      if (result.success) {
        toast({
          title: 'Úspěch',
          description: editingId ? 'Den byl aktualizován' : 'Den byl přidán',
        })
        setIsDialogOpen(false)
        handleResetForm()
        await loadClosureDays()
      } else {
        toast({
          title: 'Chyba',
          description: result.error || 'Chyba při ukládání',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Chyba při ukládání dat',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Opravdu chcete smazat tento záznam?')) return

    try {
      setSaving(true)
      const result = await deleteClosureDay(id)
      if (result.success) {
        toast({
          title: 'Úspěch',
          description: 'Den byl smazán',
        })
        await loadClosureDays()
      } else {
        toast({
          title: 'Chyba',
          description: result.error || 'Chyba při mazání',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Chyba při mazání',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
    return new Intl.DateTimeFormat('cs-CZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Zavřené dny / Změněné otevírací doby</CardTitle>
            <CardDescription>Správa dní, kdy je pekárna zavřena nebo má změněné otevírací doby</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleResetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Přidat den
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Upravit den' : 'Přidat zavřený/pozměněný den'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Datum *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    min={minDateStr}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    disabled={saving}
                  />
                  <p className="text-xs text-muted-foreground">Lze vybrat pouze dnešní den nebo později</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Typ *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as 'CLOSED' | 'MODIFIED' })}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLOSED">Uplně zavřeno</SelectItem>
                      <SelectItem value="MODIFIED">Změněné otevírací doby</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === 'MODIFIED' && (
                  <div className="space-y-3">
                    <Label>Otevírací doby</Label>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="openingTime" className="text-sm">Od</Label>
                        <Input
                          id="openingTime"
                          type="time"
                          value={formData.openingTime}
                          onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                          disabled={saving}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="closingTime" className="text-sm">Do</Label>
                        <Input
                          id="closingTime"
                          type="time"
                          value={formData.closingTime}
                          onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                          disabled={saving}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Zadejte časy otevření a zavření pro tento den
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="note">Poznámka (volitelné)</Label>
                  <Input
                    id="note"
                    placeholder='Např: "Státní svátek", "Dovolená"'
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    disabled={saving}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      handleResetForm()
                    }}
                    disabled={saving}
                    className="flex-1"
                  >
                    Zrušit
                  </Button>
                  <Button onClick={handleSubmit} disabled={saving} className="flex-1">
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingId ? 'Uložit' : 'Přidat'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : closureDays.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Žádné zavřené dny nejsou nastaveny
          </div>
        ) : (
          <div className="space-y-2">
            {closureDays.map((day) => (
              <div
                key={day.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatDate(day.date)}</span>
                    <Badge variant={day.type === 'CLOSED' ? 'destructive' : 'secondary'}>
                      {day.type === 'CLOSED' ? 'Zavřeno' : 'Změněné doby'}
                    </Badge>
                  </div>
                  {day.note && <p className="text-sm text-muted-foreground">{day.note}</p>}
                  {day.type === 'MODIFIED' && day.altOpeningHours && (
                    <p className="text-sm text-muted-foreground">
                      Doby: {day.altOpeningHours}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(day)}
                    disabled={saving}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(day.id)}
                    disabled={saving}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
