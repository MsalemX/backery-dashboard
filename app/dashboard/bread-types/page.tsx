"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type BreadType = {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  unit: string;
  image_url: string;
  created_at: string
};

export default function BreadTypesPage() {
  const [role, setRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<BreadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedItemHistory, setSelectedItemHistory] = useState<any[]>([]);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    description: "",
    stock: "0",
    unit: "كيلو",
    image_url: ""
  });

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") || "admin";
    setRole(savedRole);
    fetchBreadTypes();
  }, []);

  const fetchBreadTypes = async () => {
    setLoading(true);
    try {
      const data = await api.get('/bread-types');
      setItems(data);
    } catch (error) {
      console.error('Error fetching bread types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    let finalImageUrl = newItem.image_url;

    if (selectedFile) {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('name', newItem.name);

      try {
        const uploadBaseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${uploadBaseUrl}/upload-image`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          finalImageUrl = data.image_url || newItem.image_url;
        } else {
          const text = await response.text();
          throw new Error(text || 'Image upload failed');
        }
      } catch (error: any) {
        console.error('Error uploading image:', error);
        alert('خطأ في رفع الصورة: ' + (error?.message || error));
      }
    }

    try {
      await api.post('/bread-types', {
        name: newItem.name,
        price: Number(newItem.price),
        stock: Number(newItem.stock),
        unit: newItem.unit,
        description: newItem.description,
        image_url: finalImageUrl,
      });

      fetchBreadTypes();
      setShowForm(false);
      setNewItem({
        name: "",
        price: "",
        description: "",
        stock: "",
        unit: "كيلو",
        image_url: ""
      });
      setSelectedFile(null);
    } catch (err) {
      alert("خطأ في إضافة الصنف: " + err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateItem = async (item: BreadType) => {
    try {
      await api.put(`/bread-types/${item.id}`, {
        name: item.name,
        price: item.price,
        stock: item.stock,
        unit: item.unit,
        description: item.description,
        image_url: item.image_url,
      });

      fetchBreadTypes();
      setShowForm(false);
      setNewItem({
        name: "",
        price: "",
        description: "",
        stock: "",
        unit: "كيلو",
        image_url: ""
      });
    } catch (err) {
      alert("خطأ في تحديث الصنف: " + err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الصنف؟")) {
      try {
        await api.delete(`/bread-types/${id}`);
        fetchBreadTypes();
      } catch (error) {
        alert("خطأ في الحذف: " + error);
      }
    }
  };

  const fetchHistory = async (itemName: string) => {
    setSelectedItemName(itemName);
    setShowHistory(true);

    const [posRecs, custRecs] = await Promise.all([
      api.get(`/pos-records?item=${itemName}`),
      api.get(`/customer-transactions?item=${itemName}`)
    ]);

    const combined = [
      ...(posRecs.data || []).map((r: any) => ({ date: r.date, who: r.pos_name, type: 'نقطة بيع', qty: r.net })),
      ...(custRecs.data || []).map((r: any) => ({ date: r.date, who: 'زبون', type: 'شراء مباشر', qty: r.quantity }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setSelectedItemHistory(combined);
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-full h-full flex items-center justify-center">
                  <span className="text-6xl">🍞</span>
                </div>
              )}
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-xl text-[10px] font-black text-amber-900 shadow-sm">
                يُباع بـ <span className="text-sm font-sans">{item.unit}</span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-3 text-right" dir="rtl">
                <h3 className="text-xl font-black text-gray-800">{item.name}</h3>
                <div className="text-left">
                  <span className="text-2xl font-black text-amber-700 font-sans">{(item.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="text-xs font-bold text-gray-400 mr-1">₪</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4" dir="rtl">
                <div className={`px-3 py-1 rounded-lg text-[11px] font-black ${(item.stock ?? 0) > 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  المتوفر: <span className="font-sans">{(item.stock ?? 0).toLocaleString('en-US')}</span> {item.unit}
                </div>
                <div className="text-[10px] text-gray-400 font-bold font-sans">
                  أضيف في: {new Date(item.created_at).toLocaleDateString("en-US")}
                </div>
              </div>

              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 line-clamp-2 text-right">
                {item.description}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => fetchHistory(item.name)}
                  className="flex-1 py-3 bg-blue-50 text-blue-700 rounded-xl font-black text-xs hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  سجل التوزيع
                </button>
                {role !== "worker" && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors border border-rose-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[48px] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[calc(100vh-4rem)] overflow-hidden">
            <div className="max-h-[calc(100vh-4rem)] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-black">إضافة نوع خبز جديد</h2>
                <button onClick={() => setShowForm(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddItem} className="space-y-6 text-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-black mb-2 mr-1">اسم النوع</label>
                    <input type="text" required value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black"
                      placeholder="مثلاً: خبز بالسمسم" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black mb-2 mr-1">السعر (₪)</label>
                    <input type="number" step="0.01" required value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black"
                      placeholder="0.00" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-black mb-2 mr-1">الكمية المتوفرة</label>
                    <input type="number" required value={newItem.stock} onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black"
                      placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black mb-2 mr-1">الوحدة</label>
                    <select value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black appearance-none">
                      <option value="كيلو">كيلو</option>
                      <option value="كيس">كيس</option>
                      <option value="حبه">حبه</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-black mb-2 mr-1">رابط صورة الخبز (Image URL)</label>
                  <input type="url" value={newItem.image_url} onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black"
                    placeholder="https://example.com/image.jpg" />
                </div>

                <div>
                  <label className="block text-sm font-black text-black mb-2 mr-1">صورة المنتج (من الجهاز)</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-100 border-dashed rounded-[24px] cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="mb-2 text-sm text-gray-500 font-bold">{selectedFile ? selectedFile.name : 'اختر صورة للمنتج'}</p>
                        <p className="text-xs text-gray-400">PNG, JPG or WebP</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-black mb-2 mr-1">الوصف</label>
                  <textarea value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 font-bold text-black h-32 resize-none"
                    placeholder="وصف مختصر للنوع الجديد..." />
                </div>
                <div className="pt-6">
                  <button type="submit" disabled={uploading}
                    className="w-full py-5 bg-amber-800 text-white rounded-[24px] font-black text-lg hover:bg-amber-900 shadow-xl shadow-amber-900/30 transform active:scale-[0.98] disabled:opacity-50">
                    {uploading ? 'جاري الرفع والحفظ...' : 'حفظ النوع الجديد'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl p-10 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-8" dir="rtl">
              <h2 className="text-2xl font-black text-gray-800">سجل توزيع: {selectedItemName}</h2>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 text-right" dir="rtl">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4">التاريخ</th>
                    <th className="px-6 py-4">الجهة</th>
                    <th className="px-6 py-4">النوع</th>
                    <th className="px-6 py-4">الكمية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selectedItemHistory.map((h, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors font-sans">
                      <td className="px-6 py-4 text-gray-400 text-xs">{h.date}</td>
                      <td className="px-6 py-4 font-bold text-gray-800 text-sm font-regular">{h.who}</td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500 font-regular">{h.type}</td>
                      <td className="px-6 py-4 font-black text-amber-900 text-sm">{typeof h.qty === 'number' ? h.qty.toLocaleString('en-US') : h.qty}</td>
                    </tr>
                  ))}
                  {selectedItemHistory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold">لا توجد سجلات توزيع لهذا الصنف بعد</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
