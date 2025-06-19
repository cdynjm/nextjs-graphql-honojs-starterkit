"use client";

import { usePathname } from "next/navigation";
import { NProgressLink } from "./ui/nprogress-link";
import { Home, User2, Users, LucideIcon } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/admin/dashboard", icon: Home },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Profile", href: "/admin/profile", icon: User2 },
];

export default function NavbarFix() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-sm block md:hidden">
      <div className="flex justify-around items-center h-12">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <NProgressLink
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center text-sm transition-colors ${
                isActive ? "text-blue-500 font-semibold" : "text-gray-600"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-blue-500" : "text-gray-600"} />
              <div className="text-xs">{item.label}</div>
            </NProgressLink>
          );
        })}
      </div>
    </nav>
  );
}
