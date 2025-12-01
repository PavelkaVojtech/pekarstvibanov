import Link from "next/link"
import { FaBreadSlice } from "react-icons/fa"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-background text-foreground text-center px-4 space-y-6">
      
      <div className="relative">
        <FaBreadSlice className="h-32 w-32 text-muted-foreground/20" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-primary">
            404
        </span>
      </div>

      <h1 className="text-4xl font-serif font-bold tracking-tight">
        Jejda! Tady žádný chleba není.
      </h1>
      
      <p className="text-xl text-muted-foreground max-w-md mx-auto">
        Stránka, kterou hledáte, se asi spálila v troubě nebo nikdy neexistovala.
      </p>

      <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold mt-4">
        <Link href="/">
          Zpět do pekárny
        </Link>
      </Button>
    </div>
  )
}