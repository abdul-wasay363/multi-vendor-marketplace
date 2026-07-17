import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updateProduct } from "@/actions/product";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>; // Next.js 15 requires params to be treated as a Promise
}) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;
  
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // 1. Fetch the existing product data
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  // 2. SECURITY: If product doesn't exist, or doesn't belong to the user, kick them out
  if (!product || product.sellerId !== session.user.id) {
    redirect("/products");
  }

  // 3. Convert cents back to dollars for the input box
  const formattedPrice = (product.price / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-zinc-50/50 p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-2xl space-y-8">
        
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Edit Product</h1>
            <p className="text-sm text-zinc-500">Update the details of your listing.</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          {/* Note: We pass the updateProduct action here! */}
          <form action={updateProduct} className="flex flex-col gap-6">
            
            {/* HIDDEN INPUT: We must pass the ID so the backend knows what to update! */}
            <input type="hidden" name="id" value={product.id} />

            {/* NEW: Current Image Preview & File Input */}
            <div className="flex flex-col gap-3 pb-4 border-b border-zinc-100">
              <Label htmlFor="image">Product Image</Label>
              
              {/* Show the existing image if they have one */}
              {product.imageUrl && (
                <div className="h-32 w-32 rounded-md border border-zinc-200 overflow-hidden bg-zinc-50 mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.imageUrl} alt="Current product image" className="h-full w-full object-cover" />
                </div>
              )}

              <Input 
                id="image" 
                name="image" 
                type="file" 
                accept="image/*" 
                className="cursor-pointer file:text-zinc-600 file:font-medium file:border-0 file:bg-zinc-100 file:px-4 file:py-1 file:rounded-md file:mr-4 hover:file:bg-zinc-200"
              />
              <p className="text-xs text-zinc-500">Leave empty to keep the current image, or upload a new one to replace it.</p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input 
                id="name" 
                name="name" 
                type="text" 
                defaultValue={product.name} 
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                name="description" 
                type="text" 
                defaultValue={product.description} 
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500 sm:text-sm">$</span>
                <Input 
                  id="price" 
                  name="price" 
                  type="number" 
                  step="0.01"
                  min="0"
                  defaultValue={formattedPrice} 
                  className="pl-7"
                  required 
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full sm:w-auto">
                Save Changes
              </Button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}