import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { User, Mail, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ProfileForm } from "./profile-form"; // 1. ADD THIS IMPORT

export default async function SettingsPage() {
  // 1. Secure the page
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/login");
  }

  // 2. Fetch the absolute latest user data from the database
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Account Settings</h1>
          <p className="text-zinc-500 mt-2">Manage your personal information and account preferences.</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          
          {/* Section: General Information (Editable) */}
          <div className="p-6 sm:p-8 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-zinc-400" />
              Public Profile
            </h2>
            
            {/* We pass BOTH the name and the image to the Client Form */}
            <ProfileForm initialName={dbUser.name} initialImage={dbUser.image} />
          </div>

          {/* Section: Account Details (Read-Only) */}
          <div className="p-6 sm:p-8 bg-zinc-50/50">
            <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-zinc-400" />
              Account Details
            </h2>
            
            <div className="space-y-6 max-w-md">
              
              {/* Email (Read Only) */}
              <div className="space-y-2">
                <Label className="text-zinc-600">Email Address</Label>
                <div className="flex items-center gap-3 px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-md text-zinc-500 text-sm">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{dbUser.email}</span>
                </div>
                <p className="text-xs text-zinc-500">
                  Email addresses cannot be changed directly. Contact support for assistance.
                </p>
              </div>

              {/* Role (Read Only) */}
              <div className="space-y-2">
                <Label className="text-zinc-600">Account Role</Label>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                    dbUser.role === 'ADMIN' 
                      ? 'bg-purple-50 text-purple-700 border-purple-200' 
                      : dbUser.role === 'SELLER'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}>
                    {dbUser.role}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {dbUser.role === 'BUYER' && "You currently have a standard buyer account. You can purchase items and view your order history."}
                  {dbUser.role === 'SELLER' && "You have a vendor account. You can list products, track inventory, and view your sales."}
                  {dbUser.role === 'ADMIN' && "You have platform administrator privileges."}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}