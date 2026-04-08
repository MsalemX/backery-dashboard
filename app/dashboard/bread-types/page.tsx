"use client";

import { useState } from "react";

export default function BreadTypesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([
    { id: 1, name: "خبز بلدي", category: "تقليدي", price: "١.٥٠", image: "/bread/baladi.png", description: "خبز بلدي طازج مخبوز في فرن الحطب التقليدي." },
    { id: 2, name: "صمون", category: "تقليدي", price: "٢.٠٠", image: "/bread/samoon.png", description: "صمون طازج وهش، يتميز بشكل عصا الألماس الفريد." },
    { id: 3, name: "كرواسون", category: "معجنات", price: "٥.٠٠", image: "/bread/croissant.png", description: "كرواسون زبدة فرنسي فاخر بلمسة ذهبية وقوام هش." },
    { id: 4, name: "خبز فرنسي", category: "عالمي", price: "٣.٥٠", image: "/bread/baguette.png", description: "باجيت فرنسي مقرمش من الخارج وطري جداً من الداخل." },
  ]);

  const filteredItems = items.filter(item => 
    item.name.includes(searchTerm) || item.category.includes(searchTerm)
  );

  return (
    <div className="p-8 pb-20 bg-[#f9fafb] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">أنواع الخبز</h1>
          <p className="text-gray-500 mt-2 font-medium">إدارة قائمة الخبز، الأسعار، والأصناف المتوفرة</p>
        </div>

        <button className="flex items-center gap-3 px-8 py-4 bg-amber-800 text-white rounded-[22px] font-bold hover:bg-amber-900 transition-all shadow-xl shadow-amber-900/20 group">
          <span>إضافة نوع جديد</span>
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 flex gap-4">
        <div className="relative flex-1 max-w-md">
           <span className="absolute inset-y-0 right-4 flex items-center text-gray-400">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
           </span>
           <input 
             type="text" 
             placeholder="ابحث عن نوع خبز..."
             className="w-full pr-12 pl-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex gap-2">
           {["الكل", "تقليدي", "معجنات", "عالمي"].map((cat) => (
             <button 
               key={cat}
               className={`px-6 py-2 rounded-xl border font-bold text-sm transition-all ${
                 searchTerm === cat || (cat === "الكل" && searchTerm === "")
                 ? "bg-amber-100 border-amber-200 text-amber-900" 
                 : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
               }`}
               onClick={() => setSearchTerm(cat === "الكل" ? "" : cat)}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredItems.map((item) => (
          <div key={item.id} className="group bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2">
            <div className="h-56 relative overflow-hidden bg-gray-100">
               <img 
                 src={item.image} 
                 alt={item.name}
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
               />
               <div className="absolute top-4 right-4">
                  <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-black text-amber-900 shadow-sm border border-white">
                    {item.category}
                  </span>
               </div>
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
               
               <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors border border-gray-100">
                    تعديل
                  </button>
                  <button className="px-3 py-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors border border-rose-100 group/del">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
               </div>
            </div>
          </div>
        ))}

        {/* Empty State / Add Card */}
        <button className="h-full min-h-[400px] border-4 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center p-8 group hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-500">
           <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-100 group-hover:scale-110 transition-all">
             <svg className="w-8 h-8 text-gray-300 group-hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
             </svg>
           </div>
           <p className="text-gray-400 font-bold group-hover:text-amber-800 transition-colors">أضف نوعاً جديداً</p>
        </button>
      </div>
    </div>
  );
}
