"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    
    if (role) {
      const paths: Record<string, string> = {
        admin: "/dashboard/admin",
        accountant: "/dashboard/accountant",
        worker: "/dashboard/worker",
        customer: "/dashboard/customer",
      };
      router.push(paths[role] || "/login");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-amber-800/20 border-t-amber-800 rounded-full animate-spin"></div>
    </div>
  );
}
