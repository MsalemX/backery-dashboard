"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const menuItems = [
  { name: "لوحة التحكم", icon: "Home", path: "/dashboard/admin" },
  { name: "أنواع الخبز", icon: "Bread", path: "/dashboard/bread-types" },
  { name: "المخزون", icon: "Box", path: "/dashboard/inventory" },
  { name: "الموظفون", icon: "Users", path: "/dashboard/employees" },
  { name: "الزبائن", icon: "User", path: "/dashboard/customers" },
  { name: "نقاط البيع", icon: "POS", path: "/dashboard/pos" },
  { name: "المصروفات", icon: "Receipt", path: "/dashboard/expenses" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState("");

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") || "admin";
    setRole(savedRole);
  }, []);

  const filteredMenuItems = menuItems.map(item => {
    // Return a new object to avoid mutating the original menuItems array
    const newItem = { ...item };
    if (role === "worker") {
      if (newItem.name === "لوحة التحكم") newItem.path = "/dashboard/worker";
    }
    return newItem;
  }).filter(item => {
    if (role === "worker") {
      if (item.name === "الموظفون") return false;
    }
    return true;
  });

  return (
    <aside className="w-64 bg-white h-screen fixed right-0 top-0 border-l border-gray-100 flex flex-col z-20">
      <div className="p-6">
        <h1 className="text-xl font-bold text-amber-900 text-center">مخبز السعادة البلدي</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? "bg-amber-50 text-amber-900 shadow-sm shadow-amber-900/5 border border-amber-100/50"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <div className={`p-2 rounded-lg ${isActive ? "bg-white" : "bg-gray-50"}`}>
                <Icon name={item.icon} className={isActive ? "text-amber-900" : "text-gray-400"} />
              </div>
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <button 
          onClick={() => {
            localStorage.removeItem("userRole");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-bold text-rose-600 hover:bg-rose-50 group"
        >
          <div className="p-2 bg-rose-50 rounded-lg group-hover:bg-white transition-colors">
            <Icon name="Logout" className="text-rose-600" />
          </div>
          <span className="text-sm">تسجيل الخروج</span>
        </button>
      </div>

      <div className="p-6 text-[10px] font-black text-gray-300 uppercase tracking-widest text-center">
        v1.0.5
      </div>
    </aside>
  );
}

function Icon({ name, className }: { name: string; className?: string }) {
  if (name === "Home")
    return (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );
  if (name === "Bread")
    return (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.952 11.952 0 0112 15c-2.998 0-5.74-1.1-7.843-2.918m0 0A8.959 8.959 0 013 12c0-.778.099-1.533.284-2.253" />
      </svg>
    );
  if (name === "Box")
    return (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
  if (name === "Users")
    return (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  if (name === "User")
    return (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  if (name === "POS")
    return (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  if (name === "Logout")
    return (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    );
  if (name === "Receipt")
    return (
      <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01" />
      </svg>
    );
  return null;
}
