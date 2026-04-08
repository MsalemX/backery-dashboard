"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulated login logic
    setTimeout(() => {
      if (email === "admin@gmail.com" && password === "123456789") {
        router.push("/dashboard/admin");
      } else if (email === "emp@gmail.com" && password === "123456789") {
        router.push("/dashboard/accountant");
      } else {
        setError("بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans">
      {/* Background Image with Overlay */}
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

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 mx-4">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-900 mb-2">مخبز السعادة البلدي</h1>
            <p className="text-amber-700 font-medium">لوحة التحكم والإدارة</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2 mr-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-white/50"
                placeholder="example@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2 mr-1">
                كلمة السر
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-white/50"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100 text-center animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-amber-800 hover:bg-amber-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-amber-900/40 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
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

          <div className="mt-8 text-center text-amber-800/60 text-sm">
            <p>© 2026 مخبز السعادة البلدي. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
