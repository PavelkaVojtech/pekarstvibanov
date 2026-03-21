"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BackButtonProps {
    categoryName: string
}

export function BackButton({ categoryName }: BackButtonProps) {
    const router = useRouter()
    
    return (
        <Button 
            variant="ghost" 
            className="pl-0 hover:bg-transparent hover:text-primary"
            onClick={() => router.back()}
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na {categoryName.toLowerCase()}
        </Button>
    )
}
