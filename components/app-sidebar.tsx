import {Home, Inbox, Search, Users, MessageCircle } from "lucide-react";
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
import Link from "next/link";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { NavUser } from "./nav-user";

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

const header = [
  {
    title: "Sample App",
    subTitle: "NextJS Starter Kit",
    url: "/",
    image: "/nextjs.png",
  },
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
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-transparent">
      <SidebarHeader>
        <SidebarMenu>
          {header.map((head) => (
            <SidebarMenuItem key={head.title}>
              <SidebarMenuButton asChild>
                <Link href={head.url} className="mt-3 flex items-center gap-2">
                  <Image src={head.image} width={35} height={35} alt="Logo" />
                  <div className="ml-1">
                    <div className="font-bold">{head.title}</div>
                    <small>{head.subTitle}</small>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
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
