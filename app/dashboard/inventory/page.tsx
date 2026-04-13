"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type InventoryItem = { id: number; name: string; stock: number; unit: string; threshold: number; last_updated: string };

export default function InventoryPage() {
  const [role, setRole] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showProductionForm, setShowProductionForm] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("كيلو");
  const [newItemThreshold, setNewItemThreshold] = useState("10");
  const [newQuantity, setNewQuantity] = useState("");

  // Production state
  const [producedQty, setProducedQty] = useState("");
  const [flourUsed, setFlourUsed] = useState("");
  const [selectedBread, setSelectedBread] = useState("");
  const [breadTypes, setBreadTypes] = useState<any[]>([]);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") || "admin";
    setRole(savedRole);
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const [invRes, breadRes] = await Promise.all([
      supabase.from("inventory").select("*").order("id"),
      supabase.from("bread_types").select("id, name").order("id")
    ]);
    if (invRes.data) setInventory(invRes.data);
    if (breadRes.data) setBreadTypes(breadRes.data);
    setLoading(false);
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNewItem) {
      // Create New Item
      const { error } = await supabase.from("inventory").insert({
        name: newItemName,
        stock: Number(newQuantity),
        unit: newItemUnit,
        threshold: Number(newItemThreshold),
        last_updated: new Date().toISOString()
      });
      
      if (!error) {
        fetchInventory();
        setShowForm(false);
        resetForm();
      }
      return;
    }

    // Update Existing Item
    const item = inventory.find(i => i.id === Number(selectedItemId));
    if (!item) return;

    const newStock = item.stock + Number(newQuantity);
    const { error } = await supabase.from("inventory")
      .update({ stock: newStock, last_updated: new Date().toISOString() })
      .eq("id", item.id);

    if (!error) {
      fetchInventory();
      setShowForm(false);
      resetForm();
    }
  };

  const handleRecordProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producedQty || !flourUsed) return;

    const { error: logErr } = await supabase.from("production_logs").insert({
      bread_type: selectedBread,
      quantity_produced: Number(producedQty),
      flour_used: Number(flourUsed),
      date: new Date().toISOString().split("T")[0]
    });

    if (!logErr) {
      // Deduct flour from inventory
      const flourItem = inventory.find(i => i.name.includes("طحين") || i.name.includes("Flour"));
      if (flourItem) {
        await supabase.from("inventory")
          .update({ stock: flourItem.stock - Number(flourUsed) })
          .eq("id", flourItem.id);
      }
      
      fetchInventory();
      setShowProductionForm(false);
      setProducedQty("");
      setFlourUsed("");
    }
  };

  const resetForm = () => {
    setSelectedItemId("");
    setNewItemName("");
    setNewQuantity("");
    setIsNewItem(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-400 font-bold">جاري التحميل...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-800">إدارة المخزون</h1>
          <p className="text-gray-500 font-bold mt-1">متابعة المواد الخام وتنبيهات النقص</p>
        </div>
        {role !== "worker" && (
          <div className="flex gap-4">
            <button
              onClick={() => setShowProductionForm(true)}
              className="px-6 py-4 bg-emerald-700 text-white rounded-[24px] font-bold hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/10 flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              <span>تسجيل الإنتاج اليومي</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-4 bg-amber-800 text-white rounded-[24px] font-bold hover:bg-amber-900 transition-all shadow-xl shadow-amber-900/20 flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>إضافة شحنة مخزون</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
             <h3 className="text-xl font-bold text-gray-800">قائمة المواد الخام</h3>
             <div className="flex gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-gray-400">تنبيهات نقص المخزون نشطة</span>
             </div>
          </div>
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
                <th className="px-8 py-6">المادة</th>
                <th className="px-8 py-6">الكمية المتوفرة</th>
                <th className="px-8 py-6">الحد الأدنى</th>
                <th className="px-8 py-6">آخر تحديث</th>
                <th className="px-8 py-6 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inventory.map((item) => {
                const isLow = item.stock <= item.threshold;
                return (
                  <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLow ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <span className="font-bold text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className={`text-lg font-black font-sans ${isLow ? 'text-red-600' : 'text-gray-800'}`}>
                          {item.stock.toLocaleString('en-US')} {item.unit}
                        </span>
                        {isLow && <span className="text-[10px] font-bold text-red-400">تحتاج لطلب فوري!</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-gray-400 font-bold font-sans">{item.threshold.toLocaleString('en-US')} {item.unit}</td>
                    <td className="px-8 py-6 text-gray-400 text-sm font-medium font-sans">
                      {new Date(item.last_updated).toLocaleDateString("en-US")}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <div className={`px-4 py-1.5 rounded-full text-[11px] font-black ${isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {isLow ? 'ناقص' : 'متوفر'}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 bg-gradient-to-br from-amber-600 to-amber-800 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">إجمالي بنود المخزون</h3>
                <h2 className="text-4xl font-black mb-4 tracking-tighter font-sans">{inventory.length.toLocaleString('en-US')} صنف</h2>
                <p className="text-amber-100/80 text-xs font-medium leading-relaxed">
                  <span className="font-sans">{inventory.filter(i => i.stock <= i.threshold).length.toLocaleString('en-US')}</span> أصناف تحت الحد الأدنى
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
           </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] w-full max-w-lg p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-black">{isNewItem ? 'إضافة صنف جديد' : 'تحديث المخزون'}</h2>
              <button onClick={() => setShowForm(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex gap-4 mb-8 bg-gray-100 p-2 rounded-2xl">
              <button 
                onClick={() => setIsNewItem(false)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${!isNewItem ? 'bg-white shadow-sm text-amber-900' : 'text-gray-400 font-medium'}`}
              >
                تحديث موجود
              </button>
              <button 
                onClick={() => setIsNewItem(true)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${isNewItem ? 'bg-white shadow-sm text-amber-900' : 'text-gray-400 font-medium'}`}
              >
                صنف جديد
              </button>
            </div>

            <form onSubmit={handleAddStock} className="space-y-6">
              {isNewItem ? (
                <>
                  <div>
                    <label className="block text-sm font-black text-black mb-2 mr-1">اسم المادة الخام الجديدة</label>
                    <input type="text" required value={newItemName} onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black" placeholder="مثلاً: طحين بر" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-black mb-2 mr-1">الوحدة</label>
                      <input type="text" required value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black" placeholder="كيلو، كيس..." />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-black mb-2 mr-1">الكمية الأولية</label>
                      <input type="number" required value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black" placeholder="0" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black mb-2 mr-1">حد التنبيه (Threshold)</label>
                    <input type="number" required value={newItemThreshold} onChange={(e) => setNewItemThreshold(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-black text-black mb-2 mr-1">اختر المادة الخام</label>
                    <select required value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black">
                      <option value="">اختر المادة...</option>
                      {inventory.map(i => <option key={i.id} value={i.id}>{i.name} (متوفر: {i.stock.toLocaleString('en-US')} {i.unit})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-black mb-2 mr-1">الكمية المضافة</label>
                      <input type="number" required value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-black mb-2 mr-1">الوحدة</label>
                      <input type="text" disabled
                        value={inventory.find(i => i.id === Number(selectedItemId))?.unit || "—"}
                        className="w-full px-5 py-4 bg-gray-100 border border-gray-100 rounded-2xl text-black font-bold" />
                    </div>
                  </div>
                </>
              )}
              <div className="pt-6">
                <button type="submit" className="w-full py-5 bg-amber-800 text-white rounded-[24px] font-black text-lg hover:bg-amber-900 transition-all shadow-xl shadow-amber-900/30 transform active:scale-[0.98]">
                  {isNewItem ? 'حفظ الصنف الجديد' : 'تأكيد الإضافة للمخزون'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProductionForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-black mb-8 text-right">تسجيل الإنتاج اليومي</h2>
            <form onSubmit={handleRecordProduction} className="space-y-6 text-right">
              <div>
                <label className="block text-sm font-black text-black mb-2 mr-1">نوع الخبز</label>
                <select required value={selectedBread} onChange={(e) => setSelectedBread(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-black text-right">
                   <option value="">اختر النوع...</option>
                   {breadTypes.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-black mb-2 mr-1">الكمية المنتجة (قطعة)</label>
                  <input type="number" required value={producedQty} onChange={(e) => setProducedQty(e.target.value)}
                    className="w-full px-5 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl font-bold text-emerald-900 text-center text-2xl" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2 mr-1">الطحين المستخدم (كجم)</label>
                  <input type="number" required value={flourUsed} onChange={(e) => setFlourUsed(e.target.value)}
                    className="w-full px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl font-bold text-blue-900 text-center text-2xl" placeholder="0" />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 py-5 bg-emerald-700 text-white rounded-[24px] font-black text-xl hover:bg-emerald-800 shadow-xl shadow-emerald-900/20">تأكيد التسجيل</button>
                <button type="button" onClick={() => setShowProductionForm(false)} className="px-8 py-5 bg-gray-100 text-gray-500 rounded-[24px] font-black text-xl hover:bg-gray-200">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
