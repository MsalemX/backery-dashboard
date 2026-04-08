"use client";

import { useState, useEffect } from "react";

export default function CustomersPage() {
  const [role, setRole] = useState("");

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") || "admin";
    setRole(savedRole);
  }, []);
  const [customers, setCustomers] = useState([
    { id: 1, name: "سوبر ماركت الأمل", phone: "0599123456", debt: 450.50, totalPaid: 1200.00, status: "نشط" },
    { id: 2, name: "مطعم القدس", phone: "0598776655", debt: 0.00, totalPaid: 3500.00, status: "نشط" },
    { id: 3, name: "بقالة الياسمين", phone: "0599654321", debt: 85.00, totalPaid: 450.00, status: "نشط" },
    { id: 4, name: "كافيه دي لوكس", phone: "0597112233", debt: 1200.00, totalPaid: 150.00, status: "متأخر" },
  ]);

  const [breadTypes] = useState([
    { id: 1, name: "خبز بلدي", price: 1.50 },
    { id: 2, name: "صمون", price: 2.00 },
    { id: 3, name: "كرواسون", price: 5.00 },
    { id: 4, name: "خبز فرنسي", price: 3.50 },
  ]);

  const [transactions, setTransactions] = useState([
    { id: 1001, customerName: "سوبر ماركت الأمل", type: "credit", item: "خبز بلدي", quantity: 100, amount: 150.00, date: "2024/08/08" },
    { id: 1002, customerName: "سوبر ماركت الأمل", type: "payment", amount: 100.00, date: "2024/08/07" },
    { id: 1003, customerName: "كافيه دي لوكس", type: "credit", item: "كرواسون", quantity: 50, amount: 250.00, date: "2024/08/06" },
  ]);

  const [showCreditForm, setShowCreditForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const handleAddCredit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === Number(selectedCustomerId));
    const item = breadTypes.find(i => i.id === Number(selectedItemId));
    if (!customer || !item) return;

    const totalCost = item.price * Number(quantity);
    const newTransaction = {
      id: transactions.length + 1001,
      customerName: customer.name,
      type: "credit",
      item: item.name,
      quantity: Number(quantity),
      amount: totalCost,
      date: new Date().toLocaleDateString('en-ZA').replace(/-/g, '/'),
    };

    setTransactions([newTransaction, ...transactions]);
    setCustomers(customers.map(c => 
      c.id === customer.id ? { ...c, debt: c.debt + totalCost } : c
    ));
    setShowCreditForm(false);
    resetForms();
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === Number(selectedCustomerId));
    if (!customer) return;

    const paidAmount = Number(paymentAmount);
    const newTransaction = {
      id: transactions.length + 1001,
      customerName: customer.name,
      type: "payment",
      amount: paidAmount,
      date: new Date().toLocaleDateString('en-ZA').replace(/-/g, '/'),
    };

    setTransactions([newTransaction, ...transactions]);
    setCustomers(customers.map(c => 
      c.id === customer.id ? { 
        ...c, 
        debt: Math.max(0, c.debt - paidAmount), 
        totalPaid: c.totalPaid + paidAmount 
      } : c
    ));
    setShowPaymentForm(false);
    resetForms();
  };

  const resetForms = () => {
    setSelectedCustomerId("");
    setSelectedItemId("");
    setQuantity("");
    setPaymentAmount("");
  };

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
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">مدفوعات الشهر الحالي</p>
           <h2 className="text-3xl font-black text-emerald-600">5,420.00 ₪</h2>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">عدد الزبائن المدينين</p>
           <h2 className="text-3xl font-black text-amber-800">
             {customers.filter(c => c.debt > 0).length}
           </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden h-fit">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
             <h3 className="text-xl font-bold text-gray-800">قائمة الحسابات</h3>
             <div className="flex bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
                <input 
                  type="text" 
                  placeholder="بحث عن زبون..." 
                  className="bg-transparent text-sm font-bold focus:outline-none text-black placeholder-gray-300"
                />
             </div>
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
                    <td className="px-8 py-6 font-bold text-gray-500">{c.totalPaid.toFixed(2)} ₪</td>
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
      </div>

      {/* Credit Sale Modal */}
      {showCreditForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-black mb-8">تسجيل عملية بيع بالدين</h2>
            <form onSubmit={handleAddCredit} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-black mb-2 mr-1">اختر الزبون</label>
                <select 
                  required
                  value={selectedCustomerId}
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
                    required
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black"
                  >
                    <option value="">اختر الصنف...</option>
                    {breadTypes.map(i => <option key={i.id} value={i.id}>{i.name} ({i.price} ₪)</option>)}
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

      {/* Payment Received Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-black mb-8">تسجيل قبض مبلغ مالي</h2>
            <form onSubmit={handleAddPayment} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-black mb-2 mr-1">الزبون الدافع</label>
                <select 
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-black"
                >
                  <option value="">اختر الزبون...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} (مدين بـ {c.debt.toFixed(2)} ₪)</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-black mb-4 text-center">المبلغ المقبوض</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full text-center text-4xl font-black bg-emerald-50/30 border border-emerald-100 rounded-[32px] py-8 focus:outline-none focus:ring-8 focus:ring-emerald-500/10 text-emerald-800 placeholder-emerald-200"
                  placeholder="0.00"
                />
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
