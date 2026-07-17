import Link from "next/link";
import { ShoppingBag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ProfileDropdown } from "./profile-dropdown";
import { CartWidget } from "./cart-widget";

export async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  let user = null;
  let role = "BUYER";

  if (session) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true, role: true },
    });
    if (user) role = user.role;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 sm:gap-8">
          
          {/* Left Side: Logo & Main Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 hidden sm:block">
                Marketplace
              </span>
            </Link>

            {/* NEW: Corporate Navigation Links (Hidden on small mobile) */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-500">
              <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
              <Link href="/#products" className="hover:text-zinc-900 transition-colors">Shop</Link>
              <Link href="/about" className="hover:text-zinc-900 transition-colors">About Us</Link>
              <Link href="/contact" className="hover:text-zinc-900 transition-colors">Contact</Link>
            </div>
          </div>

          {/* Right Side: Interactive Widgets & Session Control */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
            
            {/* Search Bar (Placeholder for visual polish) */}
            <div className="hidden lg:flex items-center relative max-w-xs w-full mr-4">
              <Search className="absolute left-3 h-4 w-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-9 pr-4 py-2 bg-zinc-100 border-transparent rounded-full text-sm focus:bg-white focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
              />
            </div>

            {/* Only show the cart if they are NOT an Admin */}
            {role !== "ADMIN" && <CartWidget />}

            {session && user ? (
              <ProfileDropdown user={user} role={role} />
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" className="font-semibold text-zinc-600 hover:text-zinc-900">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="font-semibold bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-6">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}