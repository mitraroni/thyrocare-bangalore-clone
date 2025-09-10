"use client"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
   // point to Better Auth API route for correct cookie/session handling
   baseURL: "/api/auth",
});

// Export the built-in hook directly for reliable session hydration
export const useSession = authClient.useSession;