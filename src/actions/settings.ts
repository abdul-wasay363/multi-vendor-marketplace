"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase Storage Client using the Service Role Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateProfile(formData: FormData) {
  // 1. Verify the user is logged in
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  // 2. Get the new name from the form
  const name = formData.get("name") as string;

  if (!name || name.trim() === "") {
    throw new Error("Name cannot be empty");
  }

  // Prepare the base update payload
  const updateData: any = { name: name.trim() };

  // 3. Handle Image Upload
  const imageFile = formData.get("image") as File;
  
  if (imageFile && imageFile.size > 0) {
    // Sanitize file name to prevent URL errors
    const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `avatar-${session.user.id}-${Date.now()}-${safeFileName}`;
    const fileBuffer = await imageFile.arrayBuffer();
    
    // Upload to our new 'avatars' bucket
    const { error } = await supabase.storage
      .from("avatars")
      .upload(uniqueFileName, fileBuffer, {
        contentType: imageFile.type,
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw new Error("Failed to upload profile image");
    }

    // Get the permanent public URL
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(uniqueFileName);

    // Add the image URL to our database update payload
    updateData.image = publicUrlData.publicUrl;
  }

  // 4. Update the database securely
  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  });

  // 5. Purge the cache so the page and navbar update instantly
  revalidatePath("/", "layout");
}


// "use server";

// import { prisma } from "@/lib/prisma";
// import { auth } from "@/lib/auth";
// import { headers } from "next/headers";
// import { revalidatePath } from "next/cache";

// export async function updateProfile(formData: FormData) {
//   // 1. Authenticate
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session) {
//     throw new Error("Unauthorized");
//   }

//   // 2. Extract and validate data
//   const name = formData.get("name") as string;
  
//   if (!name || name.trim().length === 0) {
//     throw new Error("Name cannot be empty");
//   }

//   // 3. Update the database
//   await prisma.user.update({
//     where: { id: session.user.id },
//     data: { name: name.trim() },
//   });

//   // 4. Clear the cache so the Navbar and Settings page reflect the new name instantly
//   revalidatePath("/");
//   revalidatePath("/settings");
// }