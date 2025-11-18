import { SidebarMenu, SidebarMenuItem } from "@workspace/ui/components/sidebar";

import { getSession } from "@/server/auth";
import { User } from "better-auth";
import DropdownFooter from "./dropdownFooter";

export async function NavUser() {
  const response = await getSession();

  if (!response || "error" in response) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownFooter user={response.user as unknown as User} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
