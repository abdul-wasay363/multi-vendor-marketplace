import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createProduct } from "@/actions/product";

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-zinc-50/50 p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-2xl space-y-8">
        
        {/* Navigation Header */}
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Add New Product</h1>
            <p className="text-sm text-zinc-500">Create a new listing for your store.</p>
          </div>
        </div>

        {/* Product Creation Form */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <form action={createProduct} className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input 
                id="name" 
                name="name" 
                type="text" 
                placeholder="e.g. Wireless Mechanical Keyboard" 
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                name="description" 
                type="text" 
                placeholder="e.g. 75% layout with tactile switches and RGB lighting..." 
                required 
              />
            </div>

            {/* NEW: Image File Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="image">Product Image</Label>
              <Input 
                id="image" 
                name="image" 
                type="file" 
                accept="image/*" // Restrict to image files only
                className="cursor-pointer file:text-zinc-600 file:font-medium file:border-0 file:bg-zinc-100 file:px-4 file:py-1 file:rounded-md file:mr-4 hover:file:bg-zinc-200"
              />
              <p className="text-xs text-zinc-500">Upload a high-quality JPEG or PNG (Max 5MB).</p>
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
                  placeholder="99.99" 
                  className="pl-7"
                  required 
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full sm:w-auto">
                List Product
              </Button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}