"use client";

import { Avatar, AvatarImage } from "@workspace/ui/components/avatar";
import { AvatarFallback } from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { SidebarMenuButton } from "@workspace/ui/components/sidebar";
import { ChevronsUpDown, Settings } from "lucide-react";
import { toast } from "@workspace/ui/components/sonner";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { User } from "better-auth";
import authClient from "@/lib/auth-client";

const DropdownFooter = ({ user }: { user: User }) => {
  const router = useRouter();

  const signOutAction = async () => {
    const { data: resp, error } = await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // redirect to login page
        },
      },
    });

    if (resp && !error) {
      toast.success("Logged out successfully!");
    }

    if (error) {
      toast.error(error.message);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback className="rounded-lg">
              {user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="right"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback className="rounded-lg">
                {user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name || ""}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Settings />
          Settings
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => signOutAction()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownFooter;
