"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js"; // 1. Import the client

// Initialize the Supabase Storage Client
// 1. THE FIX: Use the Service Role Key to bypass RLS blocks securely on the server
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // <-- Changed from ANON_KEY
);

// 1. CREATE PRODUCT
export async function createProduct(formData: FormData) {
  // 1. SECURITY VAULT: Identify the user making the request
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // If a hacker hits this endpoint without a session, we kick them out
  if (!session) {
    throw new Error("Unauthorized request");
  }

  // 2. Extract the form inputs
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  // 3. THE FIX: Convert the dollar input strictly into cents!
  // Math.round ensures we don't accidentally get fractions of a cent
  const priceInCents = Math.round(parseFloat(formData.get("price") as string) * 100);

  // 4. Extract the file from the form data
  const imageFile = formData.get("image") as File;
  let imageUrl = null;

  // 5. Process the file if it exists and is larger than 0 bytes
  if (imageFile && imageFile.size > 0) {
    // 1. THE SANITIZER: Remove spaces and special characters from the file name
    const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Create a unique filename to prevent overwriting (e.g., 170948392-keyboard.jpg)
    const uniqueFileName = `${Date.now()}-${safeFileName}`;
    
    // 1. THE FIX: Convert the Next.js Web File into a raw binary buffer
    const fileBuffer = await imageFile.arrayBuffer();
    
    // 2. Upload the raw buffer, and explicitly tell Supabase what type of file it is
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(uniqueFileName, fileBuffer, {
        contentType: imageFile.type, // Automatically passes 'image/jpeg' or 'image/png'
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw new Error("Failed to upload image");
    }

    // Retrieve the permanent public web address for the newly uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(uniqueFileName);

    imageUrl = publicUrlData.publicUrl;
  }

  // 6. Save the structural data + the new image URL to PostgreSQL
  await prisma.product.create({
    data: { 
      name, 
      description, 
      price: priceInCents, 
      sellerId: session.user.id,
      imageUrl: imageUrl // Store the string!
    },
  });

  revalidatePath("/products");
  redirect("/products");
}

// 2. UPDATE PRODUCT (Upgraded with Image Support!)
export async function updateProduct(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceInCents = Math.round(parseFloat(formData.get("price") as string) * 100);

  // 1. Prepare the base update data
  const updateData: any = { 
    name, 
    description, 
    price: priceInCents 
  };

  // 2. Check if a new image was uploaded
  const imageFile = formData.get("image") as File;
  
  if (imageFile && imageFile.size > 0) {
    // Sanitize and upload the new file
    const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${Date.now()}-${safeFileName}`;
    const fileBuffer = await imageFile.arrayBuffer();
    
    const { error } = await supabase.storage
      .from("product-images")
      .upload(uniqueFileName, fileBuffer, {
        contentType: imageFile.type,
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw new Error("Failed to upload new image");
    }

    // Get the new URL and add it to our update payload
    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(uniqueFileName);

    updateData.imageUrl = publicUrlData.publicUrl;
  }

  // 3. SECURE DATABASE WRITE: Update the product ONLY if the seller matches
  await prisma.product.updateMany({
    where: { 
      id: id,
      sellerId: session.user.id 
    },
    data: updateData,
  });

  revalidatePath("/products");
  redirect("/products");
}

// 3. SECURE DELETE PRODUCT (Upgraded!)
export async function deleteProduct(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const id = formData.get("id") as string;

  // SECURITY: Prisma updateMany/deleteMany allows us to check multiple conditions safely
  await prisma.product.deleteMany({ 
    where: { 
      id: id,
      sellerId: session.user.id // The hacker barrier!
    } 
  });

  revalidatePath("/products");
}



// "use server";

// import { prisma } from "@/lib/prisma";
// import { revalidatePath } from "next/cache";

// export async function createProduct(formData: FormData) {
//   // 1. Extract the data from the form
//   const name = formData.get("name") as string;
//   const description = formData.get("description") as string;
//   const priceString = formData.get("price") as string;
//   const sellerId = formData.get("sellerId") as string; // This is the ID of the User!

//   // 2. Format the price
//   // We take the decimal (e.g., 15.99) and multiply by 100 to store it as cents (1599)
//   const priceInCents = Math.round(parseFloat(priceString) * 100);

//   // 3. Insert into the database
//   const newProduct = await prisma.product.create({
//     data: {
//       name: name,
//       description: description,
//       price: priceInCents,
//       sellerId: sellerId, 
//       isPublished: true, // We will auto-publish for now
//     },
//   });

//   console.log("Product created successfully:", newProduct);
  
//   // 4. Refresh the page so the new product shows up instantly
//   revalidatePath("/products");
// }

// export async function deleteProduct(formData: FormData) {
//   // 1. Extract the product ID from the form submission
//   const productId = formData.get("id") as string;

//   // 2. Instruct Prisma to wipe this specific row
//   await prisma.product.delete({
//     where: {
//       id: productId,
//     },
//   });

//   console.log(`Product ${productId} deleted successfully.`);

//   // 3. Purge the cache so the item vanishes from the screen immediately
//   revalidatePath("/products");
// }