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
import { Loader2, Plus, Trash2, Save } from 'lucide-react'
import { updateSiteSettings } from '@/app/actions/settings'
import { Switch } from '@/components/ui/switch'

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

// Schéma formuláře
const formSchema = z.object({
  // Kontakt
  phone: z.string().min(1, 'Telefon je povinný'),
  email: z.string().email('Neplatný email'),
  address: z.string().min(1, 'Adresa je povinná'),
  mapIframeSrc: z.string().url('Neplatná URL'),
  openingHours: z.array(
    z.object({
      day: z.string(),
      hours: z.string(),
      closed: z.boolean(),
    })
  ),

  // Hero
  heroTitle: z.string().min(1, 'Nadpis je povinný'),
  heroSubtitle: z.string().min(1, 'Podnadpis je povinný'),
  heroButtonText: z.string().min(1, 'Text tlačítka je povinný'),
  heroButtonLink: z.string().min(1, 'Odkaz je povinný'),
  heroImageUrl: z.string().nullable(),

  // About
  aboutTitle: z.string().min(1, 'Nadpis je povinný'),
  aboutDescription: z.string().min(1, 'Popis je povinný'),
  aboutCards: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string(),
    })
  ),

  // Sociální sítě
  facebookUrl: z.string().nullable(),
  instagramUrl: z.string().nullable(),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  initialSettings: SiteSettings
}

