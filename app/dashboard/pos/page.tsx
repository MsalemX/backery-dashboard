"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type POS = { id: number; name: string; location: string; contact: string; status: string };
type BreadType = { id: number; name: string };
type POSRecord = { id: number; pos_name: string; item: string; taken: number; returned: number; net: number; date: string };

export default function POSPage() {
  const [posList, setPosList] = useState<POS[]>([]);
  const [breadTypes, setBreadTypes] = useState<BreadType[]>([]);
  const [records, setRecords] = useState<POSRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [showSupplyForm, setShowSupplyForm] = useState(false);
  const [selectedPOS, setSelectedPOS] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantityTaken, setQuantityTaken] = useState("");
  const [quantityReturned, setQuantityReturned] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [posRes, breadRes, recRes] = await Promise.all([
      supabase.from("pos").select("*").order("id"),
      supabase.from("bread_types").select("id, name").order("id"),
      supabase.from("pos_records").select("*").order("created_at", { ascending: false }),
    ]);
    if (posRes.data) setPosList(posRes.data);
    if (breadRes.data) setBreadTypes(breadRes.data);
    if (recRes.data) setRecords(recRes.data);
    setLoading(false);
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const pos = posList.find(p => p.id === Number(selectedPOS));
    const item = breadTypes.find(i => i.id === Number(selectedItem));
    if (!pos || !item) return;

    const takenNum = Number(quantityTaken);
    const returnedNum = Number(quantityReturned) || 0;

    const { error } = await supabase.from("pos_records").insert({
      pos_id: pos.id,
      pos_name: pos.name,
      item: item.name,
      taken: takenNum,
      returned: returnedNum,
      date: new Date().toISOString().split("T")[0],
    });

    if (!error) {
      fetchData();
      setShowSupplyForm(false);
      resetForm();
    }
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
    <div className="p-8 pb-20 bg-[#f9fafb] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">نقاط البيع (POS)</h1>
          <p className="text-gray-500 mt-2 font-medium">تسجيل التوريدات اليومية، المرتجعات، وحساب الصافي لكل نقطة</p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">إجمالي الموزع</p>
           <h2 className="text-3xl font-black text-amber-800">{totalTaken.toLocaleString()} <span className="text-sm font-medium">قطعة</span></h2>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">إجمالي المرتجع</p>
           <h2 className="text-3xl font-black text-rose-600">{totalReturned.toLocaleString()} <span className="text-sm font-medium">قطعة</span></h2>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">الصافي المبيع</p>
           <h2 className="text-3xl font-black text-emerald-600">{(totalTaken - totalReturned).toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
           <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">نقاط البيع النشطة</p>
           <h2 className="text-3xl font-black text-blue-600">{posList.filter(p => p.status === 'نشط').length} / {posList.length}</h2>
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
                <th className="px-8 py-6">أخذ (توريد)</th>
                <th className="px-8 py-6">أعاد (مرتجع)</th>
                <th className="px-8 py-6">الصافي (مبيع)</th>
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
                  <td className="px-8 py-6 font-black text-gray-800">{record.taken}</td>
                  <td className="px-8 py-6 font-black text-rose-500">{record.returned}</td>
                  <td className="px-8 py-6">
                     <span className="font-black text-emerald-600 text-lg">{record.net}</span>
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
            <form onSubmit={handleAddRecord} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-black mb-2 mr-1">نقطة البيع</label>
                  <select required value={selectedPOS} onChange={(e) => setSelectedPOS(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black">
                    <option value="">اختر النقطة...</option>
                    {posList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2 mr-1">الصنف</label>
                  <select required value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black">
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
              {quantityTaken && (
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex justify-between items-center">
                   <p className="font-bold text-emerald-900">الصافي المحتسب (المبيعات):</p>
                   <p className="text-3xl font-black text-emerald-700">{Number(quantityTaken) - (Number(quantityReturned) || 0)}</p>
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
    </div>
  );
}
