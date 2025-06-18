"use client";

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
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-sm block md:hidden">
      <div className="flex justify-around items-center h-10">
        {navItems.map((item) => (
          <NProgressLink
            key={item.href}
            href={item.href}
            className="flex flex-col items-center text-sm text-gray-600 hover:text-black transition-colors"
          >
            <item.icon size={20} />
            <div className="text-xs">{item.label}</div>
          </NProgressLink>
        ))}
      </div>
    </nav>
  );
}
