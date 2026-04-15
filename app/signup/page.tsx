"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post('/register', {
        full_name: fullName,
        email: email.trim(),
        phone: phone,
        password: password,
        role: "customer"
      });

      console.log("SIGNUP RESPONSE:", response);

      const payload = response?.data ?? response;
      const isSuccess = payload?.success === undefined ? true : payload.success;

      if (!isSuccess) {
        setError(payload?.message || payload?.error || "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.");
        return;
      }

      router.push("/login?signup=success");
    } catch (err: any) {
      console.error("Signup error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.";
      setError(msg);
    } finally {
      setLoading(false);
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">إنشاء حساب جديد</h1>
            <p className="text-black font-medium opacity-80 uppercase tracking-widest text-[10px]">انضم لمخبز السعادة البلدي</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-black text-black mb-2 mr-1">الاسم الكامل</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all bg-white/60 font-bold text-black placeholder-gray-400"
                placeholder="أدخل اسمك الكامل..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black text-black mb-2 mr-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all bg-white/60 font-bold text-black placeholder-gray-400"
                placeholder="example@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black text-black mb-2 mr-1">رقم الهاتف</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all bg-white/60 font-bold text-black placeholder-gray-400"
                placeholder="05xxxxxxx"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black text-black mb-2 mr-1">كلمة السر</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all bg-white/60 font-bold text-black placeholder-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-rose-600 text-xs font-black bg-rose-50 p-3 rounded-2xl border border-rose-100 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-amber-800 text-white rounded-[24px] font-black text-lg hover:bg-amber-900 transition-all shadow-2xl shadow-amber-900/30 transform active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : (
                "إنشاء الحساب"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 font-bold text-sm">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-amber-800 font-black hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <p>© 2026 مخبز السعادة البلدي. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
