"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CustomerTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    // Hardcoded demo customer 'سوبر ماركت الأمل'
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("name", "سوبر ماركت الأمل")
      .single();

    if (customer) {
      const { data } = await supabase
        .from("customer_transactions")
        .select("*")
        .eq("customer_id", customer.id)
        .order("date", { ascending: false });
      setTransactions(data || []);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-400 font-bold">جاري تحميل السجل...</div>;

  return (
    <div className="p-8 pb-20 bg-[#f9fafb] min-h-screen font-sans">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-800 tracking-tight">سجل العمليات</h1>
        <p className="text-gray-500 mt-2 font-medium">كشف حساب مفصل لجميع مشترياتك ومدفوعاتك</p>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">رقم العملية</th>
                <th className="px-8 py-6">التاريخ</th>
                <th className="px-8 py-6">البيان</th>
                <th className="px-8 py-6">تفاصيل الصنف</th>
                <th className="px-8 py-6">النوع</th>
                <th className="px-8 py-6">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-amber-50/20 transition-colors">
                  <td className="px-8 py-6 text-gray-400 font-sans font-bold">#{tx.id}</td>
                  <td className="px-8 py-6 text-gray-500 font-sans">{tx.date}</td>
                  <td className="px-8 py-6 font-bold text-gray-800">
                    {tx.type === 'credit' ? 'شراء منتجات' : 'تسديد دفعة مالية'}
                  </td>
                  <td className="px-8 py-6 text-gray-500 font-medium">
                    {tx.item ? `${tx.item} (ك: ${tx.quantity})` : "-"}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                      tx.type === 'credit' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {tx.type === 'credit' ? 'مدين' : 'دائن'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`font-black text-lg ${tx.type === 'credit' ? 'text-gray-800' : 'text-emerald-700'}`}>
                      {tx.amount.toFixed(2)} ₪
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
