import {Home, Inbox, Search, Users, MessageCircle, GalleryVerticalEnd, AudioWaveform, Command } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { NProgressLink } from "./ui/nprogress-link";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { NavUser } from "./nav-user";
import { AppHeader } from "./app-header";

const adminItems = [
  { title: "Home", url: "/admin/dashboard", icon: Home },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Chat", url: "/admin/chat", icon: MessageCircle },
];

const userItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Inbox", url: "/inbox", icon: Inbox },
  { title: "Search", url: "/search", icon: Search },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.roleName ?? "user";
  const menuItems = role === "admin" ? adminItems : userItems;

  const data = {
    user: {
    name: session?.user?.name ?? "Anonymous",
    email: session?.user?.email ?? "no-email@example.com",
    avatar: session?.user?.photo ?? "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd ?? "",
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform ?? "",
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command ?? "",
      plan: "Free",
    },
  ],
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-transparent">
      <SidebarHeader className="mt-2">
        <AppHeader teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mt-[-10px]">Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title} className={isActive ? "bg-black text-white rounded-sm" : ""}>
                    <SidebarMenuButton asChild>
                      <NProgressLink href={item.url} className={`flex items-center gap-2 ${isActive ? "font-semibold hover:text-white hover:bg-transparent" : "hover:text-inherit"}`}>
                        <item.icon />
                        <span>{item.title}</span>
                      </NProgressLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
