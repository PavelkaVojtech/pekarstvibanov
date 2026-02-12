'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Trash2, Save, Star, Wheat, Heart, Clock, Leaf, Users, ShieldCheck, Truck, Store, MapPin, Coffee, Utensils } from 'lucide-react'
import { updateSiteSettings } from '@/app/actions/settings'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const AVAILABLE_ICONS = [
  { name: 'Star', icon: Star },
  { name: 'Wheat', icon: Wheat },
  { name: 'Heart', icon: Heart },
  { name: 'Clock', icon: Clock },
  { name: 'Leaf', icon: Leaf },
  { name: 'Users', icon: Users },
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'Truck', icon: Truck },
  { name: 'Store', icon: Store },
  { name: 'MapPin', icon: MapPin },
  { name: 'Coffee', icon: Coffee },
  { name: 'Utensils', icon: Utensils },
]

type SiteSettings = {
  phone: string
  email: string
  address: string
  mapIframeSrc: string
  openingHours: string
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  heroButtonLink: string
  heroImageUrl: string | null
  aboutTitle: string
  aboutDescription: string
  aboutCards: string
  facebookUrl: string | null
  instagramUrl: string | null
}

const formSchema = z.object({
  phone: z.string().min(1, 'Telefon je povinný'),
  email: z.string().email('Neplatný email'),
  address: z.string().min(1, 'Adresa je povinná'),
  mapIframeSrc: z.string().url('Neplatná URL'),
  openingHours: z.array(z.object({ day: z.string(), hours: z.string(), closed: z.boolean() })),
  heroTitle: z.string().min(1, 'Nadpis je povinný'),
  heroSubtitle: z.string().min(1, 'Podnadpis je povinný'),
  heroButtonText: z.string().min(1, 'Text tlačítka je povinný'),
  heroButtonLink: z.string().min(1, 'Odkaz je povinný'),
  heroImageUrl: z.string().nullable(),
  aboutTitle: z.string().min(1, 'Nadpis je povinný'),
  aboutDescription: z.string().min(1, 'Popis je povinný'),
  aboutCards: z.array(z.object({ title: z.string(), description: z.string(), icon: z.string() })),
  facebookUrl: z.string().nullable(),
  instagramUrl: z.string().nullable(),
})

type FormValues = z.infer<typeof formSchema>

