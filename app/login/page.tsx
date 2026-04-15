"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");

    const paths: Record<string, string> = {
      admin: "/dashboard/admin",
      worker: "/dashboard/worker",
      customer: "/dashboard/customer",
    };

    if (role && paths[role]) {
      router.push(paths[role]);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", {
        email: email.trim(),
        password,
      });

      console.log("FULL RESPONSE:", response);

      const payload = response?.data ?? response;
      const user = payload?.user;
      const token = payload?.token || payload?.access_token;

      console.log("USER EXISTS:", !!user);
      console.log("USER OBJECT:", user);

      if (!user) {
        setError("بيانات الدخول غير صحيحة.");
        return;
      }

      const role = user?.role;

      const paths: Record<string, string> = {
        admin: "/dashboard/admin",
        worker: "/dashboard/worker",
        customer: "/dashboard/customer",
      };

      if (!role || !paths[role]) {
        setError("دور المستخدم غير معرّف.");
        return;
      }

      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", user.full_name || "");
      localStorage.setItem("userEmail", user.email || "");

      if (token) {
        localStorage.setItem("authToken", token);
      }

      console.log("Redirecting to:", paths[role]);
      await router.push(paths[role]);
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "فشل تسجيل الدخول.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const showSignupSuccess =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("signup") === "success";

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans">

      {/* Background */}
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

      {/* Card */}
      <div className="relative z-10 w-full max-w-md p-8 mx-4">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-black mb-2">
              مخبز السعادة البلدي
            </h1>
            <p className="text-black font-medium opacity-80 uppercase tracking-widest text-[10px]">
              لوحة التحكم والإدارة
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">

            {showSignupSuccess && (
              <div className="text-emerald-600 text-[10px] font-black bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center animate-bounce">
                تم إنشاء حسابك بنجاح!
              </div>
            )}

            <div>
              <label className="block text-sm font-black text-black mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-amber-200 bg-white/60 font-bold text-black"
                placeholder="example@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black text-black mb-2">
                كلمة السر
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-amber-200 bg-white/60 font-bold text-black"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-rose-600 text-xs font-black bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-amber-800 text-white rounded-2xl font-black text-xl disabled:opacity-60"
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>

          </form>

          <div className="mt-8 text-center">
            <Link href="/signup" className="text-amber-800 font-black">
              إنشاء حساب جديد
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}