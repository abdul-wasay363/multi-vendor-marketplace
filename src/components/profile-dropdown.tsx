"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { LayoutDashboard, ShoppingBag, PlusCircle, LogOut, Settings, ShieldAlert } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cart" // <-- ADD THIS IMPORT

interface ProfileDropdownProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  role: string;
}

export function ProfileDropdown({ user, role }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    // 1. WIPE THE CART! This destroys the local storage data before they leave.
    useCartStore.getState().clearCart();

    // 2. Proceed with normal sign out
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
          router.refresh()
        }
      }
    })
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-9 w-9 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-colors overflow-hidden"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-zinc-600 tracking-wider">{initials}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
          
          <div className="px-3 py-2 border-b border-zinc-100 mb-1">
            <p className="text-sm font-semibold text-zinc-900 truncate">{user.name}</p>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
            <span className="inline-flex items-center rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 mt-1.5 uppercase tracking-wider">
              {role}
            </span>
          </div>

          <div className="space-y-0.5">

            {/* SELLER EXCLUSIVE LINKS */}
            {role === "SELLER" && (
              <>
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors font-medium"
                >
                  <LayoutDashboard className="h-4 w-4 text-zinc-400" />
                  Vendor Dashboard
                </Link>
                <Link
                  href="/products/new"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors font-medium"
                >
                  <PlusCircle className="h-4 w-4 text-zinc-400" />
                  Add New Product
                </Link>
              </>
            )}

            {/* BUYER & SELLER EXCLUSIVE LINK (Admins don't need personal purchase history) */}
            {role !== "ADMIN" && (
              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors font-medium"
              >
                <ShoppingBag className="h-4 w-4 text-zinc-400" />
                My Purchases
              </Link>
            )}

            {/* UNIVERSAL LINKS (Everyone gets Settings and Log Out) */}
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors font-medium"
            >
              <Settings className="h-4 w-4 text-zinc-400" />
              Account Settings
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium border-t border-zinc-100 mt-1 pt-2"
            >
              <LogOut className="h-4 w-4 text-red-400" />
              Log Out
            </button>

          </div>
        </div>
      )}
    </div>
  )
}