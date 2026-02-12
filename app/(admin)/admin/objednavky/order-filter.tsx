"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useCallback, useState } from "react"

export function OrderFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("query") || "")

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === "ALL") {
          newParams.delete(key)
        } else {
          newParams.set(key, value)
        }
      }
      return newParams.toString()
    },
    [searchParams]
  )

  const handleSearch = () => {
    router.push(`?${createQueryString({ query: search || null })}`)
  }

  const resetFilters = () => {
    setSearch("")
    router.push("/admin/objednavky")
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Hledat podle čísla objednávky nebo jména"
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>

      <Select
        defaultValue={searchParams.get("status") || "ALL"}
        onValueChange={(v) => router.push(`?${createQueryString({ status: v })}`)}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Stav" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Všechny stavy</SelectItem>
          <SelectItem value="PENDING">Čeká na schválení</SelectItem>
          <SelectItem value="CONFIRMED">Schváleno</SelectItem>
          <SelectItem value="BAKING">Ve výrobě</SelectItem>
          <SelectItem value="READY">Připraveno</SelectItem>
          <SelectItem value="COMPLETED">Dokončeno</SelectItem>
          <SelectItem value="CANCELLED">Zrušeno</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("type") || "ALL"}
        onValueChange={(v) => router.push(`?${createQueryString({ type: v })}`)}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Typ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Všechny typy</SelectItem>
          <SelectItem value="ONE_TIME">Jednorázové</SelectItem>
          <SelectItem value="RECURRING">Pravidelné</SelectItem>
        </SelectContent>
      </Select>

      {(searchParams.toString() !== "" || search !== "") && (
        <Button variant="ghost" onClick={resetFilters} className="px-2">
          <X className="mr-2 h-4 w-4" /> Zrušit
        </Button>
      )}
    </div>
  )
}