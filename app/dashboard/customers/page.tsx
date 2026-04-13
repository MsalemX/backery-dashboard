"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
  const [showFlourForm, setShowFlourForm] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [flourAmount, setFlourAmount] = useState("");
  const [flourType, setFlourType] = useState<"credit" | "debt">("credit");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

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
      supabase.from("customer_transactions").select("*").order("date", { ascending: false }),
    ]);
    if (cusRes.data) setCustomers(cusRes.data);
    if (breadRes.data) setBreadTypes(breadRes.data);
    if (txRes.data) setTransactions(txRes.data);
    setLoading(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      const newDebt = Math.max(0, customer.debt - paidAmount);
      const extra = Math.max(0, paidAmount - customer.debt);
      
      await supabase.from("customers").update({
        debt: newDebt,
        financial_credit: (customer.financial_credit || 0) + extra,
        total_paid: customer.total_paid + paidAmount,
      }).eq("id", customer.id);
      fetchData();
    }
    setShowPaymentForm(false);
    resetForms();
  };

  const handleFlourTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === Number(selectedCustomerId));
    if (!customer || !flourAmount) return;

    const amount = Number(flourAmount);
    const updates: any = {};
    
    if (flourType === "credit") {
      updates.flour_credit = (customer.flour_credit || 0) + amount;
    } else {
      updates.flour_debt = (customer.flour_debt || 0) + amount;
    }

    const { error: txErr } = await supabase.from("customer_transactions").insert({
      customer_id: customer.id,
      type: flourType === "credit" ? "flour_deposit" : "flour_usage",
      item: "طحين",
      quantity: amount,
      amount: 0,
      date: new Date().toISOString().split("T")[0],
    });

    if (!txErr) {
      await supabase.from("customers").update(updates).eq("id", customer.id);
      fetchData();
    }
    setShowFlourForm(false);
    setFlourAmount("");
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    const { error } = await supabase.from("customers")
      .update({ name: editingCustomer.name, phone: editingCustomer.phone })
      .eq("id", editingCustomer.id);
    if (!error) {
      fetchData();
      setShowEditForm(false);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الزبون نهائياً؟")) {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (!error) fetchData();
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;
    const { error } = await supabase.from("customers").insert({
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim(),
      debt: 0,
      total_paid: 0,
      financial_credit: 0,
      flour_credit: 0,
      flour_debt: 0,
      status: "active",
    });
    if (!error) {
      fetchData();
      setShowAddCustomerForm(false);
      setNewCustomerName("");
      setNewCustomerPhone("");
    } else {
      alert("خطأ في الإضافة: " + error.message);
    }
  };

  const handleLongPress = (customer: Customer) => {
    setSelectedCustomerId(customer.id.toString());
    setEditingCustomer(customer);
    // Open a context menu or just use a modern modal for choices
    setShowEditOptions(true);
  };

  const [showEditOptions, setShowEditOptions] = useState(false);

  const startPress = (customer: Customer) => {
    const timer = setTimeout(() => handleLongPress(customer), 600);
    setPressTimer(timer);
  };

  const endPress = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  const resetForms = () => {
    setSelectedCustomerId("");
    setSelectedItemId("");
    setQuantity("");
    setPaymentAmount("");
    setEditingCustomer(null);
  };

  if (loading) return <div className="p-8 text-center text-gray-400 font-bold">جاري التحميل...</div>;

  return (
    <div className="p-8 pb-20 bg-[#f9fafb] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="text-right">
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">إدارة الزبائن</h1>
          <p className="text-gray-500 mt-2 font-medium">متابعة حسابات الديون، تحصيل المدفوعات، وسجل العمليات</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowAddCustomerForm(true)}
            className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-[22px] font-bold hover:bg-gray-50 transition-all shadow-sm group"
          >
            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>إضافة زبون</span>
          </button>
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
           <h2 className="text-3xl font-black text-rose-600 font-sans">
             {customers.reduce((acc, c) => acc + (c.debt ?? 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
           </h2>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">إجمالي المسدّد</p>
           <h2 className="text-3xl font-black text-emerald-600 font-sans">
             {customers.reduce((acc, c) => acc + (c.total_paid ?? 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
           </h2>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">عدد الزبائن المدينين</p>
           <h2 className="text-3xl font-black text-amber-800 font-sans">
             {customers.filter(c => (c.debt ?? 0) > 0).length.toLocaleString('en-US')}
           </h2>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center bg-gray-50/30 gap-4">
           <h3 className="text-xl font-bold text-gray-800">قائمة الحسابات</h3>
           <div className="relative w-full md:w-72">
             <span className="absolute inset-y-0 right-4 flex items-center text-gray-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </span>
             <input 
               type="text" 
               placeholder="ابحث عن زبون..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pr-12 pl-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-gray-800 text-right" 
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
              {filteredCustomers.map((c) => (
                <tr 
                  key={c.id} 
                  className="group hover:bg-amber-50/20 transition-colors cursor-pointer select-none active:bg-amber-100/50"
                  onMouseDown={() => startPress(c)}
                  onMouseUp={endPress}
                  onMouseLeave={endPress}
                  onTouchStart={() => startPress(c)}
                  onTouchEnd={endPress}
                >
                  <td className="px-8 py-6 font-bold text-gray-800">{c.name}</td>
                  <td className="px-8 py-6 text-gray-400 font-sans">{c.phone}</td>
                  <td className="px-8 py-6 font-bold text-gray-500 font-sans">{(c.total_paid ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</td>
                  <td className="px-8 py-6">
                    <span className={`font-black text-lg font-sans ${(c.debt ?? 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {(c.debt ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                       <button
                          className="text-white bg-blue-600 text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all uppercase"
                          onClick={(e) => { e.stopPropagation(); setSelectedCustomerId(c.id.toString()); setShowStatement(true); }}
                       >
                         كشف حساب
                       </button>
                       <button
                          className="text-white bg-amber-800 text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-amber-900 transition-all uppercase"
                          onClick={(e) => { e.stopPropagation(); setSelectedCustomerId(c.id.toString()); setShowCreditForm(true); }}
                       >
                         + دين
                       </button>
                       <button
                          className="text-white bg-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-emerald-800 transition-all uppercase"
                          onClick={(e) => { e.stopPropagation(); setSelectedCustomerId(c.id.toString()); setShowPaymentForm(true); }}
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
                   <p className="text-3xl font-black text-rose-700 uppercase font-sans">
                      {((breadTypes.find(i => i.id === Number(selectedItemId))?.price || 0) * Number(quantity)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl">
            <h2 className="text-3xl font-black text-black mb-8">تسجيل قبض مبلغ مالي</h2>
            <form onSubmit={handleAddPayment} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-black mb-2 mr-1 text-right">الزبون الدافع</label>
                <select required value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-black text-right">
                  <option value="">اختر الزبون...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} (مدين بـ {(c.debt ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-4 text-center">المبلغ المقبوض</label>
                <input type="number" step="0.01" required value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full text-center text-4xl font-black bg-emerald-50/30 border border-emerald-100 rounded-[32px] py-8 text-emerald-800" placeholder="0.00" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-5 bg-emerald-700 text-white rounded-[24px] font-black text-xl hover:bg-emerald-800 transform active:scale-95">تأكيد الاستلام</button>
                <button type="button" onClick={() => { setShowPaymentForm(false); resetForms(); }} className="px-8 py-5 bg-gray-100 text-gray-500 rounded-[24px] font-black text-xl hover:bg-gray-200">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditOptions && editingCustomer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-300">
            <h3 className="text-2xl font-black text-gray-800 text-center mb-8">{editingCustomer.name}</h3>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => { setShowEditOptions(false); setShowStatement(true); }}
                className="w-full py-5 bg-blue-50 text-blue-700 rounded-2xl font-black text-lg hover:bg-blue-100 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                عرض كشف الحساب
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setSelectedCustomerId(editingCustomer.id.toString()); setShowPaymentForm(true); }}
                  className="px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black hover:bg-emerald-100 transition-colors"
                >
                  تسديد مالي
                </button>
                <button
                  onClick={() => { setSelectedCustomerId(editingCustomer.id.toString()); setShowFlourForm(true); }}
                  className="px-4 py-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-black hover:bg-blue-100 transition-colors"
                >
                  معاملة طحين
                </button>
              </div>
              <button 
                 onClick={() => { setShowEditOptions(false); setShowEditForm(true); }}
                 className="w-full py-5 bg-amber-50 text-amber-700 rounded-2xl font-black text-lg hover:bg-amber-100 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                تعديل البيانات
              </button>
              <button 
                onClick={() => { setShowEditOptions(false); handleDeleteCustomer(editingCustomer.id); }}
                className="w-full py-5 bg-rose-50 text-rose-600 rounded-2xl font-black text-lg hover:bg-rose-100 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                حذف الزبون
              </button>
              <button 
                onClick={() => setShowEditOptions(false)}
                className="w-full py-4 mt-2 text-gray-400 font-bold hover:text-gray-600"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditForm && editingCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl">
            <h2 className="text-3xl font-black text-black mb-8 text-right">تعديل بيانات الزبون</h2>
            <form onSubmit={handleUpdateCustomer} className="space-y-6 text-right">
              <div>
                <label className="block text-sm font-black text-black mb-2 mr-1">الاسم</label>
                <input type="text" required value={editingCustomer.name} onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-black" />
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-2 mr-1">رقم الهاتف</label>
                <input type="text" required value={editingCustomer.phone} onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-black" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-5 bg-amber-800 text-white rounded-[24px] font-black text-xl hover:bg-amber-900 shadow-2xl shadow-amber-900/30 transform active:scale-95">حفظ التغييرات</button>
                <button type="button" onClick={() => setShowEditForm(false)} className="px-8 py-5 bg-gray-100 text-gray-500 rounded-[24px] font-black text-xl hover:bg-gray-200">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStatement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] w-full max-w-4xl p-10 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-8" dir="rtl">
              <div>
                <h2 className="text-3xl font-black text-black">كشف حساب مفصل</h2>
                <p className="text-gray-500 font-bold mt-1">الزبون: {customers.find(c => c.id === Number(selectedCustomerId))?.name}</p>
              </div>
              <button onClick={() => setShowStatement(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 text-right" dir="rtl">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4">التاريخ</th>
                    <th className="px-6 py-4">البيان</th>
                    <th className="px-6 py-4">الصنف</th>
                    <th className="px-6 py-4">الكمية</th>
                    <th className="px-6 py-4">مدين (أخذ)</th>
                    <th className="px-6 py-4">دائن (دفع)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.filter(tx => tx.customer_id === Number(selectedCustomerId)).map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 font-sans">
                      <td className="px-6 py-4 text-gray-400 text-xs">{tx.date}</td>
                      <td className="px-6 py-4 font-bold text-gray-800 text-sm font-regular">
                        {tx.type === 'credit' ? 'شراء بضاعة' : 'تسديد مبلغ'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium text-sm font-regular">{tx.item || "—"}</td>
                      <td className="px-6 py-4 text-gray-500 font-bold text-sm">{tx.quantity?.toLocaleString('en-US') || "—"}</td>
                      <td className="px-6 py-4 font-black text-rose-600">
                        {tx.type === 'credit' ? `${(tx.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪` : ""}
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-600">
                        {tx.type === 'payment' ? `${(tx.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center" dir="rtl">
               <div className="flex flex-col items-end">
                  <span className="text-xl font-black text-rose-600 font-sans tracking-tighter">
                    {(customers.find(c => c.id === Number(selectedCustomerId))?.debt ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">الدين المالي</span>
                  <div className="flex gap-4 mt-2 border-t border-gray-50 pt-2">
                     <div className="text-center">
                        <p className="text-[11px] font-black text-blue-600 font-sans">
                          {(customers.find(c => c.id === Number(selectedCustomerId))?.flour_credit ?? 0).toLocaleString('en-US')} كجم
                        </p>
                       <p className="text-[9px] font-bold text-gray-400">طحين له</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[11px] font-black text-amber-600 font-sans">
                          {(customers.find(c => c.id === Number(selectedCustomerId))?.flour_debt ?? 0).toLocaleString('en-US')} كجم
                        </p>
                       <p className="text-[9px] font-bold text-gray-400">طحين عليه</p>
                     </div>
                  </div>
               </div>
               <button onClick={() => window.print()} className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2h6a2 2 0 002 2v4" /></svg>
                 طباعة كشف الحساب
               </button>
            </div>
          </div>
        </div>
      )}
      {showAddCustomerForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] w-full max-w-md p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-black">إضافة زبون جديد</h2>
              <button onClick={() => { setShowAddCustomerForm(false); setNewCustomerName(""); setNewCustomerPhone(""); }} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-6 text-right">
              <div>
                <label className="block text-sm font-black text-black mb-2 mr-1">اسم الزبون <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black text-right"
                  placeholder="مثلاً: أحمد محمد"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-2 mr-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black text-right"
                  placeholder="05xxxxxxxxx"
                />
              </div>
              <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 text-right">
                <p className="text-xs font-bold text-amber-700">📋 سيتم إنشاء حساب جديد بدون ديون مبدئية</p>
                <p className="text-[11px] text-amber-600 mt-1">يمكنك إضافة عمليات الدين والدفع لاحقاً</p>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-5 bg-amber-800 text-white rounded-[24px] font-black text-xl hover:bg-amber-900 transition-all shadow-xl shadow-amber-900/30 transform active:scale-[0.98]">
                  ✓ حفظ وإضافة الزبون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFlourForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-black mb-8 text-right">إدارة رصيد الطحين</h2>
            <form onSubmit={handleFlourTransaction} className="space-y-6 text-right">
              <div className="flex gap-4 mb-4 bg-gray-100 p-2 rounded-2xl">
                <button type="button" onClick={() => setFlourType("credit")}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${flourType === "credit" ? 'bg-white shadow-sm text-blue-700' : 'text-gray-400'}`}>رصيد له (إيداع)</button>
                <button type="button" onClick={() => setFlourType("debt")}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${flourType === "debt" ? 'bg-white shadow-sm text-amber-700' : 'text-gray-400'}`}>دين عليه (سحب)</button>
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-4 text-center">كمية الطحين (بالكيلو)</label>
                <input type="number" required value={flourAmount} onChange={(e) => setFlourAmount(e.target.value)}
                  className="w-full text-center text-5xl font-black bg-gray-50 border-2 border-gray-100 rounded-[32px] py-8 text-black" placeholder="0" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-5 bg-black text-white rounded-[24px] font-black text-xl hover:bg-gray-800 shadow-2xl transform active:scale-95">تأكيد العملية</button>
                <button type="button" onClick={() => setShowFlourForm(false)} className="px-8 py-5 bg-gray-100 text-gray-500 rounded-[24px] font-black text-xl hover:bg-gray-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
