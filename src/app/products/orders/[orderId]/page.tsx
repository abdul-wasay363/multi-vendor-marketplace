import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Package, Truck, ArrowLeft, MapPin } from "lucide-react"
import Link from "next/link"
import { updateOrderItemStatus } from "@/actions/order"

export default async function VendorOrderDetails({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { orderId } = await params;

  // Fetch the specific order, but ONLY include items belonging to this vendor
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { name: true, email: true } },
      items: {
        where: { sellerId: session.user.id },
        include: { product: { select: { name: true, imageUrl: true } } }
      }
    }
  });

  // Security: If the order doesn't exist, or this vendor has zero items in it, kick them out.
  if (!order || order.items.length === 0) {
    redirect("/products");
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Navigation */}
        <Link href="/products" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Fulfill Order</h1>
            <p className="text-sm font-mono text-zinc-500 mt-1">ID: #{order.id}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm font-medium text-zinc-500">Ordered On</p>
            <p className="font-semibold text-zinc-900">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Customer Details Column */}
          <div className="space-y-6 md:col-span-1">
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-zinc-900 mb-4">Customer Details</h3>
              <p className="font-medium text-sm text-zinc-900">{order.buyer.name}</p>
              <p className="text-sm text-zinc-500 mb-4">{order.buyer.email}</p>
              
              <div className="flex items-start gap-2 pt-4 border-t border-zinc-100">
                <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                <p className="text-sm text-zinc-700 leading-relaxed">
                  {order.shippingAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Items to Fulfill Column */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-zinc-900 px-1">Items to Ship</h3>
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden divide-y divide-zinc-100">
              
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                  
                  {/* Product Info */}
                  <div className="flex-1 flex gap-4">
                    <div className="h-20 w-20 bg-zinc-100 rounded-md border border-zinc-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-8 w-8 text-zinc-300" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 line-clamp-1">{item.product.name}</h4>
                      <p className="text-sm font-bold text-zinc-900 mt-1">
                        ${(item.priceAtEpoch / 100).toFixed(2)} <span className="text-zinc-500 font-medium">each</span>
                      </p>
                      <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 mt-2">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Status Update Form */}
                  <div className="sm:w-48 flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-zinc-100 pt-4 sm:pt-0 sm:pl-6">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Update Status</p>
                    <form action={updateOrderItemStatus} className="flex gap-2">
                      <input type="hidden" name="orderItemId" value={item.id} />
                      <select 
                        key={`${item.id}-${item.status}`}
                        name="status" 
                        defaultValue={item.status}
                        className={`text-sm border rounded-md py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-zinc-900 font-semibold flex-1 ${
                          item.status === "PENDING" ? "bg-yellow-50 text-yellow-800 border-yellow-200" :
                          item.status === "SHIPPED" ? "bg-blue-50 text-blue-800 border-blue-200" :
                          "bg-green-50 text-green-800 border-green-200"
                        }`}
                      >
                        <option value="PENDING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
                      <button 
                        type="submit"
                        className="bg-zinc-900 text-white p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
                        title="Save Status"
                      >
                        <Truck className="h-4 w-4" />
                      </button>
                    </form>
                  </div>

                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}