"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Customer = { id: number; name: string; phone: string; debt: number; total_paid: number; status: string };
type BreadType = { id: number; name: string; price: number };
type Transaction = { id: number; customer_id: number; type: string; item: string | null; quantity: number | null; amount: number; date: string };

export default function CustomersPage() {
  const [role, setRole] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [breadTypes, setBreadTypes] = useState<BreadType[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreditForm, setShowCreditForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") || "admin";
    setRole(savedRole);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [cusRes, breadRes, txRes] = await Promise.all([
      supabase.from("customers").select("*").order("id"),
      supabase.from("bread_types").select("*").order("id"),
      supabase.from("customer_transactions").select("*").order("created_at", { ascending: false }),
    ]);
    if (cusRes.data) setCustomers(cusRes.data);
    if (breadRes.data) setBreadTypes(breadRes.data);
    if (txRes.data) setTransactions(txRes.data);
    setLoading(false);
  };

  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === Number(selectedCustomerId));
    const item = breadTypes.find(i => i.id === Number(selectedItemId));
    if (!customer || !item) return;

    const totalCost = item.price * Number(quantity);

    const { error: txErr } = await supabase.from("customer_transactions").insert({
      customer_id: customer.id,
      type: "credit",
      item: item.name,
      quantity: Number(quantity),
      amount: totalCost,
      date: new Date().toISOString().split("T")[0],
    });

    if (!txErr) {
      await supabase.from("customers").update({ debt: customer.debt + totalCost }).eq("id", customer.id);
      fetchData();
    }
    setShowCreditForm(false);
    resetForms();
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === Number(selectedCustomerId));
    if (!customer) return;

    const paidAmount = Number(paymentAmount);

    const { error: txErr } = await supabase.from("customer_transactions").insert({
      customer_id: customer.id,
      type: "payment",
      item: null,
      quantity: null,
      amount: paidAmount,
      date: new Date().toISOString().split("T")[0],
    });

    if (!txErr) {
      await supabase.from("customers").update({
        debt: Math.max(0, customer.debt - paidAmount),
        total_paid: customer.total_paid + paidAmount,
      }).eq("id", customer.id);
      fetchData();
    }
    setShowPaymentForm(false);
    resetForms();
  };

  const resetForms = () => {
    setSelectedCustomerId("");
    setSelectedItemId("");
    setQuantity("");
    setPaymentAmount("");
  };

  if (loading) return <div className="p-8 text-center text-gray-400 font-bold">جاري التحميل...</div>;

  return (
    <div className="p-8 pb-20 bg-[#f9fafb] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">إدارة الزبائن</h1>
          <p className="text-gray-500 mt-2 font-medium">متابعة حسابات الديون، تحصيل المدفوعات، وسجل العمليات</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => { setShowPaymentForm(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-emerald-700 text-white rounded-[22px] font-bold hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/10 group transform active:scale-95"
          >
            <span>قبض دفعة</span>
          </button>
          <button
            onClick={() => { setShowCreditForm(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-amber-800 text-white rounded-[22px] font-bold hover:bg-amber-900 transition-all shadow-xl shadow-amber-900/20 group transform active:scale-95"
          >
            <span>بيع بالدين</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">إجمالي الديون المستحقة</p>
           <h2 className="text-3xl font-black text-rose-600">
             {customers.reduce((acc, c) => acc + c.debt, 0).toFixed(2)} ₪
           </h2>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">إجمالي المسدّد</p>
           <h2 className="text-3xl font-black text-emerald-600">
             {customers.reduce((acc, c) => acc + c.total_paid, 0).toFixed(2)} ₪
           </h2>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">عدد الزبائن المدينين</p>
           <h2 className="text-3xl font-black text-amber-800">
             {customers.filter(c => c.debt > 0).length}
           </h2>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
           <h3 className="text-xl font-bold text-gray-800">قائمة الحسابات</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">الزبون</th>
                <th className="px-8 py-6">الرقم</th>
                <th className="px-8 py-6">إجمالي المسدد</th>
                <th className="px-8 py-6">الرصيد المدين</th>
                <th className="px-8 py-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c) => (
                <tr key={c.id} className="group hover:bg-amber-50/20 transition-colors">
                  <td className="px-8 py-6 font-bold text-gray-800">{c.name}</td>
                  <td className="px-8 py-6 text-gray-400 font-sans">{c.phone}</td>
                  <td className="px-8 py-6 font-bold text-gray-500">{c.total_paid.toFixed(2)} ₪</td>
                  <td className="px-8 py-6">
                    <span className={`font-black text-lg ${c.debt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {c.debt.toFixed(2)} ₪
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                       <button
                          className="text-white bg-amber-800 text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-amber-900 transition-all uppercase"
                          onClick={() => { setSelectedCustomerId(c.id.toString()); setShowCreditForm(true); }}
                       >
                         + دين
                       </button>
                       <button
                          className="text-white bg-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-emerald-800 transition-all uppercase"
                          onClick={() => { setSelectedCustomerId(c.id.toString()); setShowPaymentForm(true); }}
                       >
                         $ دفع
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreditForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-black mb-8">تسجيل عملية بيع بالدين</h2>
            <form onSubmit={handleAddCredit} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-black mb-2 mr-1">اختر الزبون</label>
                <select
                  required value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black"
                >
                  <option value="">اختر...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-black mb-2 mr-1">الصنف</label>
                  <select
                    required value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black"
                  >
                    <option value="">اختر الصنف...</option>
                    {breadTypes.map(i => <option key={i.id} value={i.id}>{i.name} ({i.price} ₪)</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2 mr-1">الكمية</label>
                  <input type="number" required value={quantity} onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black" placeholder="0" />
                </div>
              </div>
              {selectedItemId && quantity && (
                <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 flex justify-between items-center">
                   <p className="font-bold text-rose-900 italic">إجمالي القيمة المضافة للدين:</p>
                   <p className="text-3xl font-black text-rose-700 uppercase">
                     {(breadTypes.find(i => i.id === Number(selectedItemId))?.price || 0) * Number(quantity)} ₪
                   </p>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-5 bg-amber-800 text-white rounded-[24px] font-black text-xl hover:bg-amber-900 shadow-2xl shadow-amber-900/30 transform active:scale-95">حفظ العملية</button>
                <button type="button" onClick={() => { setShowCreditForm(false); resetForms(); }} className="px-8 py-5 bg-gray-100 text-gray-500 rounded-[24px] font-black text-xl hover:bg-gray-200">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-black mb-8">تسجيل قبض مبلغ مالي</h2>
            <form onSubmit={handleAddPayment} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-black mb-2 mr-1">الزبون الدافع</label>
                <select
                  required value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-black"
                >
                  <option value="">اختر الزبون...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} (مدين بـ {c.debt.toFixed(2)} ₪)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-4 text-center">المبلغ المقبوض</label>
                <input type="number" step="0.01" required value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full text-center text-4xl font-black bg-emerald-50/30 border border-emerald-100 rounded-[32px] py-8 focus:outline-none focus:ring-8 focus:ring-emerald-500/10 text-emerald-800 placeholder-emerald-200"
                  placeholder="0.00" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-5 bg-emerald-700 text-white rounded-[24px] font-black text-xl hover:bg-emerald-800 shadow-2xl shadow-emerald-900/30 transform active:scale-95">تأكيد الاستلام</button>
                <button type="button" onClick={() => { setShowPaymentForm(false); resetForms(); }} className="px-8 py-5 bg-gray-100 text-gray-500 rounded-[24px] font-black text-xl hover:bg-gray-200">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
