"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Customer = { 
  id: number; 
  name: string; 
  phone: string; 
  debt: number; 
  total_paid: number; 
  status: string;
  flour_credit: number;
  flour_debt: number;
  financial_credit: number;
};

type Transaction = { 
  id: number; 
  customer_id: number; 
  type: string; 
  item: string | null; 
  quantity: number | null; 
  amount: number; 
  date: string 
};

export default function CustomerStatementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const [cusRes, txRes] = await Promise.all([
      supabase.from("customers").select("*").eq("id", id).single(),
      supabase.from("customer_transactions")
        .select("*")
        .eq("customer_id", id)
        .order("date", { ascending: false }),
    ]);

    if (cusRes.data) setCustomer(cusRes.data);
    if (txRes.data) setTransactions(txRes.data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-rose-600 font-black text-2xl">
        الزبون غير موجود
      </div>
    );
  }

  const totalPurchases = transactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalPayments = transactions.filter(t => t.type === 'payment').reduce((acc, t) => acc + (t.amount || 0), 0);
  const netBalance = totalPayments - totalPurchases;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 lg:p-12 mb-20" dir="rtl">
      {/* Header for Screen */}
      <div className="max-w-5xl mx-auto mb-10 flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-4xl font-black text-black">كشف حساب مفصل</h1>
          <p className="text-gray-500 font-bold mt-2">عرض سجل جميع الحركات المالية والكميات للزبون</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => window.print()} 
            className="px-8 py-4 bg-black text-white rounded-2xl font-black flex items-center gap-3 hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2h6a2 2 0 002 2v4" /></svg>
            طباعة الكشف
          </button>
          <Link 
            href="/dashboard/customers"
            className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all"
          >
            رجوع للقائمة
          </Link>
        </div>
      </div>

      {/* Main Statement Content */}
      <div className="max-w-5xl mx-auto rounded-[3.5rem] bg-gray-50/50 border border-gray-100 p-8 md:p-12 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 border-b border-gray-200 pb-8">
           <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">تفاصيل الزبون</p>
              <h2 className="text-3xl font-black text-amber-900 mb-2">{customer.name}</h2>
              <p className="text-lg font-bold text-gray-500 font-sans">{customer.phone}</p>
           </div>
           <div className="text-right flex flex-col items-end">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">الحالة المالية الحالية</p>
              {netBalance >= 0 ? (
                <div className="flex flex-col items-end">
                  <span className="text-4xl font-black text-emerald-600 font-sans tracking-tighter">
                    {netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                  </span>
                  <span className="mt-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase">باقي لـه (دائن)</span>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <span className="text-4xl font-black text-rose-600 font-sans tracking-tighter">
                    {Math.abs(netBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                  </span>
                  <span className="mt-2 px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-xs font-black uppercase">باقي عليه (مدين)</span>
                </div>
              )}
           </div>
        </div>

        {/* Section 1: Financial Activity */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-2 bg-emerald-600 rounded-full"></div>
            <h3 className="text-2xl font-black text-gray-800">سجل الحركة المالية (المبالغ)</h3>
          </div>
          <div className="overflow-x-auto bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-emerald-50/30 text-emerald-800/40 text-[10px] font-black uppercase tracking-widest border-b border-emerald-50">
                  <th className="px-6 py-5">تاريخ العملية</th>
                  <th className="px-6 py-5">البيان</th>
                  <th className="px-6 py-5">مدين (أخذ بالدين)</th>
                  <th className="px-6 py-5">دائن (مسدد نقداً)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.filter(t => t.type === 'credit' || t.type === 'payment').map((tx) => (
                  <tr key={tx.id} className="hover:bg-emerald-50/10 transition-colors">
                    <td className="px-6 py-5 text-gray-400 font-sans text-sm">{tx.date}</td>
                    <td className="px-6 py-5 font-bold text-gray-800">
                      {tx.type === 'credit' ? `شراء: ${tx.item}` : 'تسديد مبلغ مالي'}
                    </td>
                    <td className="px-6 py-5 font-black text-rose-600 font-sans">
                      {tx.type === 'credit' ? `${(tx.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪` : ""}
                    </td>
                    <td className="px-6 py-5 font-black text-emerald-600 font-sans">
                      {tx.type === 'payment' ? `${(tx.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Withdrawal Activity */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-2 bg-amber-600 rounded-full"></div>
            <h3 className="text-2xl font-black text-gray-800">سجل حركة السحب والاستهلاك (الكميات)</h3>
          </div>
          <div className="overflow-x-auto bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-amber-50/30 text-amber-800/40 text-[10px] font-black uppercase tracking-widest border-b border-amber-50">
                  <th className="px-6 py-5">تاريخ العملية</th>
                  <th className="px-6 py-5">الصنف المسحوب</th>
                  <th className="px-6 py-5">الكمية / الوزن</th>
                  <th className="px-6 py-5">النوع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.filter(t => t.type !== 'payment').map((tx) => (
                  <tr key={tx.id} className="hover:bg-amber-50/10 transition-colors">
                    <td className="px-6 py-5 text-gray-400 font-sans text-sm">{tx.date}</td>
                    <td className="px-6 py-5 font-bold text-gray-800">{tx.item || "—"}</td>
                    <td className="px-6 py-5 font-black text-amber-900 font-sans">
                      {tx.quantity?.toLocaleString('en-US')} {tx.item === 'طحين' ? 'كجم' : 'حبة'}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                        tx.type === 'flour_deposit' ? 'bg-blue-100 text-blue-700' : 
                        tx.type === 'flour_usage' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {tx.type === 'flour_deposit' ? 'إيداع طحين' : 
                         tx.type === 'flour_usage' ? 'سحب طحين' : 'شراء خبز'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Summary (Flour) */}
        <div className="mt-16 pt-12 border-t border-gray-200 grid grid-cols-2 gap-8 text-center max-w-2xl mx-auto">
           <div className="p-6 bg-white rounded-3xl border border-gray-50 shadow-sm">
              <p className="text-2xl font-black text-blue-600 font-sans mb-1">
                {(customer.flour_credit ?? 0).toLocaleString('en-US')} كجم
              </p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">إجمالي طحين له (دائن)</p>
           </div>
           <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-2xl font-black text-amber-600 font-sans mb-1">
                {(customer.flour_debt ?? 0).toLocaleString('en-US')} كجم
              </p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">إجمالي طحين عليه (مدين)</p>
           </div>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block fixed bottom-0 left-0 right-0 p-8 text-center border-t border-gray-100 bg-white">
        <p className="text-xs text-gray-400 font-bold italic">نظام إدارة المخبز الذكي - كشف حساب الكتروني معتمد</p>
      </div>
    </div>
  );
}
