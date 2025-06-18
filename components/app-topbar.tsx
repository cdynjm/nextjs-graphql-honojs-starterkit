"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserCircle2 } from "lucide-react";
import { usePageTitle } from "./page-title-context";
import { NProgressLink } from "./ui/nprogress-link";

export function AppTopbar() {
  const { data: session } = useSession();
   const { title } = usePageTitle();

  return (
    <header className="w-full h-16 px-4 flex items-center justify-between bg-white border-b rounded-t-md">
      <div className="flex items-center gap-1">
        {/* Sidebar toggle button */}
        <SidebarTrigger />
        <span className="text-[16px] font-semibold mb-[2px]">{title}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-black focus:outline-none">
            <UserCircle2 className="w-5 h-5" />
            <span>{session?.user?.name || "Profile"}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40 mt-2">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
          >
            <NProgressLink href="/admin/profile">Profile</NProgressLink>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/" })}
            className="cursor-pointer"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
