"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in
    const userRole = localStorage.getItem("userRole");

    if (!userRole) {
      // Not logged in, redirect to login
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [router, pathname]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-800/20 border-t-amber-800 rounded-full animate-spin"></div>
          <p className="text-amber-900 font-bold animate-pulse">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
