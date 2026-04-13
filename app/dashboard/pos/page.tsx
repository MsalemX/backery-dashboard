"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type POS = { id: number; name: string; location: string; contact: string; status: string; balance: number };
type BreadType = { id: number; name: string; price: number };
type POSRecord = { id: number; pos_id: number; pos_name: string; item: string; taken: number; returned: number; net: number; amount: number; date: string };
type POSTransaction = { id: number; pos_id: number; type: 'supply' | 'deposit'; item: string; quantity: number | null; amount: number; date: string; balance_after?: number };

export default function POSPage() {
  const [posList, setPosList] = useState<POS[]>([]);
  const [breadTypes, setBreadTypes] = useState<BreadType[]>([]);
  const [records, setRecords] = useState<POSRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [showSupplyForm, setShowSupplyForm] = useState(false);
  const [showPOSForm, setShowPOSForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [posTransactions, setPosTransactions] = useState<POSTransaction[]>([]);
  const [selectedPOS, setSelectedPOS] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantityTaken, setQuantityTaken] = useState("");
  const [quantityReturned, setQuantityReturned] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  
  // New POS form state
  const [newPOSName, setNewPOSName] = useState("");
  const [newPOSPhone, setNewPOSPhone] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [posRes, breadRes, recRes] = await Promise.all([
      supabase.from("pos").select("*").order("id"),
      supabase.from("bread_types").select("*").order("id"),
      supabase.from("pos_records").select("*").order("created_at", { ascending: false }),
    ]);
    if (posRes.data) setPosList(posRes.data);
    if (breadRes.data) setBreadTypes(breadRes.data);
    if (recRes.data) setRecords(recRes.data);
    setLoading(false);
  };

  const handleCreatePOS = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("pos").insert({
      name: newPOSName,
      contact: newPOSPhone,
      status: "نشط",
      location: "موقع غير محدد"
    });

    if (!error) {
      fetchData();
      setShowPOSForm(false);
      setNewPOSName("");
      setNewPOSPhone("");
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const pos = posList.find(p => p.id === Number(selectedPOS));
    const item = breadTypes.find(i => i.id === Number(selectedItem));
    if (!pos || !item) return;

    const takenNum = Number(quantityTaken);
    const returnedNum = Number(quantityReturned) || 0;
    const netNum = takenNum - returnedNum;
    const totalCost = netNum * item.price;

    const { error } = await supabase.from("pos_records").insert({
      pos_id: pos.id,
      pos_name: pos.name,
      item: item.name,
      taken: takenNum,
      returned: returnedNum,
      net: netNum,
      amount: totalCost,
      date: new Date().toISOString().split("T")[0],
    });

    if (!error) {
      // Deduct from POS balance
      const newBalance = pos.balance - totalCost;
      await supabase.from("pos").update({ balance: newBalance }).eq("id", pos.id);
      
      // Log transaction
      await supabase.from("pos_transactions").insert({
        pos_id: pos.id,
        type: 'supply',
        item: item.name,
        quantity: netNum,
        amount: totalCost,
        date: new Date().toISOString().split("T")[0]
      });

      fetchData();
      setShowSupplyForm(false);
      resetForm();
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pos = posList.find(p => p.id === Number(selectedPOS));
    if (!pos || !depositAmount) return;

    const amount = parseFloat(depositAmount);
    const newBalance = pos.balance + amount;
    const { error } = await supabase.from("pos").update({ balance: newBalance }).eq("id", pos.id);

    if (!error) {
      // Log transaction
      await supabase.from("pos_transactions").insert({
        pos_id: pos.id,
        type: 'deposit',
        item: 'شحن رصيد',
        quantity: 0,
        amount: amount,
        date: new Date().toISOString().split("T")[0]
      });

      fetchData();
      setShowDepositForm(false);
      setDepositAmount("");
      setSelectedPOS("");
    }
  };

  const fetchPosHistory = async (posId: number) => {
    setLoading(true);
    const { data } = await supabase
      .from("pos_transactions")
      .select("*")
      .eq("pos_id", posId)
      .order("created_at", { ascending: false });
    
    if (data) setPosTransactions(data);
    setSelectedPOS(posId.toString());
    setShowStatement(true);
    setLoading(false);
  };

  const resetForm = () => {
    setSelectedPOS("");
    setSelectedItem("");
    setQuantityTaken("");
    setQuantityReturned("");
  };

  const totalTaken = records.reduce((a, r) => a + r.taken, 0);
  const totalReturned = records.reduce((a, r) => a + r.returned, 0);

  if (loading) return <div className="p-8 text-center text-gray-400 font-bold">جاري التحميل...</div>;

  return (
    <div className="p-8 pb-20 bg-[#f9fafb] min-h-screen font-sans text-right" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">نقاط البيع (POS)</h1>
          <p className="text-gray-500 mt-2 font-medium">إدارة نقاط التوزيع، تسجيل التوريدات، وحساب الأرصدة</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowDepositForm(true)}
            className="flex items-center gap-2 px-6 py-4 bg-emerald-700 text-white rounded-[22px] font-bold hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/10 transform active:scale-95"
          >
            <span>$ شحن المحفظة</span>
          </button>
          <button
            onClick={() => setShowPOSForm(true)}
            className="flex items-center gap-2 px-6 py-4 bg-white text-amber-900 border-2 border-amber-100 rounded-[22px] font-bold hover:bg-amber-50 transition-all shadow-sm group"
          >
            <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>إضافة نقطة بيع</span>
          </button>
          <button
            onClick={() => setShowSupplyForm(true)}
            className="flex items-center gap-3 px-8 py-4 bg-amber-800 text-white rounded-[22px] font-bold hover:bg-amber-900 transition-all shadow-xl shadow-amber-900/20 group transform active:scale-95"
          >
            <span>تسجيل توريد جديد</span>
            <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">إجمالي الموزع اليوم</p>
           <h2 className="text-3xl font-black text-amber-800 font-sans">{records.filter(r => r.date === new Date().toISOString().split("T")[0]).reduce((a, r) => a + r.taken, 0).toLocaleString('en-US')} <span className="text-sm font-medium">قطعة</span></h2>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">إجمالي المرتجع اليوم</p>
           <h2 className="text-3xl font-black text-rose-600 font-sans">{records.filter(r => r.date === new Date().toISOString().split("T")[0]).reduce((a, r) => a + r.returned, 0).toLocaleString('en-US')} <span className="text-sm font-medium">قطعة</span></h2>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">إجمالي رصيد المحافظ</p>
           <h2 className="text-3xl font-black text-emerald-600 font-sans">{posList.reduce((acc, p) => acc + p.balance, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-medium">₪</span></h2>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">تحصيل اليوم المتوقع</p>
           <h2 className="text-3xl font-black text-amber-800 font-sans">{records.filter(r => r.date === new Date().toISOString().split("T")[0]).reduce((acc, r) => acc + (r.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-medium">₪</span></h2>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-2xl font-black text-gray-800 mb-6">نقاط التوزيع المستلمة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posList.map((pos) => (
            <div key={pos.id} className="bg-white p-8 rounded-[36px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 group">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h4 className="text-xl font-black text-gray-800 group-hover:text-amber-800 transition-colors">{pos.name}</h4>
                   <p className="text-gray-400 text-sm font-bold mt-1">{pos.contact}</p>
                 </div>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${pos.balance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                   {pos.balance >= 0 ? 'رصيد إيجابي' : 'مدين'}
                 </span>
               </div>
               <div className="flex items-center justify-between mt-4">
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">الرصيد الحالي</p>
                   <p className={`text-2xl font-black font-sans ${pos.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{pos.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</p>
                 </div>
                 <button 
                   onClick={() => fetchPosHistory(pos.id)}
                   className="px-6 py-3 bg-gray-50 text-gray-700 rounded-2xl font-bold hover:bg-amber-800 hover:text-white transition-all shadow-sm"
                 >
                   عرض السجل الكامل
                 </button>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30">
           <h3 className="text-xl font-bold text-gray-800">سجل التوريدات</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">نقطة البيع</th>
                <th className="px-8 py-6">الصنف</th>
                <th className="px-8 py-6">الكمية (صافي)</th>
                <th className="px-8 py-6">القيمة المالية</th>
                <th className="px-8 py-6">الرصيد المتبقي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((record) => (
                <tr key={record.id} className="group hover:bg-amber-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-gray-800">{record.pos_name}</p>
                    <p className="text-[10px] text-gray-400">{record.date}</p>
                  </td>
                  <td className="px-8 py-6">
                     <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{record.item}</span>
                  </td>
                  <td className="px-8 py-6 font-black text-gray-800 font-sans">{record.net.toLocaleString('en-US')}</td>
                  <td className="px-8 py-6 font-black text-rose-600 font-sans">{record.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</td>
                  <td className="px-8 py-6">
                     <span className="font-black text-emerald-600 text-lg font-sans">
                       {posList.find(p => p.id === record.pos_id)?.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showSupplyForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[48px] w-full max-w-xl p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-black">تسجيل توريد يومي</h2>
              <button onClick={() => { setShowSupplyForm(false); resetForm(); }} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddRecord} className="space-y-6 text-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-black mb-2 mr-1">نقطة البيع</label>
                  <select required value={selectedPOS} onChange={(e) => setSelectedPOS(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black text-right">
                    <option value="">اختر النقطة...</option>
                    {posList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2 mr-1">الصنف</label>
                  <select required value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black text-right">
                    <option value="">اختر الصنف...</option>
                    {breadTypes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                  <label className="block text-sm font-black text-black mb-4 text-center">الكمية المستلمة (التوريد)</label>
                  <input type="number" required value={quantityTaken} onChange={(e) => setQuantityTaken(e.target.value)}
                    className="w-full text-center text-3xl font-black bg-white border border-amber-200 rounded-2xl py-4 focus:outline-none focus:ring-4 focus:ring-amber-500/20 text-black" placeholder="0" />
                </div>
                <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100">
                  <label className="block text-sm font-black text-black mb-4 text-center">الكمية المرتجعة</label>
                  <input type="number" value={quantityReturned} onChange={(e) => setQuantityReturned(e.target.value)}
                    className="w-full text-center text-3xl font-black bg-white border border-rose-200 rounded-2xl py-4 focus:outline-none focus:ring-4 focus:ring-rose-500/20 text-black" placeholder="0" />
                </div>
              </div>
              {quantityTaken && selectedItem && (
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex justify-between items-center">
                   <div className="text-right">
                     <p className="font-bold text-emerald-900">إجمالي قيمة التوريد:</p>
                     <p className="text-xs text-emerald-600">سيتم خصمها من رصيد نقطة البيع</p>
                   </div>
                   <p className="text-3xl font-black text-emerald-700 font-sans">
                     {((Number(quantityTaken) - (Number(quantityReturned) || 0)) * (breadTypes.find(i => i.id === Number(selectedItem))?.price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                   </p>
                </div>
              )}
              <div className="pt-4">
                <button type="submit" className="w-full py-5 bg-amber-800 text-white rounded-[24px] font-black text-xl hover:bg-amber-900 transition-all shadow-2xl shadow-amber-900/30 transform active:scale-[0.98]">
                  تأكيد وحفظ السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDepositForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-black mb-8 text-right">شحن محفظة نقطة البيع</h2>
            <form onSubmit={handleDeposit} className="space-y-6 text-right">
              <div>
                <label className="block text-sm font-black text-black mb-2 mr-1">اختر نقطة البيع</label>
                <select required value={selectedPOS} onChange={(e) => setSelectedPOS(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-black text-right">
                  <option value="">اختر النقطة...</option>
                  {posList.map(p => <option key={p.id} value={p.id}>{p.name} (الرصيد: {p.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-4 text-center">المبلغ المراد شحنه</label>
                <input type="number" step="0.01" required value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-center text-4xl font-black bg-emerald-50/30 border border-emerald-100 rounded-[32px] py-8 text-emerald-800" placeholder="0.00" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-5 bg-emerald-700 text-white rounded-[24px] font-black text-xl hover:bg-emerald-800 shadow-2xl shadow-emerald-900/30 transform active:scale-95">تأكيد الشحن</button>
                <button type="button" onClick={() => { setShowDepositForm(false); setDepositAmount(""); setSelectedPOS(""); }} className="px-8 py-5 bg-gray-100 text-gray-500 rounded-[24px] font-black text-xl hover:bg-gray-200">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPOSForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] w-full max-w-md p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-black">نقطة بيع جديدة</h2>
              <button onClick={() => setShowPOSForm(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreatePOS} className="space-y-6 text-right">
              <div>
                <label className="block text-sm font-black text-black mb-2 mr-1">اسم نقطة البيع</label>
                <input type="text" required value={newPOSName} onChange={(e) => setNewPOSName(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-black" placeholder="مثلاً: سوبر ماركت الهدى" />
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-2 mr-1">رقم الهاتف / للتواصل</label>
                <input type="text" required value={newPOSPhone} onChange={(e) => setNewPOSPhone(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-black" placeholder="05xxxxxxx" />
              </div>
              <div className="pt-6">
                <button type="submit" className="w-full py-5 bg-amber-800 text-white rounded-[24px] font-black text-lg hover:bg-amber-900 shadow-xl shadow-amber-900/30 transform active:scale-[0.98]">حفظ نقطة البيع</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStatement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="text-right">
                <h2 className="text-3xl font-black text-black mb-2">كشف حساب نقطة البيع</h2>
                <p className="text-gray-500 font-bold">{posList.find(p => p.id === Number(selectedPOS))?.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => window.print()} className="px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all flex items-center gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2h6a2 2 0 002 2v4" /></svg>
                   طباعة
                </button>
                <button onClick={() => setShowStatement(false)} className="p-4 bg-gray-200/50 hover:bg-gray-200 rounded-2xl transition-all">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10">
               <table className="w-full text-right border-collapse">
                 <thead>
                   <tr className="text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                     <th className="pb-6 px-4">التاريخ</th>
                     <th className="pb-6 px-4">نوع الحركة</th>
                     <th className="pb-6 px-4">الصنف / الوصف</th>
                     <th className="pb-6 px-4">الكمية</th>
                     <th className="pb-6 px-4">القيمة</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {posTransactions.length > 0 ? posTransactions.map((tx) => (
                     <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors font-sans">
                       <td className="py-6 px-4 font-bold text-gray-500">{tx.date}</td>
                       <td className="py-6 px-4">
                         <span className={`px-4 py-2 rounded-xl text-xs font-black ${tx.type === 'supply' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                           {tx.type === 'supply' ? 'توريد خبز' : 'إيداع مالي'}
                         </span>
                       </td>
                       <td className="py-6 px-4 font-black text-gray-800 font-regular">{tx.item}</td>
                       <td className="py-6 px-4 font-black text-gray-800">{tx.quantity?.toLocaleString('en-US') || '-'}</td>
                       <td className={`py-6 px-4 font-black text-lg ${tx.type === 'supply' ? 'text-rose-600' : 'text-emerald-600'}`}>
                         {tx.type === 'supply' ? '-' : '+'}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                       </td>
                     </tr>
                   )) : (
                     <tr>
                       <td colSpan={5} className="py-20 text-center text-gray-400 font-bold">لا توجد حركات مسجلة لهذه النقطة حتى الآن</td>
                     </tr>
                   )}
                 </tbody>
               </table>
            </div>

            <div className="p-10 bg-black text-white flex justify-between items-center rounded-t-[40px]">
               <div className="text-right">
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">الرصيد الحالي في المحفظة</p>
                 <h3 className="text-4xl font-black font-sans">{posList.find(p => p.id === Number(selectedPOS))?.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</h3>
               </div>
               <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md">
                 <p className="text-xs font-bold text-emerald-400 mb-1">حالة الحساب</p>
                 <p className="text-xl font-black">نشط ومستقر</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
