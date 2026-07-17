import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// This automatically generates every single endpoint needed for login/signup/logout
export const { GET, POST } = toNextJsHandler(auth);