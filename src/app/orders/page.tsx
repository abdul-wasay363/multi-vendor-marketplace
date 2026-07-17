import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Package, Truck, CheckCircle2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ClearCart } from "@/components/clear-cart" // 1. Import the new wiper component!

export default async function OrdersPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  // 2. Check if Stripe sent us here after a successful payment
  const searchParams = await props.searchParams;
  const isSuccess = searchParams.success === "true";

  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: { select: { name: true, imageUrl: true } },
          seller: { select: { name: true } }
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* 3. THE FIX: If the URL contains ?success=true, render the wiper to clear the cart! */}
      {isSuccess && <ClearCart />}

      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Your Orders</h1>
          <p className="text-zinc-500 mt-2">Track the status of your recent purchases.</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-12 text-center flex flex-col items-center">
            <Package className="h-16 w-16 text-zinc-300 mb-4" />
            <h2 className="text-xl font-bold text-zinc-900 mb-2">No orders found</h2>
            <Link href="/"><Button>Start Shopping</Button></Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                
                {/* 1. Global Order Header */}
                <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <div>
                      <p className="font-medium text-zinc-500">Order Placed</p>
                      <p className="font-semibold text-zinc-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-500">Total</p>
                      <p className="font-semibold text-zinc-900">${(order.totalAmount / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-500">Order ID</p>
                      <p className="font-mono font-semibold text-zinc-900">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Individual Item Tracking */}
                <div className="p-6">
                  <div className="divide-y divide-zinc-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col gap-6">
                        
                        <div className="flex gap-4 sm:gap-6">
                          <div className="h-20 w-20 sm:h-24 sm:w-24 bg-zinc-100 rounded-md overflow-hidden flex-shrink-0 border border-zinc-200 flex items-center justify-center">
                            {item.product.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-8 w-8 text-zinc-300" />
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <h3 className="font-bold text-zinc-900 text-base sm:text-lg line-clamp-1">{item.product.name}</h3>
                            <p className="text-sm text-zinc-500 mt-1">Sold by {item.seller.name || "Unknown Vendor"}</p>
                            <div className="mt-2 flex items-center gap-4">
                              <span className="font-bold text-zinc-900">${(item.priceAtEpoch / 100).toFixed(2)}</span>
                              <span className="text-sm font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">Qty: {item.quantity}</span>
                            </div>
                          </div>
                        </div>

                        {/* Item Tracking Timeline */}
                        <div className="relative max-w-2xl mx-auto w-full px-4">
                          <div className="overflow-hidden h-1.5 mb-3 text-xs flex rounded-full bg-zinc-100">
                            <div style={{ width: item.status === 'PENDING' ? '15%' : item.status === 'SHIPPED' ? '50%' : '100%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-zinc-900 transition-all duration-500"></div>
                          </div>
                          <div className="flex justify-between w-full text-xs font-semibold text-zinc-500">
                            <div className={`flex flex-col items-center gap-1 text-zinc-900`}>
                              <ShoppingBag className="h-4 w-4" />
                              <span>Processing</span>
                            </div>
                            <div className={`flex flex-col items-center gap-1 ${(item.status === 'SHIPPED' || item.status === 'DELIVERED') ? 'text-zinc-900' : ''}`}>
                              <Truck className="h-4 w-4" />
                              <span>Shipped</span>
                            </div>
                            <div className={`flex flex-col items-center gap-1 ${item.status === 'DELIVERED' ? 'text-green-600' : ''}`}>
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Delivered</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  )
}