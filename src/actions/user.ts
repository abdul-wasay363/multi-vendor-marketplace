// "use server";

// import { prisma } from "@/lib/prisma";

// export async function createTestUser() {
//   // Prisma concept: The .create() method inserts a new row into the table
//   const newUser = await prisma.user.create({
//     data: {
//       // We use Date.now() so the email is unique every time we click the button
//       email: `test${Date.now()}@example.com`, 
//       name: "Test Buyer",
//       role: "BUYER",
//     },
//   });

//   console.log("Successfully created user:", newUser);
// }



"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache"; // 1. Import the cache tool

// We now accept the standard HTML 'FormData' object
export async function createUser(formData: FormData) {
  // Extract the specific text typed into the inputs
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  // Insert those exact values into Supabase
  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      role: "BUYER",
    },
  });

  console.log("Real user created:", newUser);

  // 2. Tell Next.js to clear the cache for the homepage and fetch fresh data
  revalidatePath("/");
  
}

export async function deleteUser(formData: FormData) {
  // 1. Grab the ID from the hidden form input
  const userId = formData.get("id") as string;

  // 2. Delete the user. 
  // Because of our Schema update, Prisma and Supabase will automatically 
  // hunt down and delete every single Product tied to this ID as well!
  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  console.log(`User ${userId} and all their products deleted successfully.`);
  
  // 3. Refresh the UI
  revalidatePath("/");
}