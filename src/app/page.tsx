import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Package, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  // 1. THE ADMIN INTERCEPTOR
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (session) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    
    // If they are an Admin, kick them off the public store and into the control panel
    if (dbUser?.role === "ADMIN") {
      redirect("/admin");
    }
  }

  // 2. Fetch the products for standard buyers/sellers
  const products = await prisma.product.findMany({
    include: { seller: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white">
      
      {/* SECTION 1: Animated Hero */}
      <div className="relative overflow-hidden bg-zinc-50 pt-16 sm:pt-24 lg:pt-32 pb-16 border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <span className="inline-block py-1 px-3 rounded-full bg-zinc-200 text-zinc-800 text-xs font-bold tracking-widest uppercase mb-6">
            The Future of Commerce
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 tracking-tight mb-8">
            Discover extraordinary <br className="hidden md:block"/> products, everyday.
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 mb-10">
            Join thousands of buyers and independent sellers on the world's most secure, lightning-fast digital marketplace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#products">
              <Button size="lg" className="h-14 px-8 text-base rounded-full bg-zinc-900 hover:bg-zinc-800">
                Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            {!session && (
              <Link href="/signup">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-zinc-300">
                  Become a Seller
                </Button>
              </Link>
            )}
          </div>
        </div>
        {/* Decorative Background Gradient */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      </div>

      {/* SECTION 2: Trust & Value Props */}
      <div className="border-b border-zinc-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-100">
            <div className="flex flex-col items-center px-4 pt-4 md:pt-0">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Secure Payments</h3>
              <p className="text-sm text-zinc-500 mt-2">Every transaction is protected by enterprise-grade Stripe encryption.</p>
            </div>
            <div className="flex flex-col items-center px-4 pt-8 md:pt-0">
              <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Live Order Tracking</h3>
              <p className="text-sm text-zinc-500 mt-2">Know exactly where your package is with real-time vendor updates.</p>
            </div>
            <div className="flex flex-col items-center px-4 pt-8 md:pt-0">
              <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Instant Fulfillment</h3>
              <p className="text-sm text-zinc-500 mt-2">Vendors are notified the second your payment clears the bank.</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: The Product Grid */}
      <div id="products" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Trending Now</h2>
            <p className="text-zinc-500 mt-2">The latest drops from our top-rated vendors.</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 bg-zinc-50 rounded-2xl border border-zinc-200 border-dashed">
            <Package className="mx-auto h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 text-lg font-bold text-zinc-900">No products yet</h3>
            <p className="mt-2 text-zinc-500">Be the first vendor to list an item!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                sellerName={product.seller.name || "Unknown"}
                sellerId={product.sellerId}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}