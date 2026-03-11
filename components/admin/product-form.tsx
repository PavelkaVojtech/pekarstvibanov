"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { createProduct, updateProduct, type CreateProductState } from "@/app/(admin)/admin/produkty/actions"
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
import { Save, Loader2, Trash2, Star } from "lucide-react"
import Image from "next/image"

interface ProductFormProps {
  categories: { id: string; name: string }[]
  product?: {
    id: string
    name: string
    description: string | null
    price: number
    categoryId: string
    isAvailable: boolean
    images: {
      id: string
      imageUrl: string
      isPrimary: boolean
    }[]
  }
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const action = product ? updateProduct.bind(null, product.id) : createProduct
  const [state, formAction, isPending] = useActionState(action, null as CreateProductState)
  const formRef = useRef<HTMLFormElement>(null)
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(
    product?.images.find((img) => img.isPrimary)?.id ?? product?.images[0]?.id ?? null
  )

  const visibleImages = (product?.images ?? []).filter((img) => !removedImageIds.includes(img.id))

  useEffect(() => {
    if (state?.success && !product) {
      formRef.current?.reset()
      setRemovedImageIds([])
      setPrimaryImageId(null)
    }
  }, [state?.success, product])

  useEffect(() => {
    if (!product) return
    if (visibleImages.length === 0) {
      setPrimaryImageId(null)
      return
    }
    if (!primaryImageId || !visibleImages.some((img) => img.id === primaryImageId)) {
      setPrimaryImageId(visibleImages[0].id)
    }
  }, [primaryImageId, product, visibleImages])

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      
      {state?.error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-md">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 rounded-md">
          Hotovo.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Název</Label>
        <Input
          id="name"
          name="name"
          defaultValue={product?.name}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Popis</Label>
        <Textarea 
          id="description" 
          name="description" 
          rows={4} 
          defaultValue={product?.description || ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Cena</Label>
          <Input 
              id="price" 
              name="price" 
              type="text" 
              inputMode="decimal"
              min="0" 
              defaultValue={product ? product.price.toFixed(2).replace(".", ",") : undefined}
              required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategorie</Label>
          <Select name="categoryId" required defaultValue={product?.categoryId}>
            <SelectTrigger className="bg-background">
              <SelectValue />
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

      <div className="space-y-4">
        <Label>Fotky produktu</Label>

        {product && (
          <div className="space-y-3">
            {visibleImages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Produkt zatím nemá uložené fotky.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {visibleImages.map((img) => (
                  <div key={img.id} className="rounded-md border p-2 space-y-2">
                    <div className="relative aspect-square rounded overflow-hidden bg-muted">
                      <Image
                        src={img.imageUrl}
                        alt="Obrázek produktu"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="primaryImagePicker"
                        checked={primaryImageId === img.id}
                        onChange={() => setPrimaryImageId(img.id)}
                      />
                      <Star className="h-3.5 w-3.5" /> Primární
                    </label>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => setRemovedImageIds((prev) => [...prev, img.id])}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Odebrat
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <input type="hidden" name="removedImageIds" value={JSON.stringify(removedImageIds)} />
        <input type="hidden" name="primaryImageId" value={primaryImageId ?? ""} />

        <Input
          id="images"
          name="images"
          type="file"
          multiple
          accept="image/webp, image/jpeg, image/png"
          className="cursor-pointer bg-background"
        />
        <p className="text-xs text-muted-foreground">Můžeš nahrát více fotek najednou. První fotka bude primární, pokud žádná primární zatím není.</p>
      </div>

      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-background">
        <Checkbox id="isAvailable" name="isAvailable" defaultChecked={product?.isAvailable ?? true} value="on" />
        <div className="space-y-1 leading-none">
          <Label htmlFor="isAvailable" className="cursor-pointer">
            Dostupné
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full font-bold" disabled={isPending}>
        {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
            <Save className="h-4 w-4" />
        )}
      </Button>
    </form>
  )
}