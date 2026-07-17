"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);
    
    // Commands the Better Auth API to destroy the database row and clear the browser cookie
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh(); // Tells Next.js to pull the clean, logged-out state from the server
        }
      }
    });
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleSignOut}
      disabled={isPending}
    >
      {isPending ? "Logging out..." : "Sign Out"}
    </Button>
  )
}