import { getSession } from "@/server/auth";
import { redirect } from "next/navigation";

// Prevent static generation - this page checks auth status
export const dynamic = "force-dynamic";

export default async function Page() {
  try {
    const session = await getSession();
    if (session && "user" in session) {
      redirect("/web-series");
    }
  } catch (error) {
    // If auth check fails, redirect to login
    console.error("Auth check failed:", error);
  }

  // If not authenticated, redirect to login
  redirect("/login");
}
