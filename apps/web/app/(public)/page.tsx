import { getSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  // If not authenticated, redirect to login
  redirect("/login");
}
