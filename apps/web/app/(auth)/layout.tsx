import { getSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/Appsidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !("user" in session)) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2">
            <h1 className="text-lg font-semibold">
              Welcome, {session.user?.name}
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
