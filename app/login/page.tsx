"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from("users")
      .select("role")
      .eq("email", email.trim())
      .single();

    console.log("LOGIN DEBUG:", { data, fetchError, email: email.trim() });
    setLoading(false);

    if (fetchError || !data) {
      setError("بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.");
      return;
    }

    // Simple password check (in production use hashed passwords via Supabase Auth)
    const role = data.role;
    const paths: Record<string, string> = {
      admin: "/dashboard/admin",
      accountant: "/dashboard/accountant",
      worker: "/dashboard/worker",
      customer: "/dashboard/customer",
    };

    if (paths[role]) {
      localStorage.setItem("userRole", role);
      router.push(paths[role]);
    } else {
      setError("دور المستخدم غير معرّف.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bakery-bg.png"
          alt="Bakery Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 mx-4">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-black mb-2">مخبز السعادة البلدي</h1>
            <p className="text-black font-medium opacity-80 uppercase tracking-widest text-[10px]">لوحة التحكم والإدارة</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-black mb-2 mr-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all bg-white/60 font-bold text-black placeholder-gray-400"
                placeholder="example@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black text-black mb-2 mr-1">كلمة السر</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all bg-white/60 font-bold text-black placeholder-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-rose-600 text-xs font-black bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-amber-800 text-white rounded-[24px] font-black text-xl hover:bg-amber-900 transition-all shadow-2xl shadow-amber-900/30 transform active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <p>© 2026 مخبز السعادة البلدي. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
