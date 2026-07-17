import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import Link from "next/link"
import { PlusCircle, Package, DollarSign, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteProduct } from "@/actions/product"

export default async function ProductsDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  // 1. Fetch Inventory
  const vendorProducts = await prisma.product.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // 2. THE UPGRADE: Fetch unique Orders that contain this vendor's items!
  const vendorOrders = await prisma.order.findMany({
    where: {
      items: { some: { sellerId: session.user.id } } // Only get orders where this vendor sold something
    },
    include: {
      buyer: { select: { name: true, email: true } },
      items: {
        where: { sellerId: session.user.id }, // Only pull this vendor's specific items out of the box!
        include: { product: { select: { name: true } } }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  // Business Math (Calculate metrics by looping through the grouped orders)
  const totalListings = vendorProducts.length;
  let itemsSold = 0;
  let revenueCents = 0;
  
  vendorOrders.forEach(order => {
    order.items.forEach(item => {
      itemsSold += item.quantity;
      revenueCents += (item.priceAtEpoch * item.quantity);
    });
  });
  
  const totalRevenue = (revenueCents / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-zinc-50/50 p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Vendor Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage your inventory and fulfill orders.</p>
          </div>
          <Link href="/products/new">
            <Button className="w-full sm:w-auto font-semibold shadow-sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>

        {/* Top Level Business Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-700">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Revenue</p>
              <h2 className="text-2xl font-bold text-zinc-900">${totalRevenue}</h2>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Items Sold</p>
              <h2 className="text-2xl font-bold text-zinc-900">{itemsSold}</h2>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-700">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Active Listings</p>
              <h2 className="text-2xl font-bold text-zinc-900">{totalListings}</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Inventory */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-zinc-900">Your Inventory</h3>
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              {vendorProducts.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">No products listed yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/50 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                        <th className="py-3 px-6">Product</th>
                        <th className="py-3 px-6">Status</th>
                        <th className="py-3 px-6">Price</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 text-sm text-zinc-700">
                      {vendorProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="py-4 px-6 font-medium text-zinc-900">{product.name}</td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                              Live
                            </span>
                          </td>
                          <td className="py-4 px-6 font-mono font-medium">${(product.price / 100).toFixed(2)}</td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Link href={`/products/edit/${product.id}`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Edit</Link>
                              <form action={deleteProduct}>
                                <input type="hidden" name="id" value={product.id} />
                                <button type="submit" className="text-sm text-red-600 hover:text-red-800 font-medium">Delete</button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* UPGRADED: Orders Grouped by Buyer */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-900">Pending Orders</h3>
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              {vendorOrders.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">No pending orders.</div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {vendorOrders.map((order) => {
                    // Calculate how many items THIS vendor needs to ship for this order
                    const itemsToShip = order.items.reduce((sum, item) => sum + item.quantity, 0);
                    
                    // See if there are any unfulfilled items left
                    const allShipped = order.items.every(item => item.status === "DELIVERED" || item.status === "SHIPPED");

                    return (
                      <div key={order.id} className="p-4 hover:bg-zinc-50/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-semibold text-sm text-zinc-900 block">{order.buyer.name || "Guest"}</span>
                            <span className="text-xs text-zinc-500 block">Order #{order.id.slice(-8).toUpperCase()}</span>
                          </div>
                          {allShipped ? (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 border border-green-200 uppercase tracking-wider">
                              Fulfilled
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-bold text-yellow-800 border border-yellow-200 uppercase tracking-wider">
                              Needs Action
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100">
                          <span className="text-xs font-medium text-zinc-500">
                            {itemsToShip} item{itemsToShip > 1 ? 's' : ''} to ship
                          </span>
                          
                          {/* Dedicated Fulfillment Page Link */}
                          <Link href={`/products/orders/${order.id}`}>
                            <Button size="sm" variant="outline" className="h-7 text-xs font-semibold">
                              Manage <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}