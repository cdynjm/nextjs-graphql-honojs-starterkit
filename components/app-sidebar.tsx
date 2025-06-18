import {Home, Inbox, Search, Users } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { ChevronUp, User2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { NProgressLink } from "./ui/nprogress-link";
import Link from "next/link";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

// Admin and User menu items
const adminItems = [
  { title: "Home", url: "/admin/dashboard", icon: Home },
  { title: "Users", url: "/admin/users", icon: Users },
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
  const pathname = usePathname(); // get current path
  const role = session?.user?.role ?? 2;
  const menuItems = role === 1 ? adminItems : userItems;

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
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title} className={isActive ? "bg-gray-200 text-gray-700 rounded-sm" : ""}>
                    <SidebarMenuButton asChild>
                      <NProgressLink href={item.url} className={`flex items-center gap-2 ${isActive ? "font-semibold" : ""}`}>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 />
                  {session?.user?.name ?? "Username"}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="bg-white rounded-md shadow-md p-2 w-48"
              >
                <DropdownMenuItem className="px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer">
                 <NProgressLink href="/admin/profile">Profile</NProgressLink>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="px-3 py-2 rounded hover:bg-gray-100 text-sm cursor-pointer"
                  onClick={() => signOut({callbackUrl: "/"})}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
