import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "@/lib/auth" // Importujeme typ ze serverové konfigurace

export const authClient = createAuthClient({
    // baseURL se automaticky odvodí
    plugins: [
        inferAdditionalFields<typeof auth>() // Tady se stane ta magie s typy
    ]
})