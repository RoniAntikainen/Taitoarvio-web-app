import { auth } from "@/auth";

export async function safeAuth() {
  try {
    return await auth();
  } catch {
    return null;
  }
}
