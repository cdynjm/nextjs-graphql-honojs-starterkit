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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserCircle2, LogOutIcon } from "lucide-react";
import { usePageTitle } from "./page-title-context";
import { NProgressLink } from "./ui/nprogress-link";
import { Separator } from "./ui/separator";

export function AppTopbar() {
  const { data: session } = useSession();
  const { title } = usePageTitle();

  return (
    <header className="w-full h-16 px-4 flex items-center justify-between bg-white border-b rounded-t-md">
      <div className="flex items-center gap-1">
        {/* Sidebar toggle button */}
        <SidebarTrigger className="ml-1" />
        <Separator
          orientation="vertical"
          className="ml-0 mr-2 data-[orientation=vertical]:h-4"
        />
        <span className="text-[14px] font-semibold mb-[2px]">{title}</span>
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
        <DropdownMenuContent className="w-50 mt-2 me-5">
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={session?.user?.photo}
                  alt={session?.user?.name}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {session?.user?.name}
                </span>
                <span className="truncate text-xs">{session?.user?.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <NProgressLink href="/admin/profile" className="flex gap-2 items-center">
              <UserCircle2 />
              Profile
            </NProgressLink>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/" })}
            className="cursor-pointer flex gap-2 items-center"
          >
            <LogOutIcon className="w-3" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
