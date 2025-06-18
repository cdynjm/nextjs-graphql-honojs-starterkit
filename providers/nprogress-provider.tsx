"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "@/app/styles/nprogress.css";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 30,
  speed: 100,        
  minimum: 0.1,      
});

export function NProgressProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    NProgress.start();
    const timeout = setTimeout(() => {
      NProgress.done();
    }, 200);

    return () => clearTimeout(timeout);
  }, [pathname, search]);

  return null;
}
