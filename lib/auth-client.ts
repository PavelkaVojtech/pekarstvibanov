import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    // baseURL will be inferred from window.location.origin
})