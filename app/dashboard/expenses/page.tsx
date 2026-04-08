"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";

type Expense = { id: number; category: string; amount: number; description: string; date: string };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: "", amount: "", description: "" });

  const categories = ["مواد خام", "كهرباء ومياه", "رواتب", "صيانة", "وقود", "أخرى"];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const { data } = await supabase.from("expenses").select("*").order("date", { ascending: false });
    if (data) setExpenses(data);
    setLoading(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.amount) return;
    const { error } = await supabase.from("expenses").insert({
      category: newExpense.category,
      amount: Number(newExpense.amount),
      description: newExpense.description,
      date: new Date().toISOString().split("T")[0],
    });
    if (!error) {
      fetchExpenses();
      setShowModal(false);
      setNewExpense({ category: "", amount: "", description: "" });
    }
  };

  const handleDelete = async (id: number) => {
    await supabase.from("expenses").delete().eq("id", id);
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const totalThisMonth = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const topCategory = expenses.length ? expenses.reduce((acc, e) => {
    const map: Record<string, number> = {};
    expenses.forEach(x => map[x.category] = (map[x.category] || 0) + x.amount);
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  }, "") : "";

  if (loading) return <div className="p-8 text-center text-gray-400 font-bold">جاري التحميل...</div>;

  return (
    <div className="flex bg-[#f9fafb] min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 mr-64 p-10">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-800 tracking-tight">المصروفات التشغيلية</h1>
            <p className="text-gray-500 mt-2 font-medium">متابعة كافة التكاليف والمصاريف اليومية للمخبز</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 px-8 py-4 bg-amber-800 text-white rounded-[22px] font-bold hover:bg-amber-900 transition-all shadow-xl shadow-amber-900/20 group"
          >
            <span>إضافة مصروف جديد</span>
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">إجمالي المصروفات</p>
              <h2 className="text-4xl font-black text-rose-600">{totalThisMonth.toLocaleString()} <span className="text-sm font-medium text-gray-400">₪</span></h2>
           </div>
           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">أكبر تصنيف مصروفات</p>
              <h2 className="text-4xl font-black text-amber-800">{topCategory || "—"}</h2>
           </div>
           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">عدد العمليات</p>
              <h2 className="text-4xl font-black text-blue-600">{expenses.length} <span className="text-sm font-medium text-gray-400">عملية</span></h2>
           </div>
        </div>

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
              <h3 className="text-xl font-bold text-black">سجل المصروفات</h3>
              <div className="flex gap-4">
                 <select className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all">
                    <option>كافة التصنيفات</option>
                    {categories.map(c => <option key={c}>{c}</option>)}
                 </select>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                 <thead>
                    <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-widest border-b border-gray-50">
                       <th className="px-8 py-6">التاريخ</th>
                       <th className="px-8 py-6">التصنيف</th>
                       <th className="px-8 py-6">المبلغ</th>
                       <th className="px-8 py-6">الوصف</th>
                       <th className="px-8 py-6 text-center">إجراءات</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {expenses.map(exp => (
                       <tr key={exp.id} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6 font-bold text-gray-400 text-xs">{exp.date}</td>
                          <td className="px-8 py-6">
                             <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black text-gray-600 uppercase">
                               {exp.category}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-lg font-black text-rose-600">{exp.amount.toLocaleString()} ₪</span>
                          </td>
                          <td className="px-8 py-6 font-medium text-gray-700">{exp.description}</td>
                          <td className="px-8 py-6">
                             <div className="flex justify-center">
                                <button onClick={() => handleDelete(exp.id)} className="p-2 text-gray-300 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50">
                                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                   </svg>
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[48px] w-full max-w-lg p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
               <h2 className="text-3xl font-black text-black mb-8">تسجيل مصروف جديد</h2>
               <form onSubmit={handleAddExpense} className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-black mb-2 mr-1">تصنيف المصروف</label>
                    <select required value={newExpense.category} onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black">
                      <option value="">اختر التصنيف...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black mb-2 mr-1">المبلغ (₪)</label>
                    <input type="number" required value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black mb-2 mr-1">وصف المصروف</label>
                    <textarea value={newExpense.description} onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black min-h-[100px]"
                      placeholder="اكتب تفاصيل المصروف هنا..." />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 py-5 bg-amber-800 hover:bg-amber-900 text-white rounded-[24px] font-black text-xl shadow-2xl shadow-amber-900/30 transition-all transform active:scale-95">
                      حفظ المصروف
                    </button>
                    <button type="button" onClick={() => setShowModal(false)} className="px-8 py-5 bg-gray-100 text-gray-500 rounded-[24px] font-black text-xl hover:bg-gray-200">إلغاء</button>
                  </div>
               </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
