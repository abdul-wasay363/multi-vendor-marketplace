"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, CheckCircle2, UserCircle } from "lucide-react"
import { updateProfile } from "@/actions/settings"

export function ProfileForm({ initialName, initialImage }: { initialName: string | null, initialImage: string | null }) {
  const [isPending, startTransition] = useTransition()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      // 1. Execute the secure Server Action
      await updateProfile(formData)
      
      // 2. Trigger the success pop-up UI
      setShowSuccess(true)
      
      // 3. Auto-hide the pop-up after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-md relative">
      
      {/* The Success Pop-up Notification */}
      {showSuccess && (
        <div className="absolute -top-14 left-0 right-0 bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 border border-green-200 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm z-10">
          <CheckCircle2 className="h-5 w-5" />
          Profile updated successfully!
        </div>
      )}

      {/* Profile Image Upload Section */}
      <div className="flex items-center gap-6 pb-6 border-b border-zinc-100 mb-4">
        <div className="h-20 w-20 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0 flex items-center justify-center">
          {initialImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={initialImage} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <UserCircle className="h-10 w-10 text-zinc-300" />
          )}
        </div>
        <div className="space-y-1 flex-1">
          <Label htmlFor="image">Profile Picture</Label>
          <Input 
            id="image" 
            name="image" 
            type="file" 
            accept="image/*" 
            className="cursor-pointer file:text-zinc-600 file:font-medium file:border-0 file:bg-zinc-100 file:px-3 file:py-1 file:rounded-md file:mr-4 hover:file:bg-zinc-200"
          />
          <p className="text-xs text-zinc-500">Leave blank to keep your current avatar.</p>
        </div>
      </div>

      {/* Display Name Section */}
      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input 
          key={initialName} // Forces React to build a new input if the database data changes
          id="name" 
          name="name" 
          defaultValue={initialName || ""} 
          required 
          className="max-w-md"
        />
        <p className="text-xs text-zinc-500">
          This is the name that appears on your public listings and order receipts.
        </p>
      </div>

      <Button type="submit" className="mt-2" disabled={isPending}>
        <Save className="h-4 w-4 mr-2" />
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}