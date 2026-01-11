"use client"

import { useActionState, useEffect, useRef } from "react"
import { createProduct, type CreateProductState } from "@/app/(admin)/admin/produkty/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, Loader2 } from "lucide-react"

interface ProductFormProps {
  categories: { id: string; name: string }[]
}

export function ProductForm({ categories }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(createProduct, null as CreateProductState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state?.success])

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      
      {state?.error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-md">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 rounded-md">
          Produkt byl úspěšně uložen.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Název produktu</Label>
        <Input id="name" name="name" placeholder="Např. Škvarkový chléb" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Popis</Label>
        <Textarea 
          id="description" 
          name="description" 
          placeholder="Složení, chuť, alergeny..." 
          rows={4} 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Cena (Kč)</Label>
          <Input 
              id="price" 
              name="price" 
              type="number" 
              step="1" 
              min="0" 
              placeholder="45" 
              required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategorie</Label>
          <Select name="categoryId" required>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Vyberte kategorii" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-xl z-50">
              {categories.map((cat) => {
                if (!cat.id) return null;
                return (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Obrázek</Label>
        <Input 
          id="image" 
          name="image" 
          type="file"
          accept="image/*"
          className="cursor-pointer bg-background"
        />
        <p className="text-xs text-muted-foreground">
          Obrázek se aktuálně neukládá.
        </p>
      </div>

      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-background">
        <Checkbox id="isAvailable" name="isAvailable" defaultChecked value="on" />
        <div className="space-y-1 leading-none">
          <Label htmlFor="isAvailable" className="cursor-pointer">
            Produkt je dostupný k prodeji
          </Label>
          <p className="text-sm text-muted-foreground">
            Pokud odškrtnete, zákazníci produkt neuvidí.
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full font-bold" disabled={isPending}>
        {isPending ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ukládám...
            </>
        ) : (
            <>
                <Save className="mr-2 h-4 w-4" /> Uložit produkt
            </>
        )}
      </Button>
    </form>
  )
}