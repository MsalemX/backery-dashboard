"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
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

    // Get the name of the logged-in user from localStorage
    const savedName = localStorage.getItem("userName");

    if (!savedName) {
      setLoading(false);
      return;
    }

    // 1. Fetch customer details
    try {
      const customers = await api.get('/customers');
      const customerData = (customers || []).find((c: any) => {
        const name = String(c.name || c.full_name || "");
        return name.trim().toLowerCase() === savedName.trim().toLowerCase();
      });

      if (!customerData) {
        console.error("Customer not found");
        setLoading(false);
        return;
      }

      setCustomer(customerData);

      // 2. Fetch full transaction history for this customer
      const txData = await api.get(`/customer-transactions?customer_id=${customerData.id}`);
      setTransactions(txData || []);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDebtTrend = () => {
    if (transactions.length === 0) return [0];
    let currentDebt = customer?.debt || 0;
    const history = [currentDebt];
    // Reconstruct history backwards (simplified)
    transactions.slice(0, 6).forEach(tx => {
      if (tx.type === 'credit') currentDebt -= tx.amount;
      else currentDebt += tx.amount;
      history.unshift(currentDebt);
    });
    return history;
  };

  const getPaymentTrend = () => {
    if (transactions.length === 0) return [0];
    let currentPaid = customer?.total_paid || 0;
    const history = [currentPaid];
    transactions.slice(0, 6).forEach(tx => {
      if (tx.type === 'payment') {
        currentPaid -= tx.amount;
        history.unshift(currentPaid);
      }
    });
    return history;
  };

  if (loading) return <div className="p-8 text-center text-gray-400 font-bold">جاري التحميل...</div>;

  if (!customer) return <div className="p-8 text-center text-rose-600 font-bold">لم يتم العثور على بيانات الزبون.</div>;

  return (
    <div className="p-8 pb-20 bg-[#f9fafb] min-h-screen font-sans">
      <div className="mb-10 text-right">
        <h1 className="text-4xl font-black text-gray-800 tracking-tight">أهلاً بك، {customer.name}</h1>
        <p className="text-gray-500 mt-2 font-medium">مرحباً بك في لوحة تحكم زبائن مخبز السعادة البلدي</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <PremiumChartCard
          title="رصيدك المدين"
          value={customer.debt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          unit="₪"
          subText="المبلغ المتبقي المترصد في ذمتك"
          data={getDebtTrend()}
          color="rose"
          type="sparkline"
          icon={<AlertIcon />}
        />
        <PremiumChartCard
          title="إجمالي المدفوعات"
          value={customer.total_paid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          unit="₪"
          subText="إجمالي المبالغ المسددة حتى الآن"
          data={getPaymentTrend()}
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
                <tr key={tx.id} className="group hover:bg-amber-50/20 transition-colors font-sans">
                  <td className="px-8 py-6 text-gray-400">{tx.date}</td>
                  <td className="px-8 py-6">
                    <span className={`font-bold font-regular ${tx.type === 'credit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {tx.type === 'credit' ? 'شراء بالدين' : 'دفعة نقدية'}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-800 font-regular">{tx.item || "-"}</td>
                  <td className="px-8 py-6 text-gray-500">{tx.quantity?.toLocaleString('en-US') || "-"}</td>
                  <td className="px-8 py-6 font-black text-lg text-gray-800">{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</td>
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
