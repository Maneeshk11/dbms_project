import * as React from "react";
//
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@workspace/ui/components/sidebar";
import { Building2Icon, TvIcon, UserIcon } from "lucide-react";
import Link from "next/link";

import Image from "next/image";
import { NavUser } from "./SidebarFooter";

const items = [
  {
    href: "/web-series",
    title: "Web Series",
    icon: TvIcon,
  },
  {
    href: "/production-houses",
    title: "Production Houses",
    icon: Building2Icon,
  },
  {
    href: "/producers",
    title: "Producers",
    icon: UserIcon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props} collapsible="icon">
      <SidebarHeader className="  dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="flex items-center gap-3 px-2 pt-3 group-data-[collapsible=icon]:p-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg">
            {/* <Image
              src="/logo.svg"
              alt="Netflix Manager"
              width={28}
              height={28}
            /> */}
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold bg-linear-to-r text-primary">
                Netflix Manager
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Netflix Rating System
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup key="chat">
          <SidebarGroupContent>
            <SidebarSeparator />
            <SidebarMenu className="mt-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={false}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
