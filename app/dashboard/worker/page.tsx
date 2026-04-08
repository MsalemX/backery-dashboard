"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function WorkerDashboard() {
  const [role, setRole] = useState("");
  const [originalStock, setOriginalStock] = useState(5000); // Daily Batch
  
  const [customers] = useState([
    { id: 1, name: "سوبر ماركت الأمل", fieldStock: 0 },
    { id: 2, name: "مطعم القدس", fieldStock: 0 },
    { id: 3, name: "بقالة الياسمين", fieldStock: 0 },
  ]);

  const [breadTypes] = useState([
    { id: 1, name: "خبز بلدي", price: 1.50 },
    { id: 2, name: "صمون", price: 2.00 },
  ]);

  const [transactions, setTransactions] = useState([
    { id: 1, type: "give", customer: "سوبر ماركت الأمل", item: "خبز بلدي", quantity: 100, time: "08:30 AM" },
    { id: 2, type: "take", customer: "بقالة الياسمين", item: "صمون", quantity: 5, time: "09:15 AM" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"give" | "take">("give");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") || "admin";
    setRole(savedRole);
  }, []);

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const qNum = Number(quantity);
    if (qNum <= 0) return;

    if (modalType === "give") {
      setOriginalStock(prev => prev - qNum);
    } else {
      setOriginalStock(prev => prev + qNum);
    }

    const newTx = {
      id: transactions.length + 1,
      type: modalType,
      customer: customers.find(c => c.id === Number(selectedCustomer))?.name || "عام",
      item: breadTypes.find(i => i.id === Number(selectedItem))?.name || "منتج",
      quantity: qNum,
      time: new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }),
    };

    setTransactions([newTx, ...transactions]);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedCustomer("");
    setSelectedItem("");
    setQuantity("");
  };

  return (
    <div className="flex bg-[#f9fafb] min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 mr-64 p-10">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black text-black tracking-tight">لوحة تحكم الميدان</h1>
            <p className="text-gray-500 mt-2 font-medium">إدارة توزيع المنتجات ومرتجبات الزبائن</p>
          </div>
          <div className="bg-white px-8 py-5 rounded-[32px] border border-gray-100 shadow-sm text-center">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">المخزون الأصلي (للوردية)</p>
             <h2 className="text-3xl font-black text-amber-800">{originalStock} <span className="text-sm font-medium">رغيف</span></h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
           <button 
             onClick={() => { setModalType("give"); setShowModal(true); }}
             className="group bg-amber-800 p-10 rounded-[48px] shadow-2xl shadow-amber-900/20 text-white flex flex-col items-center gap-4 border-2 border-transparent hover:border-amber-400 transition-all transform hover:-translate-y-2"
           >
              <div className="w-20 h-20 bg-amber-900/50 rounded-3xl flex items-center justify-center">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                 </svg>
              </div>
              <div className="text-center">
                 <h3 className="text-2xl font-black mb-1">تسليم طلبية</h3>
                 <p className="text-amber-200/60 font-medium">صرف الخبز للزبائن في الميدان</p>
              </div>
           </button>

           <button 
             onClick={() => { setModalType("take"); setShowModal(true); }}
             className="group bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm flex flex-col items-center gap-4 hover:shadow-2xl hover:shadow-gray-200/50 transition-all transform hover:-translate-y-2"
           >
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center">
                 <svg className="w-10 h-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                 </svg>
              </div>
              <div className="text-center">
                 <h3 className="text-2xl font-black text-black mb-1">استلام مرتجع</h3>
                 <p className="text-gray-400 font-medium">إرجاع المنتجات للمخزون الأصلي</p>
              </div>
           </button>
        </div>

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
              <h3 className="text-xl font-bold text-black">آخر عمليات الميدان</h3>
              <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black text-gray-500">محدث لحظياً</span>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-right">
                 <thead>
                    <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-widest">
                       <th className="px-8 py-6">العملية</th>
                       <th className="px-8 py-6">الزبون</th>
                       <th className="px-8 py-6">المنتج</th>
                       <th className="px-8 py-6">الكمية</th>
                       <th className="px-8 py-6">الوقت</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {transactions.map(tx => (
                       <tr key={tx.id} className="group hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                               tx.type === 'give' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                             }`}>
                               {tx.type === 'give' ? 'صرف للزبون' : 'مرتجع للمحل'}
                             </span>
                          </td>
                          <td className="px-8 py-6 font-bold text-black">{tx.customer}</td>
                          <td className="px-8 py-6 font-medium text-gray-600">{tx.item}</td>
                          <td className="px-8 py-6 text-xl font-black text-black">
                             {tx.type === 'give' ? '-' : '+'}{tx.quantity}
                          </td>
                          <td className="px-8 py-6 text-xs text-gray-400 font-bold">{tx.time}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Transaction Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[48px] w-full max-w-lg p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
               <h2 className="text-3xl font-black text-black mb-8">
                 {modalType === 'give' ? 'تسجيل صرف طلبيّة' : 'تسجيل استلام مرتجع'}
               </h2>
               <form onSubmit={handleTransaction} className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-black mb-2 mr-1">اختر الزبون</label>
                    <select 
                      required
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black"
                    >
                      <option value="">اختر...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-black mb-2 mr-1">الصنف</label>
                    <select 
                      required
                      value={selectedItem}
                      onChange={(e) => setSelectedItem(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black"
                    >
                      <option value="">اختر الصنف...</option>
                      {breadTypes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-black mb-2 mr-1">الكمية</label>
                    <input
                      type="number"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="submit" className={`flex-1 py-5 rounded-[24px] font-black text-xl text-white shadow-2xl transition-all transform active:scale-95 ${
                      modalType === 'give' ? 'bg-amber-800 hover:bg-amber-900 shadow-amber-900/30' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/30'
                    }`}>
                      {modalType === 'give' ? 'تأكيد الصرف' : 'تأكيد الاستلام'}
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
