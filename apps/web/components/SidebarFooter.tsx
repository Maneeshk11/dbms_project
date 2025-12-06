import { SidebarMenu, SidebarMenuItem } from "@workspace/ui/components/sidebar";

import { getSession } from "@/server/auth";
import { User } from "better-auth";
import DropdownFooter from "./dropdownFooter";

export async function NavUser() {
  let user: User | null = null;

  try {
    const response = await getSession();
    if (response && !("error" in response)) {
      user = response.user as unknown as User;
    }
  } catch (error) {
    console.error("Failed to fetch user session:", error);
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownFooter user={user} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
