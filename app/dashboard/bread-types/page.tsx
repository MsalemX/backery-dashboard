"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type BreadType = { id: number; name: string; price: string; description: string };

export default function BreadTypesPage() {
  const [role, setRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<BreadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", price: "", description: "" });

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") || "admin";
    setRole(savedRole);
    fetchBreadTypes();
  }, []);

  const fetchBreadTypes = async () => {
    setLoading(true);
    const { data } = await supabase.from("bread_types").select("*").order("id");
    if (data) setItems(data);
    setLoading(false);
  };

  const filteredItems = items.filter(item => item.name.includes(searchTerm));

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from("bread_types").insert({
      name: newItem.name,
      price: parseFloat(newItem.price),
      description: newItem.description,
    }).select();
    console.log("INSERT RESULT:", { data, error });
    if (!error) {
      fetchBreadTypes();
      setShowForm(false);
      setNewItem({ name: "", price: "", description: "" });
    } else {
      alert("خطأ: " + error.message + "\nCode: " + error.code);
    }
  };

  const handleDelete = async (id: number) => {
    await supabase.from("bread_types").delete().eq("id", id);
    setItems(items.filter(i => i.id !== id));
  };

  if (loading) return <div className="p-8 text-center text-gray-400 font-bold">جاري التحميل...</div>;

  return (
    <div className="p-8 pb-20 bg-[#f9fafb] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">أنواع الخبز</h1>
          <p className="text-gray-500 mt-2 font-medium">إدارة قائمة الخبز، الأسعار، والأصناف المتوفرة</p>
        </div>

        {role !== "worker" && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-3 px-8 py-4 bg-amber-800 text-white rounded-[22px] font-bold hover:bg-amber-900 transition-all shadow-xl shadow-amber-900/20 group"
          >
            <span>إضافة نوع جديد</span>
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      <div className="mb-8 flex gap-4">
        <div className="relative flex-1 max-w-md">
           <span className="absolute inset-y-0 right-4 flex items-center text-gray-400">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
           </span>
           <input
             type="text" placeholder="ابحث عن نوع خبز..."
             className="w-full pr-12 pl-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium text-black"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredItems.map((item) => (
          <div key={item.id} className="group bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2">
            <div className="h-40 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <span className="text-6xl">🍞</span>
            </div>
            <div className="p-8">
               <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-black text-gray-800">{item.name}</h3>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-700">{item.price}</span>
                    <span className="text-xs font-bold text-gray-400 mr-1">₪</span>
                  </div>
               </div>
               <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 line-clamp-2">
                 {item.description}
               </p>
               {role !== "worker" && (
                 <div className="flex gap-3">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors border border-rose-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                 </div>
               )}
            </div>
          </div>
        ))}

        {role !== "worker" && (
          <button
            onClick={() => setShowForm(true)}
            className="h-full min-h-[300px] border-4 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center p-8 group hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-500"
          >
             <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-100 group-hover:scale-110 transition-all">
               <svg className="w-8 h-8 text-gray-300 group-hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
               </svg>
             </div>
             <p className="text-gray-400 font-bold group-hover:text-amber-800 transition-colors">أضف نوعاً جديداً</p>
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[48px] w-full max-w-xl p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-black">إضافة نوع خبز جديد</h2>
              <button onClick={() => setShowForm(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-black mb-2 mr-1">اسم النوع</label>
                  <input type="text" required value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black"
                    placeholder="مثلاً: خبز بالسمسم" />
                </div>
                <div>
                  <label className="block text-sm font-black text-black mb-2 mr-1">السعر (₪)</label>
                  <input type="number" step="0.01" required value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black"
                    placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-black mb-2 mr-1">الوصف</label>
                <textarea value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black h-32 resize-none"
                  placeholder="وصف مختصر للنوع الجديد..." />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-5 bg-amber-800 text-white rounded-[24px] font-black text-xl hover:bg-amber-900 transition-all shadow-2xl shadow-amber-900/30 transform active:scale-[0.98]">
                  تأكيد الإضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
