import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // Tell the frontend exactly where the server lives
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});