export function SettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { openingHours: [], aboutCards: [] },
  })

  const openingHours = watch('openingHours')
  const aboutCards = watch('aboutCards')

  useEffect(() => {
    const parsedOpeningHours = typeof initialSettings.openingHours === 'string' ? JSON.parse(initialSettings.openingHours) : initialSettings.openingHours
    const parsedAboutCards = typeof initialSettings.aboutCards === 'string' ? JSON.parse(initialSettings.aboutCards) : initialSettings.aboutCards

    setValue('phone', initialSettings.phone)
    setValue('email', initialSettings.email)
    setValue('address', initialSettings.address)
    setValue('mapIframeSrc', initialSettings.mapIframeSrc)
    setValue('openingHours', parsedOpeningHours)
    setValue('heroTitle', initialSettings.heroTitle)
    setValue('heroSubtitle', initialSettings.heroSubtitle)
    setValue('heroButtonText', initialSettings.heroButtonText)
    setValue('heroButtonLink', initialSettings.heroButtonLink)
    setValue('heroImageUrl', initialSettings.heroImageUrl || null)
    setValue('aboutTitle', initialSettings.aboutTitle)
    setValue('aboutDescription', initialSettings.aboutDescription)
    setValue('aboutCards', parsedAboutCards)
    setValue('facebookUrl', initialSettings.facebookUrl || null)
    setValue('instagramUrl', initialSettings.instagramUrl || null)
  }, [initialSettings, setValue])

  const onSubmit = async (data: FormValues) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        openingHours: JSON.stringify(data.openingHours),
        aboutCards: JSON.stringify(data.aboutCards),
      }
      const result = await updateSiteSettings(payload)
      if (result.success) {
        toast({ title: 'Úspěch', description: 'Nastavení bylo uloženo' })
      } else {
        toast({ title: 'Chyba', description: result.error || 'Chyba při ukládání', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Chyba', description: 'Nepodařilo se uložit', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const updateAboutCard = (index: number, field: 'title' | 'description' | 'icon', value: string) => {
    const updated = [...aboutCards]
    updated[index] = { ...updated[index], [field]: value }
    setValue('aboutCards', updated)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-serif tracking-tight">Nastavení webu</h2>
          <p className="text-muted-foreground">Správa obsahu a informací na webu</p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Uložit změny
        </Button>
      </div>

      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contact">Obecné & Kontakt</TabsTrigger>
          <TabsTrigger value="hero">Úvodní stránka</TabsTrigger>
          <TabsTrigger value="about">Sekce O nás</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-6">
            {/* ... Sekce kontaktu zůstává stejná jako v tvém kódu ... */}
            <Card>
                <CardHeader><CardTitle>Kontaktní informace</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Telefon</Label><Input {...register('phone')} /></div>
                    <div className="space-y-2"><Label>Email</Label><Input {...register('email')} /></div>
                    <div className="space-y-2"><Label>Adresa</Label><Input {...register('address')} /></div>
                    <div className="space-y-2"><Label>Map URL</Label><Input {...register('mapIframeSrc')} /></div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="hero" className="space-y-6">
             {/* ... Sekce Hero zůstává stejná ... */}
             <Card>
                <CardHeader><CardTitle>Hero sekce</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Nadpis</Label><Input {...register('heroTitle')} /></div>
                    <div className="space-y-2"><Label>Podnadpis</Label><Input {...register('heroSubtitle')} /></div>
                    <div className="space-y-2"><Label>Text tlačítka</Label><Input {...register('heroButtonText')} /></div>
                    <div className="space-y-2"><Label>Odkaz</Label><Input {...register('heroButtonLink')} /></div>
                </CardContent>
             </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Sekce O nás</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Nadpis</Label><Input {...register('aboutTitle')} /></div>
              <div className="space-y-2"><Label>Popis</Label><Textarea {...register('aboutDescription')} rows={4} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hodnoty / Karty</CardTitle>
              <CardDescription>Vyberte ikonu a doplňte text pro karty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aboutCards.map((card, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold">Karta {index + 1}</h4>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setValue('aboutCards', aboutCards.filter((_, i) => i !== index))} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    {/* ICON PICKER */}
                    <div className="space-y-2">
                      <Label>Ikona</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-16 h-16 p-0 flex flex-col items-center justify-center border-2 border-primary/20 hover:border-primary">
                            {(() => {
                              const SelectedIcon = AVAILABLE_ICONS.find(i => i.name === card.icon)?.icon || Star
                              return <SelectedIcon className="h-8 w-8 text-primary" />
                            })()}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3" align="start">
                          <div className="grid grid-cols-4 gap-2">
                            {AVAILABLE_ICONS.map((item) => (
                              <Button
                                key={item.name}
                                type="button"
                                variant="ghost"
                                className={cn("h-12 w-12 p-0", card.icon === item.name && "bg-primary/10 border-primary border")}
                                onClick={() => updateAboutCard(index, 'icon', item.name)}
                              >
                                <item.icon className="h-6 w-6" />
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex-1 space-y-3">
                      <Input placeholder="Nadpis" value={card.title} onChange={(e) => updateAboutCard(index, 'title', e.target.value)} />
                      <Textarea placeholder="Popis" value={card.description} onChange={(e) => updateAboutCard(index, 'description', e.target.value)} rows={2} />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => setValue('aboutCards', [...aboutCards, { title: '', description: '', icon: 'Star' }])}>
                <Plus className="mr-2 h-4 w-4" /> Přidat kartu
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}