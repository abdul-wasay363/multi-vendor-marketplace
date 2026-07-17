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



// import Link from "next/link"
// import { auth } from "@/lib/auth"
// import { headers } from "next/headers"
// import { SignOutButton } from "./sign-out-button"
// import { CartWidget } from "./cart-widget"

// export async function Navbar() {
//   // 1. Fetch the direct database session status on the server side
//   const session = await auth.api.getSession({
//     headers: await headers()
//   });

//   return (
//     <header className="border-b border-zinc-200 bg-white">
//       <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
//         {/* Left Side: Navigation Links */}
//         <div className="flex items-center gap-6">
//           <Link href="/" className="text-xl font-bold text-zinc-900 tracking-tight">
//             MultiVendor
//           </Link>
//           <Link href="/products" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
//             Dashboard
//           </Link>
//         </div>

//         {/* Right Side: Conditional Auth Interface */}
//         <div className="flex items-center gap-4">
//           <CartWidget /> {/* <-- ADD THE CART WIDGET HERE */}
//           {session ? (
//             // State A: User is Authenticated. Display name & Sign Out button.
//             <>
//               <span className="text-sm text-zinc-600">
//                 Welcome back, <strong className="font-semibold text-zinc-900">{session.user.name}</strong>
//               </span>

//               {/* ADD THIS NEW LINK */}
//               <Link href="/orders" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
//                 My Orders
//               </Link>

//               <SignOutButton />
//             </>
//           ) : (
//             // State B: User is Unauthenticated. Display the standard Login link.
//             <Link
//               href="/login"
//               className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 transition-colors"
//             >
//               Log In
//             </Link>
//           )}
//         </div>

//       </div>
//     </header>
//   )
// }




// import Link from "next/link";

// export default function Navbar() {
//   return (
//     <nav className="w-full bg-white border-b border-zinc-200 sticky top-0 z-50">
//       <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
//         <div className="flex items-center gap-6">
//           <span className="font-bold text-xl text-zinc-900 tracking-tight">
//             Marketplace Admin
//           </span>
//           <div className="flex items-center gap-4 text-sm font-medium">
//             <Link 
//               href="/" 
//               className="text-zinc-600 hover:text-zinc-900 transition-colors"
//             >
//               Users
//             </Link>
//             <Link 
//               href="/products" 
//               className="text-zinc-600 hover:text-zinc-900 transition-colors"
//             >
//               Products
//             </Link>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
//           <span className="text-xs text-zinc-500 font-mono">Database Online</span>
//         </div>
//       </div>
//     </nav>
//   );
// }

