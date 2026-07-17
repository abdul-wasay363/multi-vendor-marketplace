"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // 1. Manually check if passwords match before hitting the server
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // 2. Call Better Auth's sign up method
    const { data, error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (error) {
      setError(error.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    } else {
      // Success! Auto-logged in. Route to the homepage.
      router.push("/");
      router.refresh();
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 py-12">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border border-zinc-200">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Create an Account</h1>
          <p className="text-zinc-500 text-sm mt-2">Join the marketplace today</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" type="text" placeholder="Abdul Wasay" required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="abdul@example.com" required />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
          </div>

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
        </p>

      </div>
    </main>
  )
}