import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ShieldAlert, Users, Save, Package, ShoppingCart, DollarSign } from "lucide-react";
import { updateUserRole } from "@/actions/admin";

export default async function AdminDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user.id;

  // 1. Fetch All Users
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch All Products (Include Seller Name)
  const allProducts = await prisma.product.findMany({
    include: { seller: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  // 3. Fetch All Orders (Include Buyer Name)
  const allOrders = await prisma.order.findMany({
    include: { buyer: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Calculate Platform Metrics
  const totalUsers = allUsers.length;
  const totalProducts = allProducts.length;
  const totalOrders = allOrders.length;
  const platformRevenueCents = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const platformRevenue = (platformRevenueCents / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-purple-600" />
              Master Control Panel
            </h1>
            <p className="text-zinc-500 mt-2">Oversee all users, products, and financial transactions.</p>
          </div>
        </div>

        {/* Top Level Platform Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-zinc-100 rounded-lg text-zinc-700">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Users</p>
              <h2 className="text-2xl font-bold text-zinc-900">{totalUsers}</h2>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Platform Products</p>
              <h2 className="text-2xl font-bold text-zinc-900">{totalProducts}</h2>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg text-orange-700">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Orders</p>
              <h2 className="text-2xl font-bold text-zinc-900">{totalOrders}</h2>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-700">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Gross Revenue</p>
              <h2 className="text-2xl font-bold text-zinc-900">${platformRevenue}</h2>
            </div>
          </div>
        </div>

        {/* SECTION 1: User Management */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
            <h2 className="text-lg font-bold text-zinc-900">User Ledger</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500 font-semibold bg-zinc-50">
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Joined</th>
                  <th className="py-3 px-6 text-right">Role Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-sm text-zinc-700">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-900 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs font-bold text-zinc-400 uppercase">
                            {user.name.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      {user.name}
                    </td>
                    <td className="py-4 px-6 text-zinc-500">{user.email}</td>
                    <td className="py-4 px-6 text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {user.id === currentUserId ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">
                          Current Account
                        </span>
                      ) : (
                        <form action={updateUserRole} className="flex items-center justify-end gap-2">
                          <input type="hidden" name="userId" value={user.id} />
                          <select 
                            key={`${user.id}-${user.role}`} 
                            name="role" 
                            defaultValue={user.role}
                            className="text-sm border border-zinc-200 rounded-md py-1.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent font-medium"
                          >
                            <option value="BUYER">BUYER</option>
                            <option value="SELLER">SELLER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <button 
                            type="submit"
                            className="bg-zinc-900 text-white p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
                            title="Save Role"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: Global Products Ledger */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
            <h2 className="text-lg font-bold text-zinc-900">Platform Inventory Ledger</h2>
          </div>
          <div className="overflow-x-auto">
            {allProducts.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No products have been listed on the platform yet.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500 font-semibold bg-zinc-50">
                    <th className="py-3 px-6">Product Name</th>
                    <th className="py-3 px-6">Vendor</th>
                    <th className="py-3 px-6">Price</th>
                    <th className="py-3 px-6 text-right">Listed On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-sm text-zinc-700">
                  {allProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-zinc-900">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-zinc-100 rounded-md border border-zinc-200 overflow-hidden flex-shrink-0">
                            {product.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-full w-full p-2 text-zinc-300" />
                            )}
                          </div>
                          <span className="line-clamp-1">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-zinc-500">{product.seller.name}</td>
                      <td className="py-4 px-6 font-mono font-medium text-zinc-900">${(product.price / 100).toFixed(2)}</td>
                      <td className="py-4 px-6 text-zinc-500 text-right">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* SECTION 3: Global Orders Ledger */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
            <h2 className="text-lg font-bold text-zinc-900">Platform Transaction Ledger</h2>
          </div>
          <div className="overflow-x-auto">
            {allOrders.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No transactions have occurred yet.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500 font-semibold bg-zinc-50">
                    <th className="py-3 px-6">Order ID</th>
                    <th className="py-3 px-6">Buyer</th>
                    <th className="py-3 px-6">Payment Status</th>
                    <th className="py-3 px-6 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-sm text-zinc-700">
                  {allOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-medium text-zinc-500">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-4 px-6 text-zinc-900">
                        <div className="flex flex-col">
                          <span className="font-medium">{order.buyer.name}</span>
                          <span className="text-xs text-zinc-500">{order.buyer.email}</span>
                        </div>
                      </td>
                      {order.isPaid ? (
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                            Paid
                          </span>
                        </td>
                      ) : (
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700 border border-yellow-200">
                            Pending
                          </span>
                        </td>
                      )}
                      <td className="py-4 px-6 font-mono font-bold text-zinc-900 text-right">
                        ${(order.totalAmount / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}