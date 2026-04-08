"use client";

import { useState } from "react";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([
    { id: 1, name: "طحين فاخر", stock: 150, unit: "kg", threshold: 100, lastUpdated: "٢٠٢٤/٠٨/٠٨" },
    { id: 2, name: "سكر ناعم", stock: 85, unit: "kg", threshold: 50, lastUpdated: "٢٠٢٤/٠٨/٠٧" },
    { id: 3, name: "خميرة فورية", stock: 12, unit: "علبة", threshold: 20, lastUpdated: "٢٠٢٤/٠٨/٠٦" },
    { id: 4, name: "زبدة طبيعية", stock: 45, unit: "kg", threshold: 30, lastUpdated: "٢٠٢٤/٠٨/٠٨" },
    { id: 5, name: "ملح طعام", stock: 20, unit: "kg", threshold: 10, lastUpdated: "٢٠٢٤/٠٨/٠٥" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnit, setNewUnit] = useState("kg");

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedInv = inventory.map(item => {
      if (item.name === newItemName) {
        return { ...item, stock: item.stock + Number(newQuantity), lastUpdated: new Date().toLocaleDateString('ar-EG') };
      }
      return item;
    });

    // If it's a new item, add it (simplified for demo)
    const exists = inventory.find(i => i.name === newItemName);
    if (!exists) {
      setInventory([...inventory, {
        id: inventory.length + 1,
        name: newItemName,
        stock: Number(newQuantity),
        unit: newUnit,
        threshold: 20,
        lastUpdated: new Date().toLocaleDateString('ar-EG')
      }]);
    } else {
      setInventory(updatedInv);
    }

    setShowForm(false);
    setNewItemName("");
    setNewQuantity("");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-800">إدارة المخزون</h1>
          <p className="text-gray-500 font-bold mt-1">متابعة المواد الخام وتنبيهات النقص</p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory Table */}
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
                        <span className={`text-lg font-black ${isLow ? 'text-red-600' : 'text-gray-800'}`}>
                          {item.stock} {item.unit}
                        </span>
                        {isLow && <span className="text-[10px] font-bold text-red-400">تحتاج لطلب فوري!</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-gray-400 font-bold">{item.threshold} {item.unit}</td>
                    <td className="px-8 py-6 text-gray-400 text-sm font-medium">{item.lastUpdated}</td>
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

        {/* Recent Supply Logs & Stats */}
        <div className="space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 bg-gradient-to-br from-amber-600 to-amber-800 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">قيمة المخزون الإجمالية</h3>
                <h2 className="text-4xl font-black mb-4 tracking-tighter">١٤,٥٨٠ ₪</h2>
                <p className="text-amber-100/80 text-xs font-medium leading-relaxed">
                   * تم تقدير القيمة بناءً على آخر أسعار الشراء المسجلة للمواد الخام في المخازن.
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
           </div>

           <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 font-sans">آخر سجلات التوريد</h3>
              <div className="space-y-6">
                 {[
                   { name: "طحين فاخر", q: "٥٠٠ كجم", date: "اليوم، ٠٩:٤٥ ص", status: "مكتمل" },
                   { name: "سكر ناعم", q: "١٠٠ كجم", date: "أمس، ٣:٢٠ م", status: "مكتمل" },
                   { name: "خميرة فورية", q: "٢٠ علبة", date: "٥ أغسطس، ٠٨:١٠ ص", status: "مكتمل" },
                 ].map((log, i) => (
                   <div key={i} className="flex items-center gap-4 relative">
                      <div className="w-2 h-2 rounded-full bg-amber-500 absolute -right-4"></div>
                      <div className="flex-1">
                         <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-800 text-sm">{log.name}</h4>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded italic">{log.status}</span>
                         </div>
                         <p className="text-xs text-gray-400 font-medium">{log.q} • {log.date}</p>
                      </div>
                   </div>
                 ))}
                 <button className="w-full py-4 mt-6 bg-gray-50 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-colors">
                    مشاهدة السجل الكامل
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] w-full max-w-lg p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-gray-800">تحديث المخزون</h2>
              <button 
                onClick={() => setShowForm(false)}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddStock} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 mr-1">اسم المادة الخام</label>
                <select
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold"
                >
                  <option value="">اختر المادة...</option>
                  {inventory.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
                  <option value="new">+ إضافة مادة جديدة</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 mr-1">الكمية المضافة</label>
                  <input
                    type="number"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold"
                    placeholder="0.00"
                  />
                </div>
                <div>
                   <label className="block text-sm font-black text-gray-700 mb-2 mr-1">الوحدة</label>
                   <input
                    type="text"
                    disabled
                    value={inventory.find(i => i.name === newItemName)?.unit || "kg"}
                    className="w-full px-5 py-4 bg-gray-100 border border-gray-100 rounded-2xl text-gray-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 mr-1">المورد (اختياري)</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold"
                  placeholder="اسم الشركة الموردة..."
                />
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full py-5 bg-amber-800 text-white rounded-[24px] font-black text-lg hover:bg-amber-900 transition-all shadow-xl shadow-amber-900/30 transform active:scale-[0.98]"
                >
                  تأكيد الإضافة للمخزون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
