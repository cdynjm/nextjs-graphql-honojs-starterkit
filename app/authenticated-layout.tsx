"use client";

import { useSession } from "next-auth/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { PageTitleProvider } from "@/components/page-title-context";
import { Toaster } from "sonner";
import NavbarFix from "@/components/navbar-fix";

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <SidebarProvider>
      {session ? (
        <>
          <AppSidebar />
          <div className="flex flex-col w-full bg-white md:m-2 shadow rounded-md">
            <PageTitleProvider>
              <AppTopbar />
              <main className="flex-1 md:mb-0 mb-12">{children}</main>
              <NavbarFix />
              <Toaster />
            </PageTitleProvider>
          </div>
        </>
      ) : (
        <main className="flex-1">{children}</main>
      )}
    </SidebarProvider>
  );
}
