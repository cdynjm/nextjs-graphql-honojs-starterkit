"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import NProgress from "nprogress";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function NProgressLink({
  href,
  children,
  className,
  ...props
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (pathname === href) {
      NProgress.done();
      return;
    }

    NProgress.start();
    router.push(href);
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}
