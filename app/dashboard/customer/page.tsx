"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import PremiumChartCard from "@/components/PremiumChartCard";

type Customer = { id: number; name: string; phone: string; debt: number; total_paid: number; status: string };

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    setLoading(true);
    // In a real app, we would get the email/id from the session
    // For now, let's assume we are "سوبر ماركت الأمل" for demo purposes
    // Or try to find a match by name in localStorage if we saved it
    const { data: userData } = await supabase.from("users").select("*").limit(1); // Mocking session
    
    const { data: customerData } = await supabase
      .from("customers")
      .select("*")
      .eq("name", "سوبر ماركت الأمل") // Demo customer
      .single();

    if (customerData) {
      setCustomer(customerData);
      const { data: txData } = await supabase
        .from("customer_transactions")
        .select("*")
        .eq("customer_id", customerData.id)
        .order("date", { ascending: false })
        .limit(5);
      setTransactions(txData || []);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-400 font-bold">جاري التحميل...</div>;

  if (!customer) return <div className="p-8 text-center text-rose-600 font-bold">لم يتم العثور على بيانات الزبون.</div>;

  return (
    <div className="p-8 pb-20 bg-[#f9fafb] min-h-screen font-sans">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-800 tracking-tight">أهلاً بك، {customer.name}</h1>
        <p className="text-gray-500 mt-2 font-medium">مرحباً بك في لوحة تحكم زبائن مخبز السعادة البلدي</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <PremiumChartCard
          title="رصيدك المدين"
          value={customer.debt.toFixed(2)}
          unit="₪"
          subText="المبلغ المتبقي للدفع"
          data={[100, 120, 150, 140, 180, 200, customer.debt]}
          color="rose"
          type="sparkline"
          icon={<AlertIcon />}
        />
        <PremiumChartCard
          title="إجمالي المدفوعات"
          value={customer.total_paid.toFixed(2)}
          unit="₪"
          subText="المبالغ التي قمت بتسديدها"
          data={[500, 600, 700, 800, 900, 1000, customer.total_paid]}
          color="emerald"
          type="sparkline"
          icon={<CheckIcon />}
        />
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">حالة الحساب</p>
          <span className={`px-6 py-2 rounded-2xl text-lg font-black ${customer.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {customer.status}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <h3 className="text-xl font-bold text-gray-800">آخر العمليات</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">التاريخ</th>
                <th className="px-8 py-6">النوع</th>
                <th className="px-8 py-6">الصنف</th>
                <th className="px-8 py-6">الكمية</th>
                <th className="px-8 py-6">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-amber-50/20 transition-colors">
                  <td className="px-8 py-6 text-gray-400 font-sans">{tx.date}</td>
                  <td className="px-8 py-6">
                    <span className={`font-bold ${tx.type === 'credit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {tx.type === 'credit' ? 'شراء بالدين' : 'دفعة نقدية'}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-800">{tx.item || "-"}</td>
                  <td className="px-8 py-6 text-gray-500 font-sans">{tx.quantity || "-"}</td>
                  <td className="px-8 py-6 font-black text-lg text-gray-800">{tx.amount.toFixed(2)} ₪</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AlertIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  );
}