export function SettingsForm({ initialSettings }: Props) {
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openingHours: [],
      aboutCards: [],
    },
  })

  const openingHours = watch('openingHours')
  const aboutCards = watch('aboutCards')

  // Načtení nastavení při mount
  useEffect(() => {
    // Parsování JSON polí
    const parsedOpeningHours = typeof initialSettings.openingHours === 'string' 
      ? JSON.parse(initialSettings.openingHours) 
      : initialSettings.openingHours

    const parsedAboutCards = typeof initialSettings.aboutCards === 'string'
      ? JSON.parse(initialSettings.aboutCards)
      : initialSettings.aboutCards

    // Nastavení hodnot formuláře
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
      // Převod na formát pro server
      const payload = {
        ...data,
        openingHours: JSON.stringify(data.openingHours),
        aboutCards: JSON.stringify(data.aboutCards),
        heroImageUrl: data.heroImageUrl || null,
        facebookUrl: data.facebookUrl || null,
        instagramUrl: data.instagramUrl || null,
      }

      const result = await updateSiteSettings(payload)

      if (result.success) {
        toast({
          title: 'Úspěch',
          description: 'Nastavení bylo uloženo',
        })
      } else {
        toast({
          title: 'Chyba',
          description: result.error || 'Nepodařilo se uložit nastavení',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Chyba při ukládání:', error)
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se uložit nastavení',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Funkce pro správu otevírací doby
  const addOpeningHour = () => {
    setValue('openingHours', [
      ...openingHours,
      { day: '', hours: '', closed: false },
    ])
  }

  const removeOpeningHour = (index: number) => {
    setValue(
      'openingHours',
      openingHours.filter((_, i) => i !== index)
    )
  }

  const updateOpeningHour = (index: number, field: 'day' | 'hours' | 'closed', value: string | boolean) => {
    const updated = [...openingHours]
    updated[index] = { ...updated[index], [field]: value }
    setValue('openingHours', updated)
  }

  // Funkce pro správu about karet
  const addAboutCard = () => {
    setValue('aboutCards', [
      ...aboutCards,
      { title: '', description: '', icon: 'Star' },
    ])
  }

  const removeAboutCard = (index: number) => {
    setValue(
      'aboutCards',
      aboutCards.filter((_, i) => i !== index)
    )
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
          <h2 className="text-3xl font-bold tracking-tight font-serif">Nastavení webu</h2>
          <p className="text-muted-foreground">Správa obsahu a informací na webu</p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? (            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ukládám...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Uložit změny            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contact">Obecné & Kontakt</TabsTrigger>
          <TabsTrigger value="hero">Úvodní stránka</TabsTrigger>
          <TabsTrigger value="about">Sekce O nás</TabsTrigger>
        </TabsList>

        {/* Tab: Kontakt */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kontaktní informace</CardTitle>
              <CardDescription>Základní kontaktní údaje zobrazené na webu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" {...register('phone')} placeholder="+420 123 456 789" />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} placeholder="info@pekarna.cz" />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresa</Label>
                <Input id="address" {...register('address')} placeholder="Ulice 123, 123 45 Město" />
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mapIframeSrc">URL mapy (iframe src)</Label>
                <Input
                  id="mapIframeSrc"
                  {...register('mapIframeSrc')}
                  placeholder="https://maps.google.com/maps?q=..."
                />
                {errors.mapIframeSrc && (
                  <p className="text-sm text-destructive">{errors.mapIframeSrc.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Otevírací doba</CardTitle>
              <CardDescription>Přidejte nebo upravte otevírací hodiny</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {openingHours.map((item, index) => (
                <div key={index} className="flex gap-3 items-start p-4 border rounded-lg">
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Den (např. Po - Pá)"
                      value={item.day}
                      onChange={(e) => updateOpeningHour(index, 'day', e.target.value)}
                    />
                    <Input
                      placeholder="Hodiny (např. 7:00 - 15:00)"
                      value={item.hours}
                      onChange={(e) => updateOpeningHour(index, 'hours', e.target.value)}
                    />
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`closed-${index}`}
                        checked={item.closed}
                        onCheckedChange={(checked) => updateOpeningHour(index, 'closed', checked)}
                      />
                      <Label htmlFor={`closed-${index}`}>Zavřeno</Label>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOpeningHour(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addOpeningHour}>
                <Plus className="mr-2 h-4 w-4" />
                Přidat den
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sociální sítě</CardTitle>
              <CardDescription>Odkazy na vaše sociální média</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">Facebook URL</Label>
                <Input
                  id="facebookUrl"
                  {...register('facebookUrl')}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagramUrl">Instagram URL</Label>
                <Input
                  id="instagramUrl"
                  {...register('instagramUrl')}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Hero (Úvodní stránka) */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Úvodní sekce (Hero)</CardTitle>
              <CardDescription>Nastavení hlavní úvodní sekce na domovské stránce</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Hlavní nadpis</Label>
                <Input id="heroTitle" {...register('heroTitle')} placeholder="Pečeme s láskou" />
                {errors.heroTitle && <p className="text-sm text-destructive">{errors.heroTitle.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Podnadpis</Label>
                <Input
                  id="heroSubtitle"
                  {...register('heroSubtitle')}
                  placeholder="Chléb • Rohlíky • Tradice"
                />
                {errors.heroSubtitle && (
                  <p className="text-sm text-destructive">{errors.heroSubtitle.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroButtonText">Text tlačítka</Label>
                <Input id="heroButtonText" {...register('heroButtonText')} placeholder="Naše nabídka" />
                {errors.heroButtonText && (
                  <p className="text-sm text-destructive">{errors.heroButtonText.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroButtonLink">Odkaz tlačítka</Label>
                <Input id="heroButtonLink" {...register('heroButtonLink')} placeholder="/produkty" />
                {errors.heroButtonLink && (
                  <p className="text-sm text-destructive">{errors.heroButtonLink.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroImageUrl">URL obrázku na pozadí (volitelné)</Label>
                <Input
                  id="heroImageUrl"
                  {...register('heroImageUrl')}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: About */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sekce O nás</CardTitle>
              <CardDescription>Nastavení sekce "O nás" na webu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aboutTitle">Nadpis</Label>
                <Input
                  id="aboutTitle"
                  {...register('aboutTitle')}
                  placeholder="Vůně, která spojuje generace"
                />
                {errors.aboutTitle && (
                  <p className="text-sm text-destructive">{errors.aboutTitle.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutDescription">Popis</Label>
                <Textarea
                  id="aboutDescription"
                  {...register('aboutDescription')}
                  rows={4}
                  placeholder="Naše pekařství..."
                />
                {errors.aboutDescription && (
                  <p className="text-sm text-destructive">{errors.aboutDescription.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hodnoty / Karty</CardTitle>
              <CardDescription>Přidejte nebo upravte karty v sekci O nás</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aboutCards.map((card, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Karta {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAboutCard(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Nadpis karty"
                    value={card.title}
                    onChange={(e) => updateAboutCard(index, 'title', e.target.value)}
                  />
                  <Textarea
                    placeholder="Popis karty"
                    value={card.description}
                    onChange={(e) => updateAboutCard(index, 'description', e.target.value)}
                    rows={3}
                  />
                  <Input
                    placeholder="Ikona (Wheat, Leaf, Users, Star...)"
                    value={card.icon}
                    onChange={(e) => updateAboutCard(index, 'icon', e.target.value)}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addAboutCard}>
                <Plus className="mr-2 h-4 w-4" />
                Přidat kartu
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ukládám...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Uložit všechny změny
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
