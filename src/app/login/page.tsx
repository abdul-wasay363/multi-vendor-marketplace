"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { authClient } from "@/lib/auth-client" // 1. Import our Better Auth client
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Stop the page from refreshing
    setLoading(true);
    setError("");
    
    // Grab the data from the form inputs
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 2. Call Better Auth's built-in sign in method
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      setError(error.message || "An unexpected error occurred. Please try again."); // Instantly show the error on screen
      setLoading(false);
    } else {
      router.push("/");
      router.refresh(); // Force Next.js to fetch the new authorized state
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 py-12">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border border-zinc-200">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Welcome Back</h1>
          <p className="text-zinc-500 text-sm mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          {/* Conditional Error Box */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="sarah@example.com" required />
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don&apos;t have an account? <Link href="/register" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
        </p>

      </div>
    </main>
  )
